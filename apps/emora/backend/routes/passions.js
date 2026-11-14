// routes/passions.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const pool = require('../db/pool');

router.get('/', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query(
            'SELECT * FROM passions WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

router.post('/', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { name, description, emoji } = req.body;
    
    if (!name) {
        return res.status(400).json({ error: 'Name erforderlich' });
    }
    
    try {
        const result = await pool.query(
            'INSERT INTO passions (user_id, name, description, emoji) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, name, description || null, emoji || '❤️']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

router.put('/:id/toggle', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            'UPDATE passions SET is_active = NOT is_active WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Leidenschaft nicht gefunden' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    
    try {
        await pool.query('DELETE FROM passions WHERE id = $1 AND user_id = $2', [id, userId]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

module.exports = router;