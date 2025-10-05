-- Add feature_votes column to waitlist table
ALTER TABLE public.waitlist 
ADD COLUMN IF NOT EXISTS feature_votes jsonb DEFAULT '{}';

-- Add a comment to describe the column
COMMENT ON COLUMN public.waitlist.feature_votes IS 'Stores feature votes as JSON object with feature_id as key and vote count as value';