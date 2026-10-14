const supabase = require('../config/supabase');

/**
 * Verifiziert den Supabase-Auth-JWT aus dem Authorization-Header.
 * Setzt req.user = { id, email } bei Erfolg.
 */
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }

        req.user = { id: user.id, email: user.email };
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

/**
 * Optional Auth: Wenn Token vorhanden, wird req.user gesetzt.
 * Wenn nicht, geht es trotzdem weiter (für öffentliche Routen).
 */
const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return next();

    try {
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) req.user = { id: user.id, email: user.email };
    } catch (e) {
        // ignorieren
    }
    next();
};

module.exports = { authenticateToken, optionalAuth };