const express = require('express');
const ShopEbookController = require('../controllers/shopEbookController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Öffentliche Routen
router.get('/shop-ebooks', ShopEbookController.getAll);
router.get('/shop-ebooks/free', ShopEbookController.getFreeEbooks);
router.get('/shop-ebooks/paid', ShopEbookController.getPaidEbooks);
router.get('/shop-ebooks/download/free/:slug', ShopEbookController.downloadFreeEbook);

// Geschützte Routen
router.get('/my-shop-ebooks', authenticateToken, ShopEbookController.getUserEbooks);
router.get('/shop-ebooks/download/:slug', authenticateToken, ShopEbookController.downloadPurchasedEbook);

// ⚠️ KEIN /shop-ebooks/purchase mehr!

module.exports = router;