ALTER TABLE public.game_rounds
    RENAME COLUMN created_at_time TO inserted_at_time;

ALTER TABLE public.game_rounds
    ADD COLUMN IF NOT EXISTS time_elapsed_seconds real;

ALTER TABLE public.game_rounds
    ADD CONSTRAINT unique_player_round UNIQUE (player_1_uid, round_number);