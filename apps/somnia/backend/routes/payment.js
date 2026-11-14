const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

// Webhook - keine Auth nötig
router.post('/webhook', paymentController.handleWebhook);

// Checkout - Auth erforderlich
router.post('/checkout', auth, paymentController.createCheckout);
router.get('/status', auth, paymentController.checkPremiumStatus);

module.exports = router;