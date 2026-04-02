-- Add columns for periodic advice functionality
-- This enables:
-- 1. Tracking when the report was first shown (to auto-hide after 2 minutes)
-- 2. Tracking when the last periodic advice was generated (every 10 days)
-- 3. Storing the periodic advice message

ALTER TABLE learning_styles
ADD COLUMN IF NOT EXISTS report_first_shown_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_advice_generated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS periodic_advice JSONB;

COMMENT ON COLUMN learning_styles.report_first_shown_at IS 'Timestamp when the AI report was first displayed to the student';
COMMENT ON COLUMN learning_styles.last_advice_generated_at IS 'Timestamp when the last periodic (10-day) advice was generated';
COMMENT ON COLUMN learning_styles.periodic_advice IS 'JSON containing periodic advice message with level, advice, and generated_at fields';
