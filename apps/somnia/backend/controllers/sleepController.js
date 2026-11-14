const pool = require('../db/pool');

// Create Sleep Entry - OHNE Datum (verwendet heutiges Datum)
exports.createSleepEntry = async (req, res) => {
    try {
        const { hours, quality } = req.body;
        const userId = req.userId;
        const today = new Date().toISOString().split('T')[0];

        const result = await pool.query(
            `INSERT INTO sleep_entries (user_id, sleep_date, sleep_hours, sleep_quality)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id, sleep_date) 
             DO UPDATE SET sleep_hours = EXCLUDED.sleep_hours, sleep_quality = EXCLUDED.sleep_quality
             RETURNING *`,
            [userId, today, hours, quality]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create sleep entry error:', error);
        res.status(500).json({ error: 'Schlafdaten konnten nicht gespeichert werden' });
    }
};

// Get Sleep Entries
exports.getSleepEntries = async (req, res) => {
    try {
        const userId = req.userId;
        const { limit = 30 } = req.query;

        const result = await pool.query(
            `SELECT id, sleep_date as date, sleep_hours, sleep_quality
             FROM sleep_entries
             WHERE user_id = $1
             ORDER BY sleep_date DESC
             LIMIT $2`,
            [userId, limit]
        );

        res.json({ sleepEntries: result.rows });
    } catch (error) {
        console.error('Get sleep entries error:', error);
        res.status(500).json({ error: 'Schlafdaten konnten nicht geladen werden' });
    }
};

// Get Sleep Stats
exports.getSleepStats = async (req, res) => {
    try {
        const userId = req.userId;

        const result = await pool.query(
            `SELECT 
                COUNT(*) as total_entries,
                COALESCE(AVG(sleep_hours), 0) as avg_hours,
                COALESCE(AVG(sleep_quality), 0) as avg_quality,
                COALESCE(MAX(sleep_quality), 0) as best_quality,
                COALESCE(MIN(sleep_quality), 0) as worst_quality
             FROM sleep_entries
             WHERE user_id = $1`,
            [userId]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get sleep stats error:', error);
        res.status(500).json({ error: 'Schlafstatistiken konnten nicht geladen werden' });
    }
};

// Get Sleep Chart Data (30 days) 
exports.getSleepChart = async (req, res) => {
    try {
        const userId = req.userId;

        const result = await pool.query(
            `SELECT sleep_date as date, sleep_hours, sleep_quality
             FROM sleep_entries
             WHERE user_id = $1
               AND sleep_date >= CURRENT_DATE - INTERVAL '30 days'
             ORDER BY sleep_date ASC`,
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get sleep chart error:', error);
        res.status(500).json({ error: 'Diagrammdaten konnten nicht geladen werden' });
    }
};


// Schlafdefizit berechnen (letzte 7 Tage)
exports.getSleepDefizit = async (req, res) => {
    try {
        const userId = req.userId;
        const idealSleep = 7.5; // Empfohlene Stunden pro Nacht

        const result = await pool.query(
            `SELECT 
                COALESCE(AVG(sleep_hours), 0) as avg_hours,
                COUNT(*) as total_days
             FROM sleep_entries
             WHERE user_id = $1
               AND sleep_date >= CURRENT_DATE - INTERVAL '7 days'`,
            [userId]
        );

        const avgHours = parseFloat(result.rows[0].avg_hours) || 0;
        const totalDays = parseInt(result.rows[0].total_days) || 0;
        
        // Defizit = (ideale Stunden - tatsächliche Stunden) * Anzahl Tage
        // Positiv = zu wenig Schlaf, Negativ = mehr als ideal
        let defizit = 0;
        if (totalDays > 0) {
            defizit = (idealSleep - avgHours) * totalDays;
        }

        res.json({ 
            defizit: Math.round(defizit * 10) / 10,
            avg_hours: Math.round(avgHours * 10) / 10,
            total_days: totalDays,
            ideal: idealSleep
        });
    } catch (error) {
        console.error('Get sleep defizit error:', error);
        res.status(500).json({ error: 'Schlafdefizit konnte nicht berechnet werden' });
    }
};

// Schlaf-Trend & Empfehlungen
exports.getSleepTrend = async (req, res) => {
    try {
        const userId = req.userId;
        const idealSleep = 7.5;

        // Hole die letzten 14 Tage
        const result = await pool.query(
            `SELECT 
                sleep_date as date,
                sleep_hours,
                sleep_quality
             FROM sleep_entries
             WHERE user_id = $1
               AND sleep_date >= CURRENT_DATE - INTERVAL '14 days'
             ORDER BY sleep_date ASC`,
            [userId]
        );

        if (result.rows.length < 3) {
            return res.json({
                has_data: false,
                total_days: result.rows.length,
                message: 'Mindestens 3 Tage benötigt'
            });
        }

        const entries = result.rows;
        const totalDays = entries.length;
        
        // Durchschnitt berechnen
        let totalHours = 0;
        let totalQuality = 0;
        let bestQuality = 0;
        let bestQualityDate = null;
        let bestHours = 0;

        entries.forEach(entry => {
            totalHours += parseFloat(entry.sleep_hours);
            totalQuality += parseInt(entry.sleep_quality);
            
            if (parseInt(entry.sleep_quality) > bestQuality) {
                bestQuality = parseInt(entry.sleep_quality);
                bestQualityDate = entry.date;
            }
            
            if (parseFloat(entry.sleep_hours) > bestHours) {
                bestHours = parseFloat(entry.sleep_hours);
            }
        });

        const avgHours = totalHours / totalDays;
        const avgQuality = totalQuality / totalDays;

        // Trend berechnen (letzte 7 vs. vorherige 7 Tage)
        let trend = 'stabil';
        if (totalDays >= 14) {
            const recent = entries.slice(-7);
            const older = entries.slice(0, 7);
            
            let recentAvg = 0;
            let olderAvg = 0;
            
            recent.forEach(e => recentAvg += parseFloat(e.sleep_quality));
            older.forEach(e => olderAvg += parseFloat(e.sleep_quality));
            
            recentAvg /= recent.length;
            olderAvg /= older.length;
            
            const diff = recentAvg - olderAvg;
            if (diff > 0.5) trend = 'steigend';
            else if (diff < -0.5) trend = 'fallend';
        }

        res.json({
            has_data: true,
            total_days: totalDays,
            avg_hours: Math.round(avgHours * 10) / 10,
            avg_quality: Math.round(avgQuality * 10) / 10,
            best_quality: bestQuality,
            best_quality_date: bestQualityDate,
            best_hours: Math.round(bestHours * 10) / 10,
            trend: trend,
            ideal: idealSleep
        });
    } catch (error) {
        console.error('Get sleep trend error:', error);
        res.status(500).json({ error: 'Schlaf-Trend konnte nicht berechnet werden' });
    }
};