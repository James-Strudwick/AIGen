-- Add branding JSONB column to trainers
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS branding JSONB;
