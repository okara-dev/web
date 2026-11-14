require('dotenv').config();

console.log('\n🔍 Supabase-Verbindungs-Check\n');
console.log('URL:', process.env.SUPABASE_URL);
console.log('Anon Key vorhanden:', !!process.env.SUPABASE_ANON_KEY);
console.log('Service Key vorhanden:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

console.log('\n📡 Teste Netzwerkverbindung zu Supabase...\n');

fetch(process.env.SUPABASE_URL + '/auth/v1/health', {
  headers: {
    'apikey': process.env.SUPABASE_ANON_KEY,
  }
})
  .then(res => {
    console.log('✅ HTTP-Status:', res.status);
    return res.text();
  })
  .then(body => {
    console.log('✅ Antwort:', body.slice(0, 200));
  })
  .catch(err => {
    console.error('❌ Netzwerkfehler:', err.message);
    console.error('   Fehlercode:', err.cause?.code);
    console.error('   Wenn ENOTFOUND/ECONNREFUSED → Firewall/VPN');
  });