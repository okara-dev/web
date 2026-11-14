const { Pool } = require('pg');
require('dotenv').config();

console.log('📊 Datenbank Konfiguration:');
console.log('  Host:', process.env.DB_HOST);
console.log('  Port:', process.env.DB_PORT);
console.log('  Name:', process.env.DB_NAME);
console.log('  User:', process.env.DB_USER);

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('connect', () => console.log('📊 DreamWeaver DB: Neue Connection'));
pool.on('error', (err) => console.error('📊 DreamWeaver DB Fehler:', err));

// Teste die Verbindung
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Datenbank Verbindungsfehler:', err.stack);
        return;
    }
    console.log('✅ Datenbank verbunden!');
    release();
});

module.exports = pool;