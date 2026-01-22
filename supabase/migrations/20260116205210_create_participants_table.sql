CREATE TYPE user_role AS ENUM ('tester', 'participant', 'unspecified');

CREATE TABLE IF NOT EXISTS public.participants (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_role user_role NOT NULL DEFAULT 'unspecified',
    uid UUID NOT NULL DEFAULT auth.uid() UNIQUE,
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    pid TEXT,
    screening_passed BOOLEAN,
    cq_game_1 INT[],
    cq_game_2 INT[]
);

ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow self-insertion of authenticated users"
    ON public.participants
    AS PERMISSIVE
    FOR INSERT
    TO authenticated
WITH CHECK ((auth.uid() = uid));

CREATE POLICY "Allow self-selection of authenticated users"
    ON public.participants
    AS PERMISSIVE
    FOR SELECT
    TO authenticated
USING ((auth.uid() = uid));

CREATE POLICY "Allow self-updates of authenticated users"
    ON public.participants
    AS PERMISSIVE
    FOR UPDATE
    TO authenticated
USING ((auth.uid() = uid))
WITH CHECK ((auth.uid() = uid));

REVOKE UPDATE (user_role) ON public.participants FROM authenticated;