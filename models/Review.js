const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value for rating'
    }
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['published', 'pending', 'hidden', 'deleted'],
    default: 'pending'
  },
  userNameSnapshot: {
    type: String
  },
  userAvatarSnapshot: {
    type: String
  }
}, {
  timestamps: true
});

// Compound unique index for one review per user per course
reviewSchema.index({ courseId: 1, userId: 1 }, { unique: true });

// Index for efficiently fetching latest published course reviews
reviewSchema.index({ courseId: 1, status: 1, createdAt: -1 });

// Index for top rating lookups if needed
reviewSchema.index({ courseId: 1, status: 1, rating: -1 });

module.exports = mongoose.model('Review', reviewSchema);
