const express = require('express');
const BundleController = require('../controllers/bundleController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Öffentliche Routes
router.get('/bundles', BundleController.getAll);

// Geschützte Routes
router.get('/my-bundle', authenticateToken, BundleController.getUserBundle);
router.post('/bundles/purchase', authenticateToken, BundleController.purchase);
router.get('/bundles/download/:slug', authenticateToken, BundleController.downloadBundleEbook);

module.exports = router;