const { supabaseAdmin } = require('../db/supabase');

async function authenticateToken(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }

        // Profil aus public.users holen
        const { data: profile } = await supabaseAdmin
            .from('trueyou_users')
            .select('username, is_premium')
            .eq('id', user.id)
            .single();

        req.user = {
            id: user.id,
            email: user.email,
            username: profile?.username || user.user_metadata?.username || user.email,
            is_premium: profile?.is_premium || false
        };

        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(403).json({ error: 'Invalid token' });
    }
}

module.exports = { authenticateToken };