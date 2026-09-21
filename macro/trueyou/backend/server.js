const express = require('express');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { handleWebhook } = require('./controllers/premiumController');
const authRoutes = require('./routes/auth');
const testsRoutes = require('./routes/tests');
const premiumRoutes = require('./routes/premium');

const app = express();

// ===== SECURITY =====
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// ===== CORS =====
const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
    : ['http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// ===== COOKIE-PARSER =====
app.use(cookieParser());

// ===== COMPRESSION =====
app.use(compression());

// ===== RATE-LIMITING =====
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please wait 15 minutes.',
    skipSuccessfulRequests: false,
});
app.use('/api', limiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many login attempts, please wait 15 minutes.',
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ===== BODY PARSER =====
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ===== WEBHOOK (raw body) =====
app.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// ===== ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/premium', premiumRoutes);

// ===== HEALTH CHECK =====
app.get('/api/health', async (req, res) => {
    let dbStatus = 'OK';
    try {
        const { supabaseAdmin } = require('./db/supabase');
        const { error } = await supabaseAdmin
            .from('trueyou_users')
            .select('id', { count: 'exact', head: true })
            .limit(1);
        if (error) throw error;
    } catch (error) {
        dbStatus = 'ERROR';
    }
    res.json({
        status: 'OK',
        db: dbStatus,
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});

// ===== 404 =====
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ===== GLOBAL ERROR =====
app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).json({
        error: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
    console.log(`TrueYou Server running on port ${PORT}`);
    console.log(`CORS allowed: ${allowedOrigins.join(', ')}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});