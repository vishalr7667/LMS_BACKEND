const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Course description is required']
  },
  shortDescription: {
    type: String,
    maxlength: 200
  },
  coverImage: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Game Development',
      'Computer Science',
      'Programming Languages',
      'Computer Graphics',
      'Electronics',
      'Mathematics',
      'VFX & Motion',
      'Other'
    ]
  },
  tags: [String],
  instructor: {
    name: { type: String, default: 'VFXVault Team' },
    bio: String,
    avatar: String
  },
  accessType: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free'
  },
  totalDuration: {
    type: String,
    default: '0 hours'
  },
  totalLessons: {
    type: Number,
    default: 0
  },
  features: [{
    type: String
  }],
  price: {
    type: Number,
    default: 0
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    sum: { type: Number, default: 0 }
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual: get modules for this course
courseSchema.virtual('modules', {
  ref: 'Module',
  localField: '_id',
  foreignField: 'courseId'
});

module.exports = mongoose.model('Course', courseSchema);
