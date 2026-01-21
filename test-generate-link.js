const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function testGenerateLink() {
    const email = 'antigravity-test-' + Date.now() + '@example.com';
    console.log('Testing with email:', email);

    console.log('--- Testing type: signup ---');
    const { data: signupData, error: signupError } = await supabase.auth.admin.generateLink({
        type: 'signup',
        email,
        password: 'password123',
    });

    if (signupError) {
        console.error('Signup error:', signupError);
    } else {
        console.log('Signup properties:', signupData.properties);
        console.log('Has email_otp?', !!signupData.properties?.email_otp);
        console.log('Email OTP:', signupData.properties?.email_otp);
    }

    console.log('\n--- Testing type: magiclink (existing user) ---');
    const { data: magicData, error: magicError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
    });

    if (magicError) {
        console.error('Magiclink error:', magicError);
    } else {
        console.log('Magiclink properties:', magicData.properties);
        console.log('Has email_otp?', !!magicData.properties?.email_otp);
        console.log('Email OTP:', magicData.properties?.email_otp);
    }
}

testGenerateLink();
