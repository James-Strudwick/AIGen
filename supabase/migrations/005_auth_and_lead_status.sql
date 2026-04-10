-- Link trainers to Supabase Auth users
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_trainers_user ON trainers(user_id);

-- Add lead status tracking
ALTER TABLE leads ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'form_completed'
  CHECK (status IN ('form_completed', 'whatsapp_sent', 'call_booked', 'converted'));
ALTER TABLE leads ADD COLUMN IF NOT EXISTS whatsapp_clicked_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS booking_clicked_at TIMESTAMPTZ;

-- Allow authenticated trainers to read their own leads
CREATE POLICY "Trainers can view own leads"
  ON leads FOR SELECT
  USING (
    trainer_id IN (
      SELECT id FROM trainers WHERE user_id = auth.uid()
    )
  );

-- Allow authenticated trainers to update their own trainer record
CREATE POLICY "Trainers can update own profile"
  ON trainers FOR UPDATE
  USING (user_id = auth.uid());

-- Allow authenticated trainers to read own profile
CREATE POLICY "Trainers can read own profile"
  ON trainers FOR SELECT
  USING (user_id = auth.uid());

-- Allow insert for signup (service role handles this)
