const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const commentController = require('../controllers/commentController');

// Public
router.get('/:lessonId', optionalAuth, commentController.getCommentsByLesson);

// Private
router.post('/', protect, commentController.createComment);

module.exports = router;
