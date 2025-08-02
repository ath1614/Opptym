const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { runTool } = require('../controllers/seoController');

const router = express.Router();
router.use(protect);

router.post('/:projectId/run', runTool);

module.exports = router;
