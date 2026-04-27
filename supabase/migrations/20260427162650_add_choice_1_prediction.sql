ALTER TABLE public.game_rounds
    ADD COLUMN IF NOT EXISTS prediction_choice_1 integer;