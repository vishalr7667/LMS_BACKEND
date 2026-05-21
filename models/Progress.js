const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  completedLessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  lastLessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  lastVideoTimestamp: {
    type: Number,
    default: 0
  },
  completionPercent: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index to ensure one progress record per user per course
progressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
