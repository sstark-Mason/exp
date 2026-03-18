CREATE TABLE IF NOT EXISTS public.feedback (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    uid UUID REFERENCES public.participants(uid) NOT NULL,
    target_id TEXT NOT NULL,
    metrics JSONB,
    comments TEXT
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.feedback
    ADD CONSTRAINT feedback_unique_target_per_user UNIQUE (uid, target_id);

CREATE POLICY "Allow self-selection of authenticated users"
    ON public.feedback
    AS PERMISSIVE
    FOR SELECT
    TO authenticated
USING ((select auth.uid()) = uid);

CREATE POLICY "Allow self-insertion of authenticated users"
    ON public.feedback
    AS PERMISSIVE
    FOR INSERT
    TO authenticated
WITH CHECK ((select auth.uid()) = uid);

CREATE POLICY "Allow self-updates of authenticated users"
    ON public.feedback
    AS PERMISSIVE
    FOR UPDATE
    TO authenticated
USING ((select auth.uid()) = uid);