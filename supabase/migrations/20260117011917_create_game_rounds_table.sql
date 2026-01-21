CREATE TABLE IF NOT EXISTS public.game_rounds (
    rid BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at_time TIMESTAMPTZ,
    player_1_uid UUID REFERENCES public.subjects(uid) NOT NULL DEFAULT auth.uid(),
    player_1_avatar TEXT NOT NULL,
    player_2_avatar TEXT NOT NULL,
    choice_option_1 TEXT NOT NULL,
    choice_option_2 TEXT NOT NULL,
    choice_payoff_1 INT NOT NULL,
    choice_payoff_2 INT NOT NULL,
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
WITH CHECK ((auth.uid() = player_1_uid));

CREATE POLICY "Allow self round selection by authenticated users"
    ON public.game_rounds
    AS PERMISSIVE
    FOR SELECT
    TO authenticated
USING ((auth.uid() = player_1_uid));

CREATE INDEX IF NOT EXISTS idx_game_rounds_matching ON public.game_rounds (player_1_avatar, player_2_avatar, choice_option_1, choice_option_2)
    INCLUDE (rid, player_1_uid, player_1_chose);
CREATE INDEX IF NOT EXISTS idx_game_rounds_unmatched ON public.game_rounds (player_1_avatar, player_2_avatar, choice_option_1, choice_option_2)
    INCLUDE (player_1_uid, player_1_chose, choice_payoff_1, choice_payoff_2)
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
            WHEN this.player_1_chose = match.player_1_chose THEN
                CASE
                    WHEN this.player_1_chose = this.choice_option_1 THEN this.choice_payoff_1
                    WHEN this.player_1_chose = this.choice_option_2 THEN this.choice_payoff_2
                    ELSE -1 -- If this happens, something has gone wrong upstream
                END
            ELSE 0 -- Players failed to coordinate
        END;
    END IF;
    RETURN this;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_game_round_before_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
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
        WHERE unmatched.completed_at_time IS NULL
        ORDER BY unmatched.rid, random()
    )
    UPDATE public.game_rounds AS unmatched
    SET
        completed_at_time = now(),
        matched_rid = mp.match_rid,
        player_2_chose = mp.match_chose,
        player_1_payoff = CASE
            WHEN unmatched.player_1_chose = mp.match_chose THEN
                CASE
                    WHEN unmatched.player_1_chose = unmatched.choice_option_1 THEN unmatched.choice_payoff_1
                    WHEN unmatched.player_1_chose = unmatched.choice_option_2 THEN unmatched.choice_payoff_2
                    ELSE -1 -- If this happens, something has gone wrong upstream
                END
            ELSE 0 -- Players failed to coordinate
        END
    FROM matched_pairs AS mp
    WHERE unmatched.rid = mp.unmatched_rid;
END;
$$;
