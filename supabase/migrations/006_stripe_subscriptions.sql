-- Add Stripe fields to trainers
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none'
  CHECK (subscription_status IN ('none', 'active', 'past_due', 'cancelled'));
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;
