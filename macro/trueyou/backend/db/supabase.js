const { createClient } = require('@supabase/supabase-js');

if (!process.env.SUPABASE_URL) {
    throw new Error('SUPABASE_URL is not set in environment variables');
}

// Public Client (für Auth: signUp, signIn)
const supabasePublic = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// Admin Client (für Datenbank-Operationen, umgeht RLS)
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

module.exports = { supabasePublic, supabaseAdmin };