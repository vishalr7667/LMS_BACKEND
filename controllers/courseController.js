const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');

// @desc    Get all published courses (with optional filters)
// @access  Public
exports.getAllCourses = async (req, res) => {
  try {
    console.log('Received query parameters:', req.query);
    const { category, accessType, search, sort } = req.query;
    const query = { isPublished: true };

    if (category && category !== 'All') query.category = category;
    if (accessType) query.accessType = accessType;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { order: 1, createdAt: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };
    if (sort === 'popular') sortOption = { 'rating.count': -1 };
    if (sort === 'price-low') sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };

    const courses = await Course.find(query).sort(sortOption);

    res.json({ success: true, count: courses.length, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get featured courses (marked by admin)
// @access  Public
exports.getFeaturedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true, isFeatured: true })
      .sort({ order: 1, createdAt: -1 })
      .limit(6);
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get public stats for homepage (total courses, lessons, students)
// @access  Public
exports.getStats = async (req, res) => {
  try {
    const [totalCourses, totalLessons, totalStudents] = await Promise.all([
      Course.countDocuments({ isPublished: true }),
      Lesson.countDocuments(),
      User.countDocuments({ role: { $ne: 'admin' } }),
    ]);
    res.json({ success: true, stats: { totalCourses, totalLessons, totalStudents } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get list of categories with course counts
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Course.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single course with modules and lessons
// @access  Public
exports.getCourseBySlug = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug, isPublished: true });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // 1. Determine Full Access Entitlement
    let hasFullAccess = false;
    
    if (req.user) {
      if (req.user.role === 'admin') {
        hasFullAccess = true;
      } else {
        const enrollment = await Enrollment.findOne({ 
          userId: req.user._id, 
          courseId: course._id,
          status: 'active'
        });
        if (enrollment) hasFullAccess = true;
      }
    }

    // Check if course is free
    if (course.accessType === 'free') {
      hasFullAccess = true;
    }

    // 2. Get modules with sanitized lessons
    const modules = await Module.find({ courseId: course._id })
      .sort({ order: 1 })
      .lean();

    // Fields to sanitize if access is denied
    const premiumFields = ['videoUrl', 'resources', 'attachments', 'textContent', 'images', 'transcript'];

    for (let mod of modules) {
      const lessons = await Lesson.find({ moduleId: mod._id })
        .sort({ order: 1 })
        .lean();
      
      mod.lessons = lessons.map(lesson => {
        const canAccess = hasFullAccess || lesson.isFreePreview;
        const isLocked = !canAccess;

        // Base lesson object with metadata
        const sanitizedLesson = {
          ...lesson,
          canAccess,
          isLocked,
          isFreePreview: !!lesson.isFreePreview
        };

        // If locked, strip ALL premium content
        if (isLocked) {
          premiumFields.forEach(field => {
            delete sanitizedLesson[field];
          });
        }

        return sanitizedLesson;
      });
    }

    res.json({ success: true, course, modules, hasFullAccess });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const Review = require('../models/Review');
const Progress = require('../models/Progress'); // Note: Enrollment requires progress relation

// @desc    Get reviews for a course
// @access  Public
exports.getCourseReviews = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug, isPublished: true });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const mode = req.query.mode || 'preview';
    const limit = parseInt(req.query.limit) || (mode === 'preview' ? 6 : 10);
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const query = { courseId: course._id, status: 'published' };

    const [reviews, totalReviews] = await Promise.all([
      Review.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name avatar') // Selecting minimal fields
        .lean(),
      Review.countDocuments(query)
    ]);

    const hasMore = totalReviews > skip + reviews.length;

    if (mode === 'preview') {
      return res.json({
        success: true,
        summary: course.rating,
        items: reviews,
        hasMore
      });
    }

    res.json({
      success: true,
      summary: course.rating,
      items: reviews,
      pagination: {
        page,
        limit,
        total: totalReviews,
        totalPages: Math.ceil(totalReviews / limit),
        hasMore
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upsert a course review
// @access  Private
exports.upsertCourseReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (req.user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Admins are not allowed to submit reviews' });
    }

    if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Please provide a valid rating between 1 and 5' });
    }
    
    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Comment is required' });
    }

    const course = await Course.findOne({ slug: req.params.slug, isPublished: true });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Verify enrollment using Enrollment schema
    const enrollment = await Enrollment.findOne({ userId: req.user._id, courseId: course._id });
    if (!enrollment && course.accessType !== 'free') {
      return res.status(403).json({ success: false, message: 'You must be enrolled to review this course' });
    }

    let review = await Review.findOne({ courseId: course._id, userId: req.user._id });

    if (!review) {
      // Create new review
      review = new Review({
        courseId: course._id,
        userId: req.user._id,
        rating: rating,
        comment: comment.trim().substring(0, 1000), // Enforce max length
        userNameSnapshot: req.user.name,
        userAvatarSnapshot: req.user.avatar,
        status: 'pending' // Requires admin approval
      });
    } else {
      // If it was published before and now updated, the frontend rating is out of sync until a re-calculation.
      // But for simplicity based on the plan, updates set it back to pending.
      // An elegant approach: admin handles it.
      review.rating = rating;
      review.comment = comment.trim().substring(0, 1000);
      review.userNameSnapshot = req.user.name;
      review.userAvatarSnapshot = req.user.avatar;
      
      // Changed to pending since it was updated and needs re-approval
      review.status = 'pending';
    }

    await review.save();

    res.json({
      success: true,
      message: 'Review submitted and is pending admin approval',
      review,
      courseRating: course.rating // Returning current, untouched course rating
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
