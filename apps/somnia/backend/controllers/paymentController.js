const pool = require('../db/pool');
const axios = require('axios');
require('dotenv').config();

exports.createCheckout = async (req, res) => {
    try {
        const userId = req.userId;

        const userResult = await pool.query(
            'SELECT email, username FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'Benutzer nicht gefunden' });
        }

        const user = userResult.rows[0];

        if (!process.env.LEMONSQUEEZY_API_KEY || !process.env.LEMONSQUEEZY_STORE_ID || !process.env.LEMONSQUEEZY_VARIANT_ID) {
            console.error('❌ Lemon Squeezy Keys fehlen in .env');
            return res.status(500).json({
                error: 'Zahlungsanbieter nicht konfiguriert. Bitte Admin kontaktieren.',
                missing: {
                    api_key: !process.env.LEMONSQUEEZY_API_KEY,
                    store_id: !process.env.LEMONSQUEEZY_STORE_ID,
                    variant_id: !process.env.LEMONSQUEEZY_VARIANT_ID
                }
            });
        }

        console.log('📤 Sende Checkout-Request an Lemon Squeezy...');

        const response = await axios.post(
            'https://api.lemonsqueezy.com/v1/checkouts',
            {
                data: {
                    type: 'checkouts',
                    attributes: {
                        product_options: {
                            redirect_url: `${process.env.FRONTEND_URL}/payment-success`,
                            receipt_button_text: 'Zurück zur App',
                            receipt_thank_you_note: 'Vielen Dank für deinen Premium-Kauf!'
                        },
                        checkout_options: {
                            embed: false,
                            media: false,
                            logo: false
                        },
                        checkout_data: {
                            email: user.email,
                            custom: {
                                user_id: userId
                            }
                        },
                        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
                    },
                    relationships: {
                        store: {
                            data: {
                                type: 'stores',
                                id: process.env.LEMONSQUEEZY_STORE_ID
                            }
                        },
                        variant: {
                            data: {
                                type: 'variants',
                                id: process.env.LEMONSQUEEZY_VARIANT_ID
                            }
                        }
                    }
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
                    'Content-Type': 'application/vnd.api+json',
                    'Accept': 'application/vnd.api+json'
                }
            }
        );

        console.log('✅ Checkout erstellt:', response.data.data.id);

        const checkoutId = response.data.data.id;
        await pool.query(
            'UPDATE users SET checkout_id = $1 WHERE id = $2',
            [checkoutId, userId]
        );

        res.json({
            checkout_url: response.data.data.attributes.url,
            checkout_id: checkoutId
        });
    } catch (error) {
        console.error('❌ Create checkout error:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Checkout konnte nicht erstellt werden',
            details: error.response?.data || error.message
        });
    }
};

exports.handleWebhook = async (req, res) => {
    try {
        const event = req.body;
        console.log('📨 Webhook empfangen:', event.meta?.event_name);

        if (event.meta && event.meta.event_name === 'order_created') {
            const orderData = event.data.attributes;
            const customData = orderData.first_order_item?.product_options?.custom || {};
            const userId = customData.user_id;

            if (userId) {
                await pool.query(
                    'UPDATE users SET is_premium = true, premium_until = CURRENT_TIMESTAMP + INTERVAL \'1 year\' WHERE id = $1',
                    [userId]
                );
                console.log(`✅ User ${userId} wurde auf Premium upgegradet`);
            }
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Webhook error:', error);
        res.sendStatus(500);
    }
};

exports.checkPremiumStatus = async (req, res) => {
    try {
        const userId = req.userId;

        const result = await pool.query(
            'SELECT is_premium, premium_until FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Benutzer nicht gefunden' });
        }

        // 🔥 WICHTIG: isPremium als Boolean senden!
        res.json({
            isPremium: result.rows[0].is_premium === true, // ← HIER!
            premiumUntil: result.rows[0].premium_until
        });
    } catch (error) {
        console.error('Check premium error:', error);
        res.status(500).json({ error: 'Premium-Status konnte nicht geprüft werden' });
    }
};