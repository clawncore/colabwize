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

-- Grant usage on schema to anon users
GRANT USAGE ON SCHEMA public TO anon;

-- Grant select and insert permissions on waitlist table to anon users
GRANT SELECT, INSERT ON public.waitlist TO anon;

-- Grant usage permission on the waitlist_id_seq sequence to anon users
GRANT USAGE ON SEQUENCE public.waitlist_id_seq TO anon;