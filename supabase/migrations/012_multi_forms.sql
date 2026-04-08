-- Multi-form support for Pro tier
CREATE TABLE IF NOT EXISTS forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  goal_id TEXT NOT NULL,
  name TEXT NOT NULL,
  questions JSONB,
  services JSONB,
  packages JSONB,
  copy JSONB,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_forms_trainer ON forms(trainer_id);

ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access forms" ON forms FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Public can view active forms" ON forms FOR SELECT USING (active = true);

-- Tag leads with which form they came from
ALTER TABLE leads ADD COLUMN IF NOT EXISTS form_id UUID REFERENCES forms(id);
