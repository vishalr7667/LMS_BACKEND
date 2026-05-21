const slugify = require('slugify');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Resource = require('../models/Resource');
const Progress = require('../models/Progress');
const Setting = require('../models/Setting');
const Subscriber = require('../models/Subscriber');
const agenda = require('../utils/queue');

// ===================== DASHBOARD =====================

// @desc    Get admin dashboard stats
exports.getStats = async (req, res) => {
  try {
    const [totalCourses, totalUsers, totalLessons, totalResources, totalComments] = await Promise.all([
      Course.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Lesson.countDocuments(),
      Resource.countDocuments(),
      Comment.countDocuments()
    ]);

    const subscriberCount = 0;

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      stats: { totalCourses, totalUsers, totalLessons, totalResources, totalComments, subscriberCount },
      recentUsers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== COURSES =====================

exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const courseData = req.body;
    courseData.slug = slugify(courseData.title, { lower: true, strict: true });

    // Check slug uniqueness
    const existing = await Course.findOne({ slug: courseData.slug });
    if (existing) {
      courseData.slug += '-' + Date.now();
    }

    const course = await Course.create(courseData);
    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, course });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid Course ID format' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleFeatured = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    course.isFeatured = !course.isFeatured;
    await course.save();
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // Cascade delete modules, lessons, progress
    const modules = await Module.find({ courseId: req.params.id });
    const moduleIds = modules.map(m => m._id);
    await Lesson.deleteMany({ moduleId: { $in: moduleIds } });
    await Module.deleteMany({ courseId: req.params.id });
    await Progress.deleteMany({ courseId: req.params.id });

    res.json({ success: true, message: 'Course and related data deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== MODULES =====================

exports.getModules = async (req, res) => {
  try {
    const modules = await Module.find({ courseId: req.params.courseId }).sort({ order: 1 });
    res.json({ success: true, modules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createModule = async (req, res) => {
  try {
    const module = await Module.create(req.body);
    res.status(201).json({ success: true, module });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateModule = async (req, res) => {
  try {
    const module = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!module) return res.status(404).json({ success: false, message: 'Module not found' });
    res.json({ success: true, module });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteModule = async (req, res) => {
  try {
    const module = await Module.findByIdAndDelete(req.params.id);
    if (!module) return res.status(404).json({ success: false, message: 'Module not found' });
    await Lesson.deleteMany({ moduleId: req.params.id });
    res.json({ success: true, message: 'Module and lessons deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== LESSONS =====================

exports.getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find({ moduleId: req.params.moduleId }).sort({ order: 1 });
    res.json({ success: true, lessons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createLesson = async (req, res) => {
  try {
    const lesson = await Lesson.create(req.body);

    // Update course total lessons count
    const totalLessons = await Lesson.countDocuments({ courseId: lesson.courseId });
    await Course.findByIdAndUpdate(lesson.courseId, { totalLessons });

    res.status(201).json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    res.json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    // Update course total lessons count
    const totalLessons = await Lesson.countDocuments({ courseId: lesson.courseId });
    await Course.findByIdAndUpdate(lesson.courseId, { totalLessons });

    res.json({ success: true, message: 'Lesson deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== USERS =====================

exports.getUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));

    res.json({ success: true, users, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { role, subscription } = req.body;
    const updateData = {};
    if (role) updateData.role = role;
    if (subscription) updateData.subscription = subscription;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Progress.deleteMany({ userId: req.params.id });
    await Comment.deleteMany({ userId: req.params.id });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== COMMENTS =====================

exports.getComments = async (req, res) => {
  try {
    const { approved, page = 1, limit = 20 } = req.query;
    const query = {};
    if (approved !== undefined) query.isApproved = approved === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Comment.countDocuments(query);
    const comments = await Comment.find(query)
      .populate('userId', 'name email avatar')
      .populate('lessonId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ success: true, comments, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, { isApproved: req.body.isApproved }, { new: true });
    res.json({ success: true, comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    // Also delete replies
    await Comment.deleteMany({ parentId: req.params.id });
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== RESOURCES =====================

exports.getResources = async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json({ success: true, resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createResource = async (req, res) => {
  try {
    const resource = await Resource.create(req.body);
    res.status(201).json({ success: true, resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    res.json({ success: true, resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== REVIEWS =====================
const Review = require('../models/Review');

exports.getReviews = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate('userId', 'name email avatar')
      .populate('courseId', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ success: true, reviews, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['published', 'pending', 'hidden', 'deleted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    const oldStatus = review.status;
    review.status = status;
    await review.save();

    // Re-calculate course rating
    const course = await Course.findById(review.courseId);
    if (course) {
      let sum = course.rating?.sum || 0;
      let count = course.rating?.count || 0;

      // If review was just published
      if (oldStatus !== 'published' && status === 'published') {
        sum += review.rating;
        count += 1;
      }
      // If review was unpublished
      else if (oldStatus === 'published' && status !== 'published') {
        sum -= review.rating;
        count -= 1;
        // prevent negative just in case of out of sync state
        if (count < 0) count = 0;
        if (sum < 0) sum = 0;
      }

      const average = count > 0 ? (sum / count) : 0;
      course.rating = {
        average: Number(average.toFixed(1)),
        count,
        sum
      };
      await course.save();
    }

    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    // Deduct math logic
    if (review.status === 'published') {
      const course = await Course.findById(review.courseId);
      if (course) {
        let sum = course.rating?.sum || 0;
        let count = course.rating?.count || 0;
        sum -= review.rating;
        count -= 1;
        if (count < 0) count = 0;
        if (sum < 0) sum = 0;
        
        const average = count > 0 ? (sum / count) : 0;
        course.rating = {
          average: Number(average.toFixed(1)),
          count,
          sum
        };
        await course.save();
      }
    }

    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== SITE SETTINGS =====================

exports.getSettings = async (req, res) => {
  try {
    const settings = await Setting.getSettings();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const oldSettings = await Setting.getSettings();
    const settings = await Setting.findOneAndUpdate({}, req.body, {
      returnDocument: 'after',
      upsert: true,
      runValidators: true
    });

    // If maintenance mode was turned OFF
    if (oldSettings.maintenanceMode === true && settings.maintenanceMode === false) {
      console.log('[Maintenance] Mode turned OFF. Triggering notifications...');
      await agenda.now('notify-maintenance-ended');
    }

    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== PUBLIC SETTINGS =====================

exports.getPublicSettings = async (req, res) => {
  try {
    const settings = await Setting.getSettings();
    // Return only non-sensitive data
    const publicSettings = {
      siteName: settings.siteName,
      siteTagline: settings.siteTagline,
      socialTwitter: settings.socialTwitter,
      socialYoutube: settings.socialYoutube,
      socialDiscord: settings.socialDiscord,
      maintenanceMode: settings.maintenanceMode,
      enableRegistration: settings.enableRegistration,
      enableComments: settings.enableComments
    };
    res.json({ success: true, settings: publicSettings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    // Check if already subscribed
    let sub = await Subscriber.findOne({ email });
    if (sub) {
      return res.json({ success: true, message: 'You are already on the list!' });
    }

    await Subscriber.create({ email });
    res.status(201).json({ success: true, message: 'Successfully subscribed! We will notify you.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
