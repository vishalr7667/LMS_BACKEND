const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const resourceController = require('../controllers/resourceController');

// Public routes
router.get('/', optionalAuth, resourceController.getAllResources);
router.get('/:id', optionalAuth, resourceController.getResource);
router.get('/:id/download', optionalAuth, resourceController.downloadResource);

module.exports = router;
