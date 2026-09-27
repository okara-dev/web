const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase URL oder Key fehlt in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection
(async () => {
    try {
        const { error } = await supabase.from('users').select('id').limit(1);
        if (error) throw error;
        console.log('✅ Supabase connected');
    } catch (error) {
        console.error('❌ Supabase error:', error.message);
    }
})();

module.exports = supabase;