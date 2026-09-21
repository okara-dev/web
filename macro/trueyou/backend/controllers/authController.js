const { supabasePublic, supabaseAdmin } = require('../db/supabase');

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 365 * 24 * 60 * 60 * 1000
};

async function register(req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    try {
        // 1. Supabase Auth User anlegen (mit app: 'trueyou' in metadata)
        const { data, error } = await supabasePublic.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                    app: 'trueyou'
                }
            }
        });

        if (error) {
            if (error.message.toLowerCase().includes('already')) {
                return res.status(409).json({ error: 'Email already registered' });
            }
            return res.status(400).json({ error: error.message });
        }

        if (!data.user || !data.session) {
            return res.status(500).json({ error: 'Registration failed' });
        }

        // 2. Profil in trueyou_users anlegen
        //    Der Trigger sollte das automatisch machen, aber wir stellen
        //    sicher, dass es auf jeden Fall existiert (idempotent).
        const { error: profileError } = await supabaseAdmin
            .from('trueyou_users')
            .upsert({
                id: data.user.id,
                username,
                email,
                is_premium: false
            }, { onConflict: 'id' });

        if (profileError) {
            console.error('Profile error:', profileError);
        }

        // 3. Token in Cookie
        res.cookie('token', data.session.access_token, COOKIE_OPTIONS);

        res.status(201).json({
            message: 'Registration successful',
            user: {
                id: data.user.id,
                username,
                email,
                is_premium: false
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const { data, error } = await supabasePublic.auth.signInWithPassword({
            email,
            password
        });

        if (error || !data.session) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Premium-Status holen
        const { data: profile } = await supabaseAdmin
            .from('trueyou_users')
            .select('is_premium, username')
            .eq('id', data.user.id)
            .single();

        res.cookie('token', data.session.access_token, COOKIE_OPTIONS);

        res.json({
            message: 'Login successful',
            user: {
                id: data.user.id,
                username: profile?.username || data.user.user_metadata?.username || email,
                email: data.user.email,
                is_premium: profile?.is_premium || false
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function verify(req, res) {
    res.json({
        user: {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
            is_premium: req.user.is_premium
        }
    });
}

async function logout(req, res) {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    res.json({ message: 'Logged out' });
}

module.exports = { register, login, verify, logout };