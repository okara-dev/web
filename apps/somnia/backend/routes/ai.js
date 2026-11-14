const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/analyze', aiController.analyzeDream);
router.get('/history', aiController.getAnalysisHistory);
router.get('/analysis/:id', aiController.getAnalysis);
router.get('/remaining', aiController.getRemainingAnalyses);

module.exports = router;