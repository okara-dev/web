// routes/ai.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const aiController = require('../controllers/aiController');

// ⭐ KI-Chat – für ALLE User kostenlos
router.post('/chat', authMiddleware, aiController.chatWithEntries);

// ⭐ KI-Insights – für ALLE User kostenlos
router.get('/insights', authMiddleware, aiController.getInsights);

module.exports = router;