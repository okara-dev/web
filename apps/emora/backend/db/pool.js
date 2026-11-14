// db/pool.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Wichtig für Supabase!
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 45000,
});

pool.on('connect', () => console.log('📊 Emora DB: Neue Connection (Supabase)'));
pool.on('error', (err) => console.error('📊 Emora DB Fehler:', err));

module.exports = pool;