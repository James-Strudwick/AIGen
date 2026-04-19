-- Trainer's chosen display currency (affects package/service prices shown
-- to prospects and inside the settings editors). Our own subscription
-- billing stays in GBP regardless.
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'GBP';
