-- Add services and copy JSONB columns to trainers
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS services JSONB;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS copy JSONB;
