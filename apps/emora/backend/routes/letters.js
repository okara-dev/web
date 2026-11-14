// routes/letters.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const pool = require('../db/pool');

router.get('/', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query(
            'SELECT * FROM letters WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

router.post('/', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { title, content, type } = req.body;
    
    if (!title || !content) {
        return res.status(400).json({ error: 'Titel und Inhalt erforderlich' });
    }
    
    // Öffnungsdatum berechnen
    const now = new Date();
    let openDate;
    
    if (type === 'year') {
        // Nächster 1. Januar
        openDate = new Date(now);
        openDate.setFullYear(now.getFullYear() + 1);
        openDate.setMonth(0);
        openDate.setDate(1);
        openDate.setHours(0, 0, 0, 0);
    } else {
        // Nächster 1. des Monats
        openDate = new Date(now);
        openDate.setMonth(now.getMonth() + 1);
        openDate.setDate(1);
        openDate.setHours(0, 0, 0, 0);
    }
    
    try {
        const result = await pool.query(
            'INSERT INTO letters (user_id, title, content, type, open_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, title, content, type || 'month', openDate]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

router.put('/:id/open', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const now = new Date();
    
    try {
        // Prüfen ob Brief geöffnet werden darf
        const letterCheck = await pool.query(
            'SELECT * FROM letters WHERE id = $1 AND user_id = $2',
            [id, userId]
        );
        
        if (letterCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Brief nicht gefunden' });
        }
        
        const letter = letterCheck.rows[0];
        if (letter.is_opened) {
            return res.status(400).json({ error: 'Brief bereits geöffnet' });
        }
        
        const openDate = new Date(letter.open_date);
        if (openDate > now) {
            return res.status(400).json({ error: 'Brief kann noch nicht geöffnet werden' });
        }
        
        const result = await pool.query(
            'UPDATE letters SET is_opened = true, opened_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );
        res.json({ success: true, letter: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    
    try {
        await pool.query('DELETE FROM letters WHERE id = $1 AND user_id = $2', [id, userId]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

module.exports = router;