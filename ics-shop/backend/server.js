const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();

const supabase = require('./src/config/supabase');
const { authenticateToken } = require('./src/middleware/auth');

// Routes
const authRoutes = require('./src/routes/authRoutes');
const shopEbookRoutes = require('./src/routes/shopEbookRoutes');
const bundleRoutes = require('./src/routes/bundleRoutes');
const libraryRoutes = require('./src/routes/libraryRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ============ CORS ============
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// ============ WEBHOOK (VOR express.json()!) ============
app.post('/api/webhook/lemon-squeezy',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
        try {
            const signature = req.headers['x-signature'];
            const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

            if (!signature || !secret) {
                console.error('Webhook: Signatur oder Secret fehlt');
                return res.status(401).send('Unauthorized');
            }

            const hmac = crypto.createHmac('sha256', secret)
                .update(req.body)
                .digest('hex');

            if (hmac !== signature) {
                console.error('Webhook: Signatur ungültig');
                return res.status(401).send('Invalid signature');
            }

            const event = JSON.parse(req.body.toString());
            const eventName = event.meta?.event_name;
            console.log(`📩 Webhook empfangen: ${eventName}`);

            if (eventName === 'order_created') {
                await handleOrderCreated(event);
            }

            res.status(200).json({ received: true });
        } catch (error) {
            console.error('Webhook error:', error);
            res.status(500).json({ error: 'Webhook processing failed' });
        }
    }
);

// ============ BODY PARSER ============
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============ STATIC FILES ============
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));
app.use('/css', express.static(path.join(frontendPath, 'css')));
app.use('/js', express.static(path.join(frontendPath, 'js')));
app.use('/covers', express.static(path.join(frontendPath, 'covers')));
app.use('/assets', express.static(path.join(frontendPath, 'assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============ API ROUTES ============
app.use('/api', authRoutes);
app.use('/api', shopEbookRoutes);
app.use('/api', bundleRoutes);
app.use('/api', libraryRoutes);

// ============ SHOP CONFIG ============
app.get('/api/shop-config', async (req, res) => {
    try {
        const { data: bundle } = await supabase
            .from('bundles')
            .select('id, name, slug, price')
            .eq('slug', 'transformation-bundle')
            .maybeSingle();

        const storeUrl = process.env.LEMONSQUEEZY_STORE_URL;
        const bundleVariantId = process.env.LEMONSQUEEZY_BUNDLE_VARIANT_ID;

        res.json({
            bundle: bundle ? {
                id: bundle.id,
                name: bundle.name,
                slug: bundle.slug,
                price: parseFloat(bundle.price) || 0,
                checkoutUrl: bundleVariantId
                    ? `${storeUrl}/checkout/buy/${bundleVariantId}?embed=1`
                    : null
            } : null,
            storeUrl: storeUrl || null
        });
    } catch (error) {
        console.error('Shop config error:', error);
        res.status(500).json({ error: 'Failed to fetch shop config' });
    }
});

// ============ PASSWORT-RESET ============
app.post('/api/password-reset', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'E-Mail erforderlich' });

        // Wir geben IMMER Erfolg zurück, damit man nicht prüfen kann,
        // ob eine E-Mail existiert (Sicherheit)
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/?reset=1`
        });

        if (error) console.error('Password reset error:', error.message);

        res.json({ success: true });
    } catch (error) {
        console.error('Password reset error:', error);
        res.json({ success: true });
    }
});

app.post('/api/password-update', authenticateToken, async (req, res) => {
    try {
        const { password } = req.body;
        if (!password || password.length < 8) {
            return res.status(400).json({ error: 'Passwort muss mindestens 8 Zeichen haben' });
        }

        const { error } = await supabase.auth.admin.updateUserById(
            req.user.id,
            { password }
        );

        if (error) return res.status(400).json({ error: error.message });
        res.json({ success: true });
    } catch (error) {
        console.error('Password update error:', error);
        res.status(500).json({ error: 'Passwort-Update fehlgeschlagen' });
    }
});

// ============ FRONTEND FALLBACK ============
app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// ============ UPLOAD DIRS ============
const dirs = [
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'uploads/shop_eb'),
    path.join(__dirname, 'uploads/bundle_eb')
];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Erstellt: ${dir}`);
    }
});

// ============ WEBHOOK HANDLER ============
async function handleOrderCreated(event) {
    const order = event.data?.attributes;
    if (!order) return;

    const customerEmail = order.user_email || order.customer_email;
    const variantId = String(order.first_order_item?.variant_id);

    if (!customerEmail) {
        console.error('Webhook: Keine Kunden-E-Mail gefunden');
        return;
    }

    let { data: profile } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', customerEmail)
        .maybeSingle();

    if (!profile) {
        const { data: newUser, error } = await supabase.auth.admin.createUser({
            email: customerEmail,
            email_confirm: true,
            user_metadata: { created_by: 'lemonsqueezy_webhook' }
        });

        if (error) {
            console.error('Webhook: Konnte User nicht anlegen:', error.message);
            return;
        }

        await new Promise(r => setTimeout(r, 500));

        const { data: createdProfile } = await supabase
            .from('profiles')
            .select('id, email')
            .eq('id', newUser.user.id)
            .maybeSingle();

        profile = createdProfile;
    }

    if (!profile) {
        console.error('Webhook: Profil konnte nicht ermittelt werden');
        return;
    }

    if (variantId === String(process.env.LEMONSQUEEZY_BUNDLE_VARIANT_ID)) {
        const { data: bundle } = await supabase
            .from('bundles')
            .select('id')
            .eq('slug', 'transformation-bundle')
            .maybeSingle();

        if (!bundle) {
            console.error('Webhook: Bundle nicht gefunden');
            return;
        }

        const { error: ubError } = await supabase
            .from('user_bundles')
            .upsert({
                user_id: profile.id,
                bundle_id: bundle.id,
                purchased_at: new Date().toISOString()
            }, { onConflict: 'user_id,bundle_id' });

        if (ubError) {
            console.error('Webhook: user_bundles upsert fehlgeschlagen:', ubError.message);
            return;
        }

        const { data: ebooks } = await supabase
            .from('bundle_ebooks')
            .select('id')
            .eq('bundle_id', bundle.id);

        for (const ebook of ebooks || []) {
            await supabase
                .from('user_bundle_ebooks')
                .upsert({
                    user_id: profile.id,
                    bundle_ebook_id: ebook.id,
                    download_token: crypto.randomBytes(32).toString('hex')
                }, { onConflict: 'user_id,bundle_ebook_id' });
        }

        console.log(`✅ Bundle freigeschaltet für ${customerEmail}`);
    }
}

// ============ START ============
app.listen(PORT, () => {
    console.log(`
    ═══════════════════════════════════════════════════
    🚀 Server läuft: http://localhost:${PORT}
    ═══════════════════════════════════════════════════
    `);
});