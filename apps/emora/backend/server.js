// server.js
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// ===== SECURITY =====
app.use(helmet());

// ===== COOKIE-PARSER =====
app.use(cookieParser());

// ===== CORS =====
const allowedOrigins = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000']
    : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Nicht erlaubt durch CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400
}));

// ===== KOMPRIMIERUNG =====
app.use(compression());

// ===== RATE-LIMITING =====
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Zu viele Anfragen, bitte warte 15 Minuten.',
    skipSuccessfulRequests: false,
});
app.use('/api', limiter);

// Strengeres Limit für Auth
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Zu viele Anmeldeversuche, bitte warte 15 Minuten.',
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ===== BODY PARSER =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== STATIC FILES =====
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== ROUTES =====
app.use('/api/auth', require('./routes/auth'));
app.use('/api/entries', require('./routes/entries'));
app.use('/api/letters', require('./routes/letters'));
app.use('/api/passions', require('./routes/passions'));
app.use('/api/statistics', require('./routes/statistics'));
app.use('/api/todos', require('./routes/todos'));
app.use('/api/ai', require('./routes/ai'));

// ===== HEALTH CHECK =====
app.get('/api/health', async (req, res) => {
    let dbStatus = 'OK';
    try {
        const pool = require('./db/pool');
        await pool.query('SELECT 1');
    } catch (error) {
        dbStatus = 'ERROR';
    }
    res.json({
        status: 'OK',
        db: dbStatus,
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        auth: 'Supabase',
    });
});

// ===== 404 HANDLER =====
app.use((req, res) => {
    res.status(404).json({ error: 'Route nicht gefunden' });
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.stack);
    res.status(500).json({
        error: 'Interner Serverfehler',
        ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Emora Backend läuft auf http://localhost:${PORT}`);
    console.log(`🔐 Auth: Supabase`);
    console.log(`🔒 CORS erlaubt:`, allowedOrigins);
    console.log(`📊 Rate-Limiting: 100 Anfragen pro 15 Minuten`);
});