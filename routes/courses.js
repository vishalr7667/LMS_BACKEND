const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const courseController = require('../controllers/courseController');

// Public routes
router.get('/', optionalAuth, courseController.getAllCourses);
router.get('/featured', courseController.getFeaturedCourses);
router.get('/stats', courseController.getStats);
router.get('/categories', courseController.getCategories);
router.get('/:slug', optionalAuth, courseController.getCourseBySlug);

// Review routes
router.get('/:slug/reviews', courseController.getCourseReviews);
router.post('/:slug/reviews', protect, courseController.upsertCourseReview);

module.exports = router;
