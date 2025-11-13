-- Create contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on the contact_messages table
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public insert" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow admin select" ON public.contact_messages;

-- Create policy to allow anyone to insert into contact_messages
CREATE POLICY "Allow public insert" ON public.contact_messages
FOR INSERT WITH CHECK (true);

-- Create policy to allow admins to read from contact_messages
CREATE POLICY "Allow admin select" ON public.contact_messages
FOR SELECT USING ( EXISTS (
    SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.email = 'admin@colabwize.com'
));

-- Grant all necessary permissions to anon users
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON public.contact_messages TO anon;
GRANT USAGE ON SEQUENCE public.contact_messages_id_seq TO anon;

-- Also grant permissions to authenticated users for good measure
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.contact_messages TO authenticated;
GRANT USAGE ON SEQUENCE public.contact_messages_id_seq TO authenticated;