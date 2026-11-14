// routes/todos.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const pool = require('../db/pool');

// Alle ToDos abrufen
router.get('/', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query(
            'SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

// ToDo erstellen
router.post('/', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { title, description, priority, due_date } = req.body;
    
    if (!title) {
        return res.status(400).json({ error: 'Titel erforderlich' });
    }
    
    try {
        const result = await pool.query(
            'INSERT INTO todos (user_id, title, description, priority, due_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, title, description || null, priority || 'not-urgent-not-important', due_date || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

// ToDo togglen (erledigt/nicht erledigt)
router.put('/:id/toggle', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            'UPDATE todos SET is_completed = NOT is_completed, completed_at = CASE WHEN is_completed = false THEN NOW() ELSE NULL END WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'ToDo nicht gefunden' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

// ToDo löschen
router.delete('/:id', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    
    try {
        await pool.query('DELETE FROM todos WHERE id = $1 AND user_id = $2', [id, userId]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

module.exports = router;