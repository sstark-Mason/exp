ALTER TABLE public.participants RENAME COLUMN cq_game_1 TO cq_1_1;
ALTER TABLE public.participants RENAME COLUMN cq_game_2 TO cq_1_2;

ALTER TABLE public.participants
    ADD COLUMN IF NOT EXISTS cq_1_3 INT[],
    ADD COLUMN IF NOT EXISTS cq_1_4 INT[],
    ADD COLUMN IF NOT EXISTS cq_1_5 INT[],
    ADD COLUMN IF NOT EXISTS cq_1_6 INT[],
    ADD COLUMN IF NOT EXISTS cq_1_7 INT[];