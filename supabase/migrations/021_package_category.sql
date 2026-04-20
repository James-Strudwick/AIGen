-- Package categories (Beginner / Intermediate / Elite) for grouping
-- online programme tiers on the results page.
ALTER TABLE packages ADD COLUMN IF NOT EXISTS category TEXT;
