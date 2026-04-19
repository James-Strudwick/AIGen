-- Tiered referral rewards: track highest tier reached and Pro trial expiry.
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS referral_tier_reached INTEGER DEFAULT 0;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS pro_trial_ends_at TIMESTAMPTZ;
