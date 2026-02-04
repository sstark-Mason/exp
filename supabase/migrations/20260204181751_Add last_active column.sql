ALTER TABLE public.participants
    ADD COLUMN last_active timestamptz NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION public.update_last_active()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    NEW.last_active = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_last_active
BEFORE UPDATE ON public.participants
FOR EACH ROW
WHEN (OLD.* IS DISTINCT FROM NEW.*)
EXECUTE FUNCTION public.update_last_active();