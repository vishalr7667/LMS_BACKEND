const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Public settings & subscribe
router.get('/settings/public', adminController.getPublicSettings);
router.post('/settings/subscribe', adminController.subscribe);

// Apply auth + admin middleware to all routes below
router.use(protect, adminOnly);

// Dashboard
router.get('/stats', adminController.getStats);

// Courses
router.get('/courses', adminController.getCourses);
router.get('/courses/:id', adminController.getCourse);
router.post('/courses', adminController.createCourse);
router.put('/courses/:id', adminController.updateCourse);
router.patch('/courses/:id/featured', adminController.toggleFeatured);
router.delete('/courses/:id', adminController.deleteCourse);

// Modules
router.get('/modules/:courseId', adminController.getModules);
router.post('/modules', adminController.createModule);
router.put('/modules/:id', adminController.updateModule);
router.delete('/modules/:id', adminController.deleteModule);

// Lessons
router.get('/lessons/:moduleId', adminController.getLessons);
router.post('/lessons', adminController.createLesson);
router.put('/lessons/:id', adminController.updateLesson);
router.delete('/lessons/:id', adminController.deleteLesson);

// Users
router.get('/users', adminController.getUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Comments
router.get('/comments', adminController.getComments);
router.put('/comments/:id', adminController.updateComment);
router.delete('/comments/:id', adminController.deleteComment);

// Resources
router.get('/resources', adminController.getResources);
router.post('/resources', adminController.createResource);
router.put('/resources/:id', adminController.updateResource);
router.delete('/resources/:id', adminController.deleteResource);

// Reviews
router.get('/reviews', adminController.getReviews);
router.put('/reviews/:id/status', adminController.updateReviewStatus);
router.delete('/reviews/:id', adminController.deleteReview);

// Site Settings
router.get('/settings', adminController.getSettings);
router.post('/settings', adminController.updateSettings);

module.exports = router;
