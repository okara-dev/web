// backend/routes/tests.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getTest, submitTest, getAllResults } = require('../controllers/testsController');
const { supabaseAdmin } = require('../db/supabase');

// Debug Logger
router.use((req, res, next) => {
    console.log('Tests Route:', req.method, req.path, 'User:', req.user?.id);
    next();
});

router.use(authenticateToken);

router.get('/results/all', getAllResults);

router.delete('/results/:id', async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    console.log('DELETE Result:', id, 'User:', userId);

    try {
        const { data, error } = await supabaseAdmin
            .from('trueyou_test_results')
            .delete()
            .eq('id', id)
            .eq('user_id', userId)
            .select('id');

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Result not found' });
        }

        res.json({ message: 'Result deleted' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:testId', getTest);
router.post('/:testId/submit', submitTest);

module.exports = router;