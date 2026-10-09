const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY fehlt in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
    },
    global: {
        headers: {
            // FORCIERT Service-Role – überschreibt jeden User-Token,
            // der durch die Middleware in den Request gekommen sein könnte.
            Authorization: `Bearer ${supabaseServiceKey}`
        }
    }
});

// Verbindungstest beim Start
(async () => {
    try {
        const { data, error } = await supabase.from('shop_ebooks').select('id').limit(1);
        if (error) throw error;
        console.log('✅ Supabase (Service Role) verbunden');
    } catch (error) {
        console.error('❌ Supabase Verbindungsfehler:', error.message);
    }
})();

module.exports = supabase;