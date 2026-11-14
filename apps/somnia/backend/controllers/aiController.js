const pool = require('../db/pool');
const aiService = require('../services/aiService');

// Analyze dream with AI
exports.analyzeDream = async (req, res) => {
    try {
        const { dream_text, dream_id } = req.body;
        const userId = req.userId;

        // Prüfen ob User Premium ist
        const userResult = await pool.query(
            'SELECT is_premium FROM users WHERE id = $1',
            [userId]
        );

        const isPremium = userResult.rows[0]?.is_premium || false;

        // Zähle Analysen für Free-User
        let remainingAnalyses = 5;
        if (!isPremium) {
            const analysisCount = await pool.query(
                'SELECT COUNT(*) FROM ai_analyses WHERE user_id = $1',
                [userId]
            );

            const usedAnalyses = parseInt(analysisCount.rows[0].count);
            remainingAnalyses = 5 - usedAnalyses;

            if (usedAnalyses >= 5) {
                return res.status(403).json({ 
                    error: 'Du hast dein Limit von 5 kostenlosen Analysen erreicht. Upgrade auf Premium für unbegrenzte Analysen!',
                    code: 'PREMIUM_REQUIRED'
                });
            }
        }

        // AI Analyse durchführen
        const analysis = await aiService.analyzeDream(dream_text, null, null);

        // Analyse speichern
        const result = await pool.query(
            `INSERT INTO ai_analyses (user_id, dream_id, dream_text, analysis, is_premium)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [userId, dream_id || null, dream_text, analysis, isPremium]
        );

        // Lucid Dream Tipps für Premium-User
        let lucidTips = null;
        if (isPremium) {
            lucidTips = await aiService.generateLucidDreamingTip(dream_text);
        }

        res.json({
            analysis: analysis,
            dream_text: dream_text,
            lucid_tips: lucidTips,
            is_premium: isPremium,
            remaining_analyses: remainingAnalyses - 1,
            analysis_id: result.rows[0].id
        });
    } catch (error) {
        console.error('AI analysis error:', error);
        res.status(500).json({ error: 'KI-Analyse fehlgeschlagen' });
    }
};

exports.getRemainingAnalyses = async (req, res) => {
    try {
        const userId = req.userId;

        const userResult = await pool.query(
            'SELECT is_premium FROM users WHERE id = $1',
            [userId]
        );

        const isPremium = userResult.rows[0]?.is_premium || false;

        if (isPremium) {
            return res.json({ remaining: 'unbegrenzt' });
        }

        const analysisCount = await pool.query(
            'SELECT COUNT(*) FROM ai_analyses WHERE user_id = $1',
            [userId]
        );

        const usedAnalyses = parseInt(analysisCount.rows[0].count);
        const remaining = Math.max(0, 5 - usedAnalyses);

        res.json({ remaining });
    } catch (error) {
        console.error('❌ Get remaining analyses error:', error);
        res.status(500).json({ error: 'Fehler beim Abrufen der verbleibenden Analysen' });
    }
};

// Get AI analysis history
exports.getAnalysisHistory = async (req, res) => {
    try {
        const userId = req.userId;

        const result = await pool.query(
            `SELECT id, dream_id, dream_text, analysis, created_at,
                    (SELECT title FROM dreams WHERE id = ai_analyses.dream_id) as dream_title
             FROM ai_analyses
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT 20`,
            [userId]
        );

        res.json({ analyses: result.rows });
    } catch (error) {
        console.error('Get AI history error:', error);
        res.status(500).json({ error: 'Analyse-Verlauf konnte nicht geladen werden' });
    }
};

// Get single AI analysis
exports.getAnalysis = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const result = await pool.query(
            `SELECT * FROM ai_analyses WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Analyse nicht gefunden' });
        }

        const analysis = result.rows[0];
        res.json({
            analysis: analysis.analysis,
            dream_text: analysis.dream_text,
            is_premium: analysis.is_premium
        });
    } catch (error) {
        console.error('Get AI analysis error:', error);
        res.status(500).json({ error: 'Analyse konnte nicht geladen werden' });
    }
};