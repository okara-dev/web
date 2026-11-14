const express = require('express');
const router = express.Router();
const sleepController = require('../controllers/sleepController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', sleepController.createSleepEntry);
router.get('/', sleepController.getSleepEntries);
router.get('/stats', sleepController.getSleepStats);
router.get('/chart', sleepController.getSleepChart);
router.get('/defizit', sleepController.getSleepDefizit);
router.get('/trend', sleepController.getSleepTrend);

module.exports = router;