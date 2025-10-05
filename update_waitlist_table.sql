-- Add feature_votes column to waitlist table
ALTER TABLE public.waitlist 
ADD COLUMN IF NOT EXISTS feature_votes jsonb DEFAULT '{}';