const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, adminOnly } = require('../middleware/auth');
const uploadController = require('../controllers/uploadController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|zip|rar|mp4|mov|psd|ai|svg|doc|docx|txt|md/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.startsWith('application/');
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('File type not allowed'));
  }
});

// Admin-only upload routes
router.post('/image', protect, adminOnly, upload.single('image'), uploadController.uploadImage);
router.post('/file', protect, adminOnly, upload.single('file'), uploadController.uploadFile);

module.exports = router;
