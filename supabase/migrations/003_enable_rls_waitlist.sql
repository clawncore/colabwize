-- Enable Row Level Security on the waitlist table
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public insert" ON public.waitlist;
DROP POLICY IF EXISTS "Allow public select" ON public.waitlist;

-- Create policy to allow anyone to insert into waitlist
CREATE POLICY "Allow public insert" ON public.waitlist
FOR INSERT WITH CHECK (true);

-- Create policy to allow anyone to read from waitlist (for count operations)
CREATE POLICY "Allow public select" ON public.waitlist
FOR SELECT USING (true);

-- Grant all necessary permissions to anon users
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON public.waitlist TO anon;
GRANT USAGE ON SEQUENCE public.waitlist_id_seq TO anon;

-- Also grant permissions to authenticated users for good measure
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.waitlist TO authenticated;
GRANT USAGE ON SEQUENCE public.waitlist_id_seq TO authenticated;