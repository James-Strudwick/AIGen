-- Add referral system
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS referred_by TEXT;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS has_referral_discount BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_trainers_referral_code ON trainers(referral_code);
