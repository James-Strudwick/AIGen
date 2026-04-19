-- Allow per-form customisation of the "About You" step so trainers can
-- toggle default fields (age / weight / experience) and add their own
-- custom questions for each goal.
ALTER TABLE forms ADD COLUMN IF NOT EXISTS about_config JSONB;
