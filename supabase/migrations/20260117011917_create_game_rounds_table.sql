CREATE TABLE IF NOT EXISTS public.game_rounds (
    rid BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_role user_role NOT NULL,
    created_at_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at_time TIMESTAMPTZ,
    round_number INT NOT NULL,
    player_1_uid UUID REFERENCES public.participants(uid) NOT NULL DEFAULT auth.uid(),
    player_1_avatar TEXT NOT NULL,
    player_2_avatar TEXT NOT NULL,
    choice_option_1 TEXT NOT NULL,
    choice_option_2 TEXT NOT NULL,
    outcome_c1c1 INT[] NOT NULL,
    outcome_c2c2 INT[] NOT NULL,
    outcome_c1c2 INT[] NOT NULL,
    outcome_c2c1 INT[] NOT NULL,
    player_1_chose TEXT NOT NULL,
    player_2_chose TEXT,
    player_1_payoff INT,
    matched_rid BIGINT
);

ALTER TABLE public.game_rounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow self round insertion by authenticated users"
    ON public.game_rounds
    AS PERMISSIVE
    FOR INSERT
    TO authenticated
WITH CHECK ((select auth.uid()) = player_1_uid);

CREATE POLICY "Allow self round selection by authenticated users"
    ON public.game_rounds
    AS PERMISSIVE
    FOR SELECT
    TO authenticated
USING ((select auth.uid()) = player_1_uid);

CREATE INDEX IF NOT EXISTS idx_game_rounds_player_1_uid ON public.game_rounds (player_1_uid);

CREATE INDEX IF NOT EXISTS idx_game_rounds_matching ON public.game_rounds (player_1_avatar, player_2_avatar, choice_option_1, choice_option_2, user_role)
    INCLUDE (rid, player_1_uid, player_1_chose);

CREATE INDEX IF NOT EXISTS idx_game_rounds_unmatched ON public.game_rounds (player_1_avatar, player_2_avatar, choice_option_1, choice_option_2, user_role)
    INCLUDE (player_1_uid, player_1_chose, outcome_c1c1, outcome_c2c2, outcome_c1c2, outcome_c2c1)
    WHERE completed_at_time IS NULL;

CREATE OR REPLACE FUNCTION public.find_matching_round(unmatched public.game_rounds)
RETURNS TABLE (
    rid BIGINT,
    player_1_chose TEXT,
    player_1_uid UUID
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT match.rid, match.player_1_chose, match.player_1_uid
    FROM public.game_rounds AS match
    WHERE match.player_1_avatar = unmatched.player_2_avatar
        AND match.player_2_avatar = unmatched.player_1_avatar
        AND match.choice_option_1 = unmatched.choice_option_2
        AND match.choice_option_2 = unmatched.choice_option_1
        AND match.user_role = unmatched.user_role
        AND match.player_1_uid != unmatched.player_1_uid
    ORDER BY random()
    LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.complete_game_round(this public.game_rounds)
RETURNS public.game_rounds
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    match RECORD;
BEGIN
    match := public.find_matching_round(this);
    IF match IS NOT NULL then
        this.completed_at_time := now();
        this.matched_rid := match.rid;
        this.player_2_chose := match.player_1_chose;
        this.player_1_payoff := CASE
            WHEN this.player_1_chose = match.player_1_chose AND this.player_1_chose = this.choice_option_1 THEN this.outcome_c1c1[1]
            WHEN this.player_1_chose = match.player_1_chose AND this.player_1_chose = this.choice_option_2 THEN this.outcome_c2c2[1]
            WHEN this.player_1_chose != match.player_1_chose AND this.player_1_chose = this.choice_option_1 THEN this.outcome_c1c2[1]
            WHEN this.player_1_chose != match.player_1_chose AND this.player_1_chose = this.choice_option_2 THEN this.outcome_c2c1[1]
            ELSE -1 -- error case
        END;
    END IF;
    RETURN this;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_game_round_before_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.user_role IS NULL THEN
        SELECT user_role INTO NEW.user_role
        FROM public.participants
        WHERE uid = NEW.player_1_uid;
        IF NOT FOUND THEN
            NEW.user_role := 'unknown';
        END IF;
    END IF;
    NEW := public.complete_game_round(NEW);
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_complete_game_round_before_insert
BEFORE INSERT ON public.game_rounds
FOR EACH ROW
EXECUTE FUNCTION public.complete_game_round_before_insert();

CREATE OR REPLACE FUNCTION public.retry_unmatched_rounds()
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    WITH matched_pairs AS (
        SELECT DISTINCT ON (unmatched.rid)
            unmatched.rid AS unmatched_rid,
            match.rid AS match_rid,
            match.player_1_chose AS match_chose
        FROM public.game_rounds AS unmatched
        INNER JOIN public.game_rounds AS match ON
            unmatched.player_1_avatar = match.player_2_avatar
            AND unmatched.player_2_avatar = match.player_1_avatar
            AND unmatched.choice_option_1 = match.choice_option_2
            AND unmatched.choice_option_2 = match.choice_option_1
            AND unmatched.player_1_uid != match.player_1_uid
            AND unmatched.user_role = match.user_role
        WHERE unmatched.completed_at_time IS NULL
        ORDER BY unmatched.rid, random()
    )
    UPDATE public.game_rounds AS unmatched
    SET
        completed_at_time = now(),
        matched_rid = mp.match_rid,
        player_2_chose = mp.match_chose,
        player_1_payoff = CASE
            WHEN unmatched.player_1_chose = mp.match_chose AND unmatched.player_1_chose = unmatched.choice_option_1 THEN unmatched.outcome_c1c1[1]
            WHEN unmatched.player_1_chose = mp.match_chose AND unmatched.player_1_chose = unmatched.choice_option_2 THEN unmatched.outcome_c2c2[1]
            WHEN unmatched.player_1_chose != mp.match_chose AND unmatched.player_1_chose = unmatched.choice_option_1 THEN unmatched.outcome_c1c2[1]
            WHEN unmatched.player_1_chose != mp.match_chose AND unmatched.player_1_chose = unmatched.choice_option_2 THEN unmatched.outcome_c2c1[1]
            ELSE -1 -- error case
        END
    FROM matched_pairs AS mp
    WHERE unmatched.rid = mp.unmatched_rid;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_user_role_for_game_rounds()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF (OLD.user_role IS DISTINCT FROM NEW.user_role) THEN
        UPDATE public.game_rounds
        SET user_role = NEW.user_role
        WHERE player_1_uid = NEW.uid;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_user_role_for_game_rounds
AFTER UPDATE OF user_role ON public.participants
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_role_for_game_rounds();
