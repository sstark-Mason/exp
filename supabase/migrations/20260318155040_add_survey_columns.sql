ALTER TABLE public.participants
    ADD COLUMN IF NOT EXISTS identify_female REAL,
    ADD COLUMN IF NOT EXISTS identify_male REAL,
    ADD COLUMN IF NOT EXISTS gender_factors JSONB,
    ADD COLUMN IF NOT EXISTS self_gender_norms_follow REAL,
    ADD COLUMN IF NOT EXISTS self_gender_norms_useful REAL,
    ADD COLUMN IF NOT EXISTS self_gender_norms_fair REAL,
    ADD COLUMN IF NOT EXISTS other_gender_norms_follow REAL,
    ADD COLUMN IF NOT EXISTS other_gender_norms_useful REAL,
    ADD COLUMN IF NOT EXISTS other_gender_norms_fair REAL,
    ADD COLUMN IF NOT EXISTS other_gender_norms_follow_alloc JSONB,
    ADD COLUMN IF NOT EXISTS other_gender_norms_useful_alloc JSONB,
    ADD COLUMN IF NOT EXISTS other_gender_norms_fair_alloc JSONB,
    ADD COLUMN IF NOT EXISTS
    
