const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const progressController = require('../controllers/progressController');

// All routes are private
router.use(protect);

// Specific routes first
router.post('/enroll', progressController.enroll);
router.get('/my-courses', progressController.getMyCourses);
router.get('/dashboard-stats', progressController.getDashboardStats);
router.post('/complete', progressController.completeLesson);
router.put('/video-timestamp', progressController.updateVideoTimestamp);

// Parameterized routes last
router.get('/:courseId', progressController.getCourseProgress);

module.exports = router;
