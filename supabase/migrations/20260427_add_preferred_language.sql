-- Add preferred_language column to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS preferred_language text
  DEFAULT 'es'
  CHECK (preferred_language IN ('es', 'en'));
