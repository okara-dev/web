const express = require('express');
const LibraryController = require('../controllers/libraryController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/library', authenticateToken, LibraryController.getLibrary);
router.get('/library/ebooks', authenticateToken, LibraryController.getEbooks);
router.get('/library/bundle', authenticateToken, LibraryController.getBundle);

module.exports = router;