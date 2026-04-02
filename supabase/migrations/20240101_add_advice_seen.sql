-- Add advice_seen column to learning_styles table
-- This column tracks whether the student has seen their AI-generated advice

ALTER TABLE learning_styles 
ADD COLUMN IF NOT EXISTS advice_seen BOOLEAN DEFAULT false;

COMMENT ON COLUMN learning_styles.advice_seen IS 'Tracks whether the student has seen their AI-generated level assessment advice';
