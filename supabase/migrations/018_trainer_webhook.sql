-- Outbound webhook URL: when set, every new lead POSTs a JSON payload
-- to this URL so trainers can plug FomoForms into HighLevel, Zapier,
-- Make, n8n, Slack, or any custom backend.
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS webhook_url TEXT;
