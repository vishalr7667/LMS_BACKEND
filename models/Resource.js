const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Project Files',
      'PDFs & Guides',
      'Assets & Textures',
      'Templates',
      'Source Code',
      'Images',
      'Other'
    ]
  },
  tags: [String],
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    default: ''
  },
  fileSize: {
    type: String,
    default: ''
  },
  accessType: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free'
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resource', resourceSchema);
