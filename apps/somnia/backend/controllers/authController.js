const pool = require('../db/pool');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'Benutzer existiert bereits' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (username, email, password_hash) 
             VALUES ($1, $2, $3) 
             RETURNING id, username, email, is_premium, created_at`,
            [username, email, hashedPassword]
        );

        const user = result.rows[0];

        const token = jwt.sign(
            { userId: user.id, username: user.username, isPremium: user.is_premium },
            process.env.JWT_SECRET,
            { expiresIn: '365d' }
        );

        // 🔥 COOKIE SETZEN
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 365 * 24 * 60 * 60 * 1000
        });

        // 🔥 WICHTIG: isPremium als Boolean senden!
        res.status(201).json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                isPremium: user.is_premium === true // ← HIER!
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registrierung fehlgeschlagen' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username, isPremium: user.is_premium },
            process.env.JWT_SECRET,
            { expiresIn: '365d' }
        );

        // 🔥 COOKIE SETZEN
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 365 * 24 * 60 * 60 * 1000
        });

        // 🔥 WICHTIG: isPremium als Boolean senden!
        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                isPremium: user.is_premium === true // ← HIER!
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login fehlgeschlagen' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, username, email, is_premium, created_at FROM users WHERE id = $1',
            [req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Benutzer nicht gefunden' });
        }

        const user = result.rows[0];
        
        // 🔥 WICHTIG: isPremium als Boolean senden!
        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            isPremium: user.is_premium === true, // ← HIER!
            createdAt: user.created_at
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ error: 'Fehler beim Abrufen der Benutzerdaten' });
    }
};

// 🔥 NEU: Logout
exports.logout = async (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    res.json({ success: true, message: 'Abgemeldet' });
};