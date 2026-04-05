-- PT Goal Calculator — Initial Schema

-- Trainers table
CREATE TABLE trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  brand_color_primary TEXT NOT NULL DEFAULT '#FF6B35',
  brand_color_secondary TEXT NOT NULL DEFAULT '#1A1A2E',
  booking_link TEXT NOT NULL,
  contact_method TEXT NOT NULL CHECK (contact_method IN ('whatsapp', 'email', 'calendly', 'link')),
  contact_value TEXT NOT NULL,
  logo_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Packages table
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sessions_per_week INTEGER NOT NULL,
  price_per_session NUMERIC,
  monthly_price NUMERIC,
  description TEXT,
  is_online BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('weight_loss', 'muscle_gain', 'fitness', 'performance')),
  current_weight_kg NUMERIC,
  goal_weight_kg NUMERIC,
  age INTEGER,
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  available_days_per_week INTEGER,
  generated_timeline JSONB,
  selected_package_id UUID REFERENCES packages(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_trainers_slug ON trainers(slug);
CREATE INDEX idx_packages_trainer ON packages(trainer_id);
CREATE INDEX idx_leads_trainer ON leads(trainer_id);
CREATE INDEX idx_leads_created ON leads(created_at DESC);

-- Row Level Security
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Public read access for active trainers
CREATE POLICY "Public can view active trainers"
  ON trainers FOR SELECT
  USING (active = true);

-- Public read access for packages of active trainers
CREATE POLICY "Public can view packages"
  ON packages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM trainers WHERE trainers.id = packages.trainer_id AND trainers.active = true
  ));

-- Public can insert leads
CREATE POLICY "Public can create leads"
  ON leads FOR INSERT
  WITH CHECK (true);

-- Service role can do everything (for admin)
CREATE POLICY "Service role full access trainers"
  ON trainers FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access packages"
  ON packages FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access leads"
  ON leads FOR ALL
  USING (auth.role() = 'service_role');

-- Demo data
INSERT INTO trainers (slug, name, bio, brand_color_primary, brand_color_secondary, booking_link, contact_method, contact_value)
VALUES (
  'demo-pt',
  'Alex Thompson',
  'Certified PT with 8 years experience. Specialising in body transformation and strength training.',
  '#FF6B35',
  '#1A1A2E',
  'https://calendly.com/demo',
  'whatsapp',
  '+447700000000'
);

INSERT INTO packages (trainer_id, name, sessions_per_week, price_per_session, monthly_price, sort_order)
VALUES
  ((SELECT id FROM trainers WHERE slug = 'demo-pt'), '1x Per Week', 1, 45, 180, 1),
  ((SELECT id FROM trainers WHERE slug = 'demo-pt'), '2x Per Week', 2, 40, 320, 2),
  ((SELECT id FROM trainers WHERE slug = 'demo-pt'), '3x Per Week', 3, 35, 420, 3);

INSERT INTO packages (trainer_id, name, sessions_per_week, monthly_price, is_online, sort_order)
VALUES
  ((SELECT id FROM trainers WHERE slug = 'demo-pt'), 'Online Coaching', 0, 150, true, 4);
