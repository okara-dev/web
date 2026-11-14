const pool = require('../db/pool');
const aiService = require('../services/aiService');

// Create Dream - NUR Titel + Beschreibung (KEIN Schlaf)
exports.createDream = async (req, res) => {
    try {
        const { title, dream_text } = req.body;
        const userId = req.userId;

        // Prüfen ob User Premium ist
        const userResult = await pool.query(
            'SELECT is_premium FROM users WHERE id = $1',
            [userId]
        );

        const isPremium = userResult.rows[0]?.is_premium || false;

        // Zähle Träume für Free-User
        if (!isPremium) {
            const dreamCount = await pool.query(
                'SELECT COUNT(*) FROM dreams WHERE user_id = $1',
                [userId]
            );

            if (parseInt(dreamCount.rows[0].count) >= 5) {
                return res.status(403).json({ 
                    error: 'Du hast dein Limit von 5 kostenlosen Träumen erreicht. Upgrade auf Premium für unbegrenzte Träume!',
                    code: 'PREMIUM_REQUIRED'
                });
            }
        }

        // Dream speichern (OHNE AI Analyse, OHNE Schlafdaten)
        const result = await pool.query(
            `INSERT INTO dreams (user_id, title, dream_text, date) 
             VALUES ($1, $2, $3, CURRENT_DATE) 
             RETURNING id, title, dream_text, date, created_at`,
            [userId, title, dream_text]
        );

        res.status(201).json({
            dream: result.rows[0]
        });
    } catch (error) {
        console.error('Create dream error:', error);
        res.status(500).json({ error: 'Traum konnte nicht gespeichert werden' });
    }
};

// Get all dreams
exports.getDreams = async (req, res) => {
    try {
        const userId = req.userId;
        const { limit = 50, offset = 0 } = req.query;

        const result = await pool.query(
            `SELECT id, title, dream_text, date, analysis, created_at 
             FROM dreams 
             WHERE user_id = $1 
             ORDER BY date DESC, created_at DESC 
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        res.json({
            dreams: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Get dreams error:', error);
        res.status(500).json({ error: 'Träume konnten nicht geladen werden' });
    }
};

// Get single dream
exports.getDream = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const result = await pool.query(
            'SELECT id, title, dream_text, date, analysis, created_at FROM dreams WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Traum nicht gefunden' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get dream error:', error);
        res.status(500).json({ error: 'Traum konnte nicht geladen werden' });
    }
};

// Update dream
exports.updateDream = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, dream_text } = req.body;
        const userId = req.userId;

        const checkResult = await pool.query(
            'SELECT * FROM dreams WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Traum nicht gefunden' });
        }

        const result = await pool.query(
            `UPDATE dreams 
             SET title = $1, dream_text = $2, updated_at = CURRENT_TIMESTAMP
             WHERE id = $3 AND user_id = $4
             RETURNING *`,
            [title, dream_text, id, userId]
        );

        res.json({
            dream: result.rows[0]
        });
    } catch (error) {
        console.error('Update dream error:', error);
        res.status(500).json({ error: 'Traum konnte nicht aktualisiert werden' });
    }
};

// Delete dream
exports.deleteDream = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const result = await pool.query(
            'DELETE FROM dreams WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Traum nicht gefunden' });
        }

        res.json({ message: 'Traum gelöscht' });
    } catch (error) {
        console.error('Delete dream error:', error);
        res.status(500).json({ error: 'Traum konnte nicht gelöscht werden' });
    }
};

// Get dream stats (NUR für Schlafstatistiken aus Träumen - WIRD NICHT MEHR VERWENDET)
exports.getDreamStats = async (req, res) => {
    try {
        const userId = req.userId;

        const result = await pool.query(
            `SELECT 
                COUNT(*) as total_dreams
             FROM dreams 
             WHERE user_id = $1`,
            [userId]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Statistiken konnten nicht geladen werden' });
    }
};

// Get recurring themes (Premium)
exports.getRecurringThemes = async (req, res) => {
    try {
        const userId = req.userId;

        // Prüfen ob Premium
        const userResult = await pool.query(
            'SELECT is_premium FROM users WHERE id = $1',
            [userId]
        );

        const isPremium = userResult.rows[0]?.is_premium || false;

        if (!isPremium) {
            return res.status(403).json({ 
                error: 'Wiederkehrende Themen sind nur für Premium-User verfügbar',
                code: 'PREMIUM_REQUIRED'
            });
        }

        const result = await pool.query(
            `SELECT id, title, dream_text, analysis, date 
             FROM dreams 
             WHERE user_id = $1 
             ORDER BY date DESC
             LIMIT 50`,
            [userId]
        );

        if (result.rows.length < 3) {
            return res.json({
                message: 'Mindestens 3 Träume werden für die Themen-Erkennung benötigt',
                themes: null
            });
        }

        const themes = await aiService.detectRecurringThemes(result.rows);

        res.json({
            dreams_count: result.rows.length,
            themes
        });
    } catch (error) {
        console.error('Get recurring themes error:', error);
        res.status(500).json({ error: 'Themen-Erkennung fehlgeschlagen' });
    }
};

// Get Lucid Dreaming Tips (Premium)
exports.getLucidDreamingTips = async (req, res) => {
    try {
        const userId = req.userId;
        const { dreamId } = req.params;

        // Prüfen ob Premium
        const userResult = await pool.query(
            'SELECT is_premium FROM users WHERE id = $1',
            [userId]
        );

        const isPremium = userResult.rows[0]?.is_premium || false;

        if (!isPremium) {
            return res.status(403).json({ 
                error: 'Lucid Dream Training ist nur für Premium-User verfügbar',
                code: 'PREMIUM_REQUIRED'
            });
        }

        const result = await pool.query(
            'SELECT dream_text FROM dreams WHERE id = $1 AND user_id = $2',
            [dreamId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Traum nicht gefunden' });
        }

        const tips = await aiService.generateLucidDreamingTip(result.rows[0].dream_text);

        res.json(tips);
    } catch (error) {
        console.error('Get lucid tips error:', error);
        res.status(500).json({ error: 'Lucid-Training fehlgeschlagen' });
    }
};