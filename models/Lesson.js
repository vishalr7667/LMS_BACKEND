const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['video', 'text', 'mixed'],
    default: 'video'
  },
  videoUrl: {
    type: String,
    default: ''
  },
  videoDuration: {
    type: String,
    default: ''
  },
  textContent: {
    type: String,
    default: ''
  },
  images: [String],
  resources: [{
    name: String,
    fileUrl: String,
    fileType: String,
    fileSize: String
  }],
  isFreePreview: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lesson', lessonSchema);
