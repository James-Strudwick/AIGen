-- Form step analytics
CREATE TABLE IF NOT EXISTS form_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  step TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('entered', 'completed', 'abandoned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_form_events_trainer ON form_events(trainer_id);
CREATE INDEX IF NOT EXISTS idx_form_events_created ON form_events(created_at DESC);

-- Public insert for tracking
ALTER TABLE form_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can insert form events" ON form_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role full access form events" ON form_events FOR ALL USING (auth.role() = 'service_role');
