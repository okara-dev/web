const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Routes importieren
const authRoutes = require('./src/routes/authRoutes');
const shopEbookRoutes = require('./src/routes/shopEbookRoutes');
const bundleRoutes = require('./src/routes/bundleRoutes');
const libraryRoutes = require('./src/routes/libraryRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ============ MIDDLEWARE ============
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));
app.use('/css', express.static(path.join(frontendPath, 'css')));
app.use('/js', express.static(path.join(frontendPath, 'js')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============ ROUTES ============
app.use('/api', authRoutes);
app.use('/api', shopEbookRoutes);
app.use('/api', bundleRoutes);
app.use('/api', libraryRoutes);

// ============ CHECKOUT LINKS ============
app.get('/api/checkout-links', (req, res) => {
    res.json({
        bundle: `https://your-store.lemonsqueezy.com/checkout/buy/${process.env.LEMONSQUEEZY_BUNDLE_VARIANT_ID || 'demo'}`
    });
});

// ============ LEMON SQUEEZY WEBHOOK ============
app.post('/api/webhook/lemon-squeezy', async (req, res) => {
    try {
        const supabase = require('./src/config/supabase');
        const crypto = require('crypto');
        
        const event = req.body;
        
        if (event.meta && event.meta.event_name === 'order_created') {
            const order = event.data.attributes;
            const customerEmail = order.attributes.customer_email;
            const variantId = order.attributes.first_order_item.variant_id;
            
            // Prüfen ob es das Bundle ist
            if (variantId === process.env.LEMONSQUEEZY_BUNDLE_VARIANT_ID) {
                // User finden oder erstellen
                let user;
                const { data: existingUser } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', customerEmail)
                    .single();
                
                if (existingUser) {
                    user = existingUser;
                } else {
                    const { data: newUser } = await supabase
                        .from('users')
                        .insert([{
                            email: customerEmail,
                            lemon_squeezy_customer_id: order.attributes.customer_id
                        }])
                        .select()
                        .single();
                    user = newUser;
                }
                
                // Bundle-ID holen
                const { data: bundle } = await supabase
                    .from('bundles')
                    .select('id')
                    .eq('slug', 'transformation-bundle')
                    .single();
                
                if (bundle) {
                    // Bundle kaufen
                    await supabase
                        .from('user_bundles')
                        .upsert({
                            user_id: user.id,
                            bundle_id: bundle.id
                        }, { onConflict: 'user_id,bundle_id' });
                    
                    // Alle Bundle-eBooks freischalten
                    const { data: ebooks } = await supabase
                        .from('bundle_ebooks')
                        .select('id')
                        .eq('bundle_id', bundle.id);
                    
                    for (const ebook of ebooks || []) {
                        await supabase
                            .from('user_bundle_ebooks')
                            .upsert({
                                user_id: user.id,
                                bundle_ebook_id: ebook.id,
                                download_token: crypto.randomBytes(32).toString('hex')
                            }, { onConflict: 'user_id,bundle_ebook_id' });
                    }
                    
                    console.log(`✅ User ${customerEmail} purchased Bundle`);
                }
            }
        }
        
        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// ============ SERVE FRONTEND ============
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// ============ CREATE UPLOAD DIRECTORIES ============
const dirs = [
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'uploads/shop_eb'),
    path.join(__dirname, 'uploads/bundle_eb')
];

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created: ${dir}`);
    }
});

// ============ START SERVER ============
app.listen(PORT, () => {
    console.log(`
    ═══════════════════════════════════════════════════
    🚀 Server gestartet: http://localhost:${PORT}
    ═══════════════════════════════════════════════════
    📁 Frontend: ${frontendPath}
    📁 Shop eBooks: ${path.join(__dirname, 'uploads/shop_eb')}
    📁 Bundle eBooks: ${path.join(__dirname, 'uploads/bundle_eb')}
    ═══════════════════════════════════════════════════
    `);
});