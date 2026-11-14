const pool = require('../db/pool');

async function getEntries(req, res) {
    const userId = req.user.id;
    const result = await pool.query(
        'SELECT id, entry_date, content, mood_score, mood_tags, photo_url, created_at FROM entries WHERE user_id = $1 ORDER BY entry_date DESC',
        [userId]
    );
    res.json(result.rows);
}

async function getEntryByDate(req, res) {
    const userId = req.user.id;
    const { date } = req.params;
    const result = await pool.query(
        'SELECT id, entry_date, content, mood_score, mood_tags, photo_url FROM entries WHERE user_id = $1 AND entry_date = $2',
        [userId, date]
    );
    if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Kein Eintrag' });
    }
    res.json(result.rows[0]);
}

async function saveEntry(req, res) {
    const userId = req.user.id;
    const { entry_date, content, mood_score, mood_tags, photo_url } = req.body;

    if (!entry_date || !content) {
        return res.status(400).json({ error: 'Datum und Inhalt erforderlich' });
    }

    const result = await pool.query(
        `INSERT INTO entries (user_id, entry_date, content, mood_score, mood_tags, photo_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id, entry_date) DO UPDATE SET
            content = EXCLUDED.content,
            mood_score = EXCLUDED.mood_score,
            mood_tags = EXCLUDED.mood_tags,
            photo_url = EXCLUDED.photo_url
         RETURNING *`,
        [userId, entry_date, content, mood_score || 5, mood_tags || [], photo_url || null]
    );
    res.status(201).json({ message: 'Gespeichert', entry: result.rows[0] });
}

async function deleteEntry(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
    await pool.query('DELETE FROM entries WHERE id = $1 AND user_id = $2', [id, userId]);
    res.json({ message: 'Gelöscht' });
}

module.exports = { getEntries, getEntryByDate, saveEntry, deleteEntry };