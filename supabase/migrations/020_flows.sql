-- Flows: multiple standalone intake forms per trainer, each with its own
-- URL slug and fully independent configuration. The trainer's existing
-- page at /[trainer-slug] is the "default flow" and uses trainer-level
-- settings directly (no row in this table). Additional flows live here
-- and override goals, questions, specialties, services, packages, copy,
-- and about-config independently.
--
-- Per-goal form overrides (the `forms` table) only apply to the default
-- flow. Additional flows are self-contained — no nested overrides.
CREATE TABLE IF NOT EXISTS flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  goals JSONB,
  questions JSONB,
  specialties JSONB,
  services JSONB,
  packages JSONB,
  copy JSONB,
  about_config JSONB,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (trainer_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_flows_trainer ON flows(trainer_id);

ALTER TABLE flows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access flows" ON flows FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Public can view active flows" ON flows FOR SELECT USING (active = true);
