-- Add specialties to trainers, make email optional and phone required on leads

ALTER TABLE trainers ADD COLUMN IF NOT EXISTS specialties JSONB;

-- Update leads: make email nullable, phone not null
ALTER TABLE leads ALTER COLUMN email DROP NOT NULL;
ALTER TABLE leads ALTER COLUMN phone SET NOT NULL;

-- Update demo PT with specialties (simple name + description)
UPDATE trainers
SET specialties = '[
  {
    "name": "Body Transformation",
    "description": "Proven 12-week transformation programmes combining progressive overload with nutrition periodisation. Clients typically see 2x faster results than training alone."
  },
  {
    "name": "Strength & Conditioning",
    "description": "Structured strength programming using conjugate and linear periodisation methods. Builds functional strength that transfers to everyday life."
  },
  {
    "name": "Nutrition Coaching",
    "description": "Personalised macro targets and meal guidance included with all packages. This is what accelerates fat loss and muscle gain beyond what training alone can achieve."
  },
  {
    "name": "Accountability & Habit Building",
    "description": "Weekly check-ins, progress tracking, and mindset coaching. Clients who work with a coach are 3x more likely to stick with their programme."
  }
]'::jsonb
WHERE slug = 'demo-pt';
