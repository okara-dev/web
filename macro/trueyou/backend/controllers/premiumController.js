const { supabaseAdmin } = require('../db/supabase');

// Premium-Status prüfen
async function getPremiumStatus(req, res) {
    const userId = req.user.id;

    try {
        const { data, error } = await supabaseAdmin
            .from('trueyou_users')
            .select('is_premium, premium_activated_at')
            .eq('id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        res.json({
            is_premium: data?.is_premium || false,
            activated_at: data?.premium_activated_at || null
        });
    } catch (error) {
        console.error('Premium status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Premium manuell aktivieren (z.B. für Admin/Test)
async function activatePremium(req, res) {
    const userId = req.user.id;

    try {
        const { error } = await supabaseAdmin
            .from('trueyou_users')
            .update({
                is_premium: true,
                premium_activated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (error) throw error;

        res.json({ message: 'Premium activated successfully' });
    } catch (error) {
        console.error('Activate premium error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Lemon Squeezy Checkout erstellen
async function createCheckout(req, res) {
    const LEMON_SQUEEZY_API_KEY = process.env.LEMON_SQUEEZY_API_KEY;
    const STORE_ID = process.env.LEMON_SQUEEZY_STORE_ID;
    const VARIANT_ID = process.env.LEMON_SQUEEZY_VARIANT_ID;

    const userId = req.user.id;
    const userEmail = req.user.email;

    if (!LEMON_SQUEEZY_API_KEY || !STORE_ID || !VARIANT_ID) {
        return res.status(500).json({ error: 'Payment not configured' });
    }

    try {
        const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.api+json',
                'Content-Type': 'application/vnd.api+json',
                'Authorization': `Bearer ${LEMON_SQUEEZY_API_KEY}`
            },
            body: JSON.stringify({
                data: {
                    type: 'checkouts',
                    attributes: {
                        checkout_data: {
                            email: userEmail,
                            custom: {
                                user_id: userId.toString()
                            }
                        }
                    },
                    relationships: {
                        store: {
                            data: { type: 'stores', id: STORE_ID.toString() }
                        },
                        variant: {
                            data: { type: 'variants', id: VARIANT_ID.toString() }
                        }
                    }
                }
            })
        });

        const data = await response.json();

        if (data.errors) {
            console.error('Lemon Squeezy error:', data.errors);
            return res.status(500).json({ error: 'Failed to create checkout' });
        }

        res.json({ url: data.data.attributes.url });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ error: 'Checkout could not be created' });
    }
}

// Webhook für erfolgreiche Zahlungen
async function handleWebhook(req, res) {
    const crypto = require('crypto');
    const WEBHOOK_SECRET = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        console.error('Webhook secret not configured');
        return res.status(500).json({ error: 'Webhook not configured' });
    }

    const signature = req.headers['x-signature'];
    const hash = crypto.createHmac('sha256', WEBHOOK_SECRET)
        .update(req.body)
        .digest('hex');

    if (signature !== hash) {
        console.error('Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
    }

    let payload;
    try {
        payload = JSON.parse(req.body.toString());
    } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON' });
    }

    const eventName = payload.meta?.event_name;

    if (eventName === 'order_created') {
        const userId = payload.data?.attributes?.custom?.user_id;
        const orderId = payload.data?.id;

        if (userId) {
            const { error } = await supabaseAdmin
                .from('trueyou_users')
                .update({
                    is_premium: true,
                    premium_activated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (!error) {
                console.log(`Premium activated for user ${userId}, order ${orderId}`);
            } else {
                console.error('Failed to activate premium:', error);
            }
        }
    }

    res.status(200).json({ received: true });
}

module.exports = {
    getPremiumStatus,
    activatePremium,
    createCheckout,
    handleWebhook
};