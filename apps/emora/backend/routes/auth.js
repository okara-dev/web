// routes/auth.js
const express = require('express');
const router = express.Router();
const { supabaseAnon, supabaseAdmin } = require('../lib/supabase');
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');

// ===== REGISTER =====
router.post('/register', async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ error: 'Alle Felder erforderlich' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Passwort mind. 6 Zeichen' });
  }

  try {
    // 1. User in Supabase Auth anlegen
    const { data: authData, error: authError } = await supabaseAnon.auth.signUp({
      email,
      password,
      options: {
        data: { username }, // wird in user_metadata gespeichert
      },
    });

    if (authError) {
      console.error('Supabase Register Error:', authError);
      return res.status(400).json({ error: authError.message });
    }

    if (!authData.user) {
      return res.status(400).json({ error: 'Registrierung fehlgeschlagen' });
    }

    // 2. User in unserer DB anlegen
    try {
      await pool.query(
        `INSERT INTO users (supabase_uid, username, email) 
         VALUES ($1, $2, $3)`,
        [authData.user.id, username, email]
      );
    } catch (dbError) {
      // Falls DB-Insert fehlschlägt: Auth-User wieder löschen (Admin-Rechte nötig!)
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      } catch (cleanupError) {
        console.error('Cleanup fehlgeschlagen:', cleanupError.message);
      }

      if (dbError.code === '23505') {
        return res.status(409).json({
          error: 'Benutzername oder Email existiert bereits',
        });
      }
      throw dbError;
    }

    // 3. Token in Cookie setzen (für Web) – falls Session direkt verfügbar
    const token = authData.session?.access_token;
    const refreshToken = authData.session?.refresh_token;

    if (token) {
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60 * 1000,
      });
    }

    // 4. Response mit Token im JSON (für React Native!)
    res.status(201).json({
      message: 'Registrierung erfolgreich',
      token: token || null,                                   // 🔥 für RN
      refreshToken: refreshToken || null,                     // 🔥 für RN
      user: {
        id: authData.user.id,
        username,
        email,
      },
      // Hinweis: Falls Email-Bestätigung aktiv ist, ist session = null
      needsEmailConfirmation: !authData.session,
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// ===== LOGIN =====
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email und Passwort erforderlich' });
  }

  try {
    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase Login Error:', error);
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    // User aus unserer DB holen
    const result = await pool.query(
      'SELECT id, username, email FROM users WHERE supabase_uid = $1',
      [data.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    const user = result.rows[0];

    // Cookie für Web
    res.cookie('token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });

    // Response mit Token im JSON (für React Native!)
    res.json({
      message: 'Login erfolgreich',
      token: data.session.access_token,          // 🔥 für RN
      refreshToken: data.session.refresh_token,  // 🔥 für RN
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// ===== VERIFY =====
router.get('/verify', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// ===== LOGOUT =====
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.json({ success: true, message: 'Abgemeldet' });
});

module.exports = router;