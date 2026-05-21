const path = require('path');

// @desc    Upload a single image
// @access  Admin
exports.uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  res.json({
    success: true,
    url: `/uploads/${req.file.filename}`,
    filename: req.file.filename,
    size: req.file.size
  });
};

// @desc    Upload a file (resource/attachment)
// @access  Admin
exports.uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  res.json({
    success: true,
    url: `/uploads/${req.file.filename}`,
    filename: req.file.originalname,
    fileType: path.extname(req.file.originalname).slice(1).toUpperCase(),
    size: (req.file.size / (1024 * 1024)).toFixed(2) + ' MB'
  });
};
