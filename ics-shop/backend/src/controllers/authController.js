const supabase = require('../config/supabase');

class AuthController {
    /**
     * Registrierung über Supabase Auth.
     * Der DB-Trigger on_auth_user_created legt automatisch ein Profil an.
     */
    static async register(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email und Passwort sind erforderlich' });
            }

            if (password.length < 6) {
                return res.status(400).json({ error: 'Passwort muss mindestens 6 Zeichen haben' });
            }

            const { data, error } = await supabase.auth.signUp({
                email,
                password
            });

            if (error) {
                return res.status(400).json({ error: error.message });
            }

            if (!data.user) {
                return res.status(500).json({ error: 'Registrierung fehlgeschlagen' });
            }

            // Wenn "Confirm email" in Supabase aus ist, haben wir direkt eine Session
            if (!data.session) {
                return res.status(200).json({
                    message: 'Registrierung erfolgreich. Bitte E-Mail bestätigen.',
                    requiresEmailConfirmation: true,
                    user: { id: data.user.id, email: data.user.email }
                });
            }

            return res.json({
                token: data.session.access_token,
                refreshToken: data.session.refresh_token,
                user: { id: data.user.id, email: data.user.email }
            });
        } catch (error) {
            console.error('Register error:', error);
            return res.status(500).json({ error: 'Registrierung fehlgeschlagen' });
        }
    }

    /**
     * Login über Supabase Auth.
     */
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email und Passwort sind erforderlich' });
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                return res.status(401).json({ error: 'Ungültige Zugangsdaten' });
            }

            return res.json({
                token: data.session.access_token,
                refreshToken: data.session.refresh_token,
                user: { id: data.user.id, email: data.user.email }
            });
        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({ error: 'Login fehlgeschlagen' });
        }
    }

    /**
     * Logout – invalidiert die Session serverseitig.
     * (Optional: Supabase signOut macht serverseitig nicht viel,
     * aber wir räumen den Refresh-Token auf.)
     */
    static async logout(req, res) {
        try {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];

            if (token) {
                await supabase.auth.admin.signOut(token);
            }

            return res.json({ success: true });
        } catch (error) {
            console.error('Logout error:', error);
            return res.json({ success: true }); // Logout darf nie fehlschlagen
        }
    }

    /**
     * Aktuellen User abrufen (Token-Validierung für Frontend).
     */
    static async me(req, res) {
        return res.json({
            user: { id: req.user.id, email: req.user.email }
        });
    }
}

module.exports = AuthController;