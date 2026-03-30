ALTER TABLE public.participants
    ADD COLUMN IF NOT EXISTS device_type TEXT,
    ADD COLUMN IF NOT EXISTS operating_system TEXT,
    ADD COLUMN IF NOT EXISTS browser TEXT,
    ADD COLUMN IF NOT EXISTS browser_version TEXT,
    ADD COLUMN IF NOT EXISTS user_agent TEXT;