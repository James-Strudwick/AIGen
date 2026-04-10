ALTER TABLE trainers ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'starter' CHECK (tier IN ('starter', 'pro'));
