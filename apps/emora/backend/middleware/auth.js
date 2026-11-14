// middleware/auth.js
const { supabaseAdmin } = require('../lib/supabase');
const pool = require('../db/pool');

module.exports = async (req, res, next) => {
  // 1. Token aus Cookie oder Header holen
  let token = req.cookies?.token;

  if (!token && req.headers.authorization) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Nicht eingeloggt' });
  }

  try {
    // 2. Token bei Supabase validieren
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: 'Ungültiger Token' });
    }

    // 3. User in unserer DB abrufen (oder anlegen)
    let userResult = await pool.query(
      'SELECT id, username, email FROM users WHERE supabase_uid = $1',
      [data.user.id]
    );

    let user;
    if (userResult.rows.length === 0) {
      // User existiert in Supabase Auth, aber nicht in unserer DB
      // → automatisch anlegen (falls Register-Schritt verpasst wurde)
      const email = data.user.email;
      const username =
        data.user.user_metadata?.username ||
        email.split('@')[0] + '_' + Math.floor(Math.random() * 1000);

      const newUser = await pool.query(
        `INSERT INTO users (supabase_uid, username, email) 
         VALUES ($1, $2, $3) 
         RETURNING id, username, email`,
        [data.user.id, username, email]
      );
      user = newUser.rows[0];
    } else {
      user = userResult.rows[0];
    }

    // 4. User an Request hängen
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      supabase_uid: data.user.id,
    };

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(401).json({ error: 'Authentifizierung fehlgeschlagen' });
  }
};