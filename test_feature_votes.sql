-- Test that the feature_votes column exists and works correctly
-- Insert a test record
INSERT INTO public.waitlist (email, feature_votes) 
VALUES ('test@example.com', '{"ai-writing": 1, "citations": 2}')
ON CONFLICT (email) DO UPDATE SET feature_votes = '{"ai-writing": 1, "citations": 2}';

-- Select the test record to verify
SELECT id, email, feature_votes 
FROM public.waitlist 
WHERE email = 'test@example.com';

-- Update the feature votes
UPDATE public.waitlist 
SET feature_votes = feature_votes || '{"collaboration": 1}'::jsonb
WHERE email = 'test@example.com';

-- Select again to verify the update
SELECT id, email, feature_votes 
FROM public.waitlist 
WHERE email = 'test@example.com';

-- Clean up test record
DELETE FROM public.waitlist 
WHERE email = 'test@example.com';