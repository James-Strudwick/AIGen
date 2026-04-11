-- Allow per-form specialty overrides so Pro trainers can show different
-- specialties depending on which goal a prospect picks.
ALTER TABLE forms ADD COLUMN IF NOT EXISTS specialties JSONB;
