const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getEntries, getEntryByDate, saveEntry, deleteEntry } = require('../controllers/entriesController');

router.use(authMiddleware);

router.get('/', getEntries);
router.get('/:date', getEntryByDate);
router.post('/', saveEntry);
router.delete('/:id', deleteEntry);

module.exports = router;