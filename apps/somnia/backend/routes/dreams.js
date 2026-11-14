const express = require('express');
const router = express.Router();
const dreamController = require('../controllers/dreamController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', dreamController.createDream);
router.get('/', dreamController.getDreams);
router.get('/stats', dreamController.getDreamStats);
router.get('/recurring-themes', dreamController.getRecurringThemes);
router.get('/:id', dreamController.getDream);
router.put('/:id', dreamController.updateDream);
router.delete('/:id', dreamController.deleteDream);
router.get('/:dreamId/lucid-tips', dreamController.getLucidDreamingTips);

module.exports = router;