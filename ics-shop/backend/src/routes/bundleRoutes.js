const express = require('express');
const BundleController = require('../controllers/bundleController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Öffentliche Routen
router.get('/bundles', BundleController.getAll);

// Geschützte Routen
router.get('/my-bundle', authenticateToken, BundleController.getUserBundle);
router.get('/bundles/download/:slug', authenticateToken, BundleController.downloadBundleEbook);

// ⚠️ KEIN /bundles/purchase mehr!

module.exports = router;