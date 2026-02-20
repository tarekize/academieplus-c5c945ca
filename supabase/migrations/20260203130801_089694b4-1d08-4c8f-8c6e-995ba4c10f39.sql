-- Drop existing enum and create new one with updated values
-- First, we need to handle the existing data

-- Create new enum type
CREATE TYPE school_level_new AS ENUM (
  '5eme_primaire',
  '1ere_cem',
  '2eme_cem',
  '3eme_cem',
  '4eme_cem',
  'premiere',
  'seconde',
  'terminale'
);

-- Update existing profiles to map old values to new ones
UPDATE profiles SET school_level = NULL WHERE school_level IS NOT NULL;

-- Alter the column to use text temporarily
ALTER TABLE profiles ALTER COLUMN school_level TYPE text USING school_level::text;

-- Drop old enum
DROP TYPE IF EXISTS school_level;

-- Rename new enum to the original name
ALTER TYPE school_level_new RENAME TO school_level;

-- Alter the column back to use the new enum
ALTER TABLE profiles ALTER COLUMN school_level TYPE school_level USING school_level::school_level;