-- Challenges: packages can be marked as time-bound challenges (e.g.
-- "28-Day Shred", "12-Week Transformation") with a fixed duration,
-- start date, outcome promise, and optional cohort cap that decrements
-- as leads sign up.
ALTER TABLE packages ADD COLUMN IF NOT EXISTS is_challenge BOOLEAN DEFAULT false;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS challenge_duration_weeks INTEGER;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS challenge_start_date DATE;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS challenge_outcome TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS challenge_spots_total INTEGER;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS challenge_spots_remaining INTEGER;

-- Tracks whether we've already emailed the coach about a challenge
-- dropping below 5 spots so we don't spam them on every new signup.
ALTER TABLE packages ADD COLUMN IF NOT EXISTS low_spots_notified_at TIMESTAMPTZ;
