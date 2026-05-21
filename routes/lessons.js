const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const lessonController = require('../controllers/lessonController');

// Public (free preview) / Private (premium)
router.get('/:id', optionalAuth, lessonController.getLesson);

module.exports = router;
