-- Add feature_votes column to waitlist table if it doesn't exist
ALTER TABLE public.waitlist 
ADD COLUMN IF NOT EXISTS feature_votes jsonb DEFAULT '{}';

-- Ensure the column has the correct default value
UPDATE public.waitlist 
SET feature_votes = '{}' 
WHERE feature_votes IS NULL;