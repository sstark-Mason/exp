CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

ALTER TABLE public.config ENABLE ROW LEVEL SECURITY;

INSERT INTO config (key, value) VALUES ('participant_quota', '10');

ALTER TABLE public.participants ADD completed_experiment BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_completed_participants ON public.participants (uid) WHERE user_role = 'participant' AND completed_experiment = true;

CREATE OR REPLACE FUNCTION check_if_within_participant_quota()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    participant_quota INT;
    participant_count INT;
BEGIN
    SELECT value::INT INTO participant_quota FROM config WHERE key = 'participant_quota';
    SELECT COUNT(*) INTO participant_count FROM participants WHERE user_role = 'participant' AND completed_experiment = true;
    RETURN participant_count <= participant_quota;
END;
$$;
