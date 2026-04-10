-- Add custom questions to trainers and custom answers to leads
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS custom_questions JSONB;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS custom_answers JSONB;
