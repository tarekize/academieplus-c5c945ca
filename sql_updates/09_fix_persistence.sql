-- Enable RLS on the table if not already enabled
ALTER TABLE student_scores ENABLE ROW LEVEL SECURITY;

-- Add usage permissions
GRANT ALL ON TABLE student_scores TO authenticated;

-- Grant usage on sequence only if it exists (for SERIAL id columns)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.sequences
        WHERE sequence_name = 'student_scores_id_seq'
    ) THEN
        EXECUTE 'GRANT USAGE, SELECT ON SEQUENCE student_scores_id_seq TO authenticated';
    END IF;
END $$;

-- Policy for SELECT: Users can view their own scores
DROP POLICY IF EXISTS "Users can view their own scores" ON student_scores;
CREATE POLICY "Users can view their own scores" 
ON student_scores FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Policy for INSERT: Users can insert their own scores
DROP POLICY IF EXISTS "Users can insert their own scores" ON student_scores;
CREATE POLICY "Users can insert their own scores" 
ON student_scores FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE: Users can update their own scores
DROP POLICY IF EXISTS "Users can update their own scores" ON student_scores;
CREATE POLICY "Users can update their own scores" 
ON student_scores FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Ensure the assessment_data column exists and is JSONB
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'student_scores' 
        AND column_name = 'assessment_data'
    ) THEN
        ALTER TABLE student_scores 
        ADD COLUMN assessment_data JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Fix any existing NULL rows
UPDATE student_scores 
SET assessment_data = '{}'::jsonb 
WHERE assessment_data IS NULL;
