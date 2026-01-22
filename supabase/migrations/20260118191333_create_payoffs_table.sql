CREATE TABLE IF NOT EXISTS  public.payoffs (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    uid UUID REFERENCES public.participants(uid) NOT NULL,
    participation_payoff NUMERIC,
    cq_payoff NUMERIC,
    game_payoff NUMERIC,
    bonus_payoff NUMERIC,
    total_payoff NUMERIC
);

ALTER TABLE public.payoffs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_payoffs_uid ON public.payoffs (uid);

CREATE POLICY "Allow self-selection of authenticated users"
    ON public.payoffs
    AS PERMISSIVE
    FOR SELECT
    TO authenticated
USING ((select auth.uid()) = uid);

CREATE OR REPLACE FUNCTION public.calculate_payoffs(uid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    participation_payoff NUMERIC := 0; -- Set participation payoff here
    cq_payoff NUMERIC;
    game_payoff NUMERIC;
    bonus_payoff NUMERIC;
BEGIN
    cq_payoff := public.calculate_cq_payoffs(uid);
    game_payoff := public.calculate_game_payoffs(uid);
    bonus_payoff := public.calculate_bonus_payoffs(uid);
    INSERT INTO public.payoffs (uid, participation_payoff, cq_payoff, game_payoff, bonus_payoff, total_payoff)
    VALUES (uid, participation_payoff, cq_payoff, game_payoff, bonus_payoff,
        participation_payoff + cq_payoff + game_payoff + bonus_payoff);
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_cq_score(cq_selections INT[])
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    total_choices INT;
    total_selections INT;
    cq_score NUMERIC;
BEGIN
    -- Current scoring method: score = 1 - (correct + incorrect)/total.
    total_choices := array_length(cq_selections, 1);
    if total_choices IS NULL OR total_choices = 0 THEN RETURN 0.0000; END IF;
    SELECT COUNT(*) INTO total_selections FROM unnest(cq_selections) AS ans WHERE ans != 0;
    cq_score :=  ROUND(1 - (total_selections::NUMERIC / total_choices::NUMERIC), 4);
    return cq_score;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_cq_payoffs(uid UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    cq_game_1 INT[];
    cq_game_2 INT[];
    total_cq_score NUMERIC;
    cq_rate NUMERIC := 0.10; -- Payoff rate per unit of CQ score
BEGIN
    SELECT cq_game_1, cq_game_2 INTO cq_game_1, cq_game_2 FROM public.participants WHERE uid = uid;
    SELECT ROUND(
        COALESCE(public.calculate_cq_score(cq_game_1), 0) +
        COALESCE(public.calculate_cq_score(cq_game_2), 0),
        4
        ) AS total_cq_score;
    RETURN total_cq_score * cq_rate;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_game_payoffs(uid UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    game_rate NUMERIC := 0.50; -- Payoff rate per unit of game score
    total_game_payoff NUMERIC;
BEGIN
    SELECT COALESCE(SUM(player_1_payoff), 0)
    INTO total_game_payoff
    FROM public.game_rounds
    WHERE player_1_uid = uid;
    RETURN total_game_payoff * game_rate;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_bonus_payoffs(uid UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    bonus_rate NUMERIC := 0.00; -- Payoff rate per unit of bonus score
    total_bonus_payoff NUMERIC;
BEGIN
    return 0.0000; -- Currently no bonus payoffs
END;
$$;
