// routes/statistics.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const pool = require('../db/pool');

router.get('/', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    
    try {
        // Zusammenfassung
        const summaryResult = await pool.query(
            `SELECT 
                COUNT(*) as total_entries,
                ROUND(AVG(mood_score), 1) as avg_mood,
                MAX(mood_score) as best_mood,
                MIN(mood_score) as worst_mood
             FROM entries 
             WHERE user_id = $1`,
            [userId]
        );
        
        // Stimmungsverlauf (letzte 30 Tage)
        const timelineResult = await pool.query(
            `SELECT entry_date, mood_score 
             FROM entries 
             WHERE user_id = $1 
             ORDER BY entry_date ASC 
             LIMIT 30`,
            [userId]
        );
        
        // Streak berechnen
        const streakResult = await pool.query(
            `SELECT entry_date 
             FROM entries 
             WHERE user_id = $1 
             ORDER BY entry_date DESC`,
            [userId]
        );
        
        let streak = 0;
        if (streakResult.rows.length > 0) {
            let currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            
            for (let i = 0; i < streakResult.rows.length; i++) {
                const entryDate = new Date(streakResult.rows[i].entry_date);
                entryDate.setHours(0, 0, 0, 0);
                
                const diffDays = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));
                if (diffDays === i) {
                    streak++;
                } else {
                    break;
                }
            }
        }
        
        res.json({
            summary: {
                ...summaryResult.rows[0],
                streak: streak
            },
            timeline: timelineResult.rows
        });
    } catch (error) {
        console.error('Statistik Fehler:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

module.exports = router;