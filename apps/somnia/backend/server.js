const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser'); // ← NEU
require('dotenv').config();

const authRoutes = require('./routes/auth');
const dreamRoutes = require('./routes/dreams');
const paymentRoutes = require('./routes/payment');
const sleepRoutes = require('./routes/sleep');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🔍 Environment Check:');
console.log('  DB_HOST:', process.env.DB_HOST);
console.log('  DB_DATABASE:', process.env.DB_DATABASE);
console.log('  DB_USER:', process.env.DB_USER);
console.log('  JWT_SECRET:', process.env.JWT_SECRET ? '✅ gesetzt' : '❌ fehlt');

// ===== COOKIE-PARSER =====
app.use(cookieParser()); // ← NEU

// ===== SECURITY =====
app.use(helmet());

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
    credentials: true
}));

// ===== RATE LIMITING =====
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api', limiter);

// ===== BODY PARSER =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/dreams', dreamRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/sleep', sleepRoutes);
app.use('/api/ai', aiRoutes);

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 DreamWeaver Backend läuft auf Port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
});