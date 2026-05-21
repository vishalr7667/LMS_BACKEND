const mongoose = require('mongoose');
const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// @desc    Enroll user in a course (create progress record)
// @access  Private
exports.enroll = async (req, res) => {
  try {
    const { courseId } = req.body;

    // Check if already enrolled
    const existing = await Progress.findOne({ userId: req.user._id, courseId });
    if (existing) {
      return res.json({ success: true, message: 'Already enrolled', progress: existing });
    }

    const progress = await Progress.create({
      userId: req.user._id,
      courseId,
      completedLessons: [],
      completionPercent: 0
    });

    res.status(201).json({ success: true, message: 'Enrolled successfully', progress });
  } catch (error) {
    console.error('Error in enroll:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all enrolled courses with progress for current user
// @access  Private
exports.getMyCourses = async (req, res) => {
  try {
    const progressList = await Progress.find({ userId: req.user._id })
      .populate('courseId', 'title slug shortDescription category coverImage totalDuration totalLessons accessType price')
      .populate('lastLessonId', 'title')
      .sort({ updatedAt: -1 })
      .lean();

    // Filter out any with deleted courses
    const courses = progressList
      .filter(p => p.courseId)
      .map(p => ({
        _id: p._id,
        courseId: p.courseId._id,
        title: p.courseId.title,
        slug: p.courseId.slug,
        shortDescription: p.courseId.shortDescription,
        category: p.courseId.category,
        coverImage: p.courseId.coverImage,
        totalDuration: p.courseId.totalDuration,
        totalLessons: p.courseId.totalLessons,
        accessType: p.courseId.accessType,
        completedLessons: (p.completedLessons || []).length,
        completionPercent: p.completionPercent,
        lastLesson: p.lastLessonId?.title || null,
        lastVideoTimestamp: p.lastVideoTimestamp,
        enrolledAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));

    res.json({ success: true, courses });
  } catch (error) {
    console.error('Error in getMyCourses:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get aggregated dashboard stats for current user
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const progressList = await Progress.find({ userId: req.user._id }).lean();

    const enrolled = progressList.length;
    const completed = progressList.filter(p => p.completionPercent === 100).length;
    const inProgress = progressList.filter(p => p.completionPercent > 0 && p.completionPercent < 100).length;
    const totalLessonsCompleted = progressList.reduce((acc, p) => acc + (p.completedLessons?.length || 0), 0);

    res.json({
      success: true,
      stats: { enrolled, completed, inProgress, totalLessonsCompleted }
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark a lesson as completed
// @access  Private
exports.completeLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;

    // 1. Verify entitlement
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    const isAuthorized = 
      req.user.role === 'admin' || 
      course.accessType === 'free' || 
      lesson.isFreePreview ||
      await Enrollment.exists({ userId: req.user._id, courseId, status: 'active' });

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'You must be enrolled to track progress in this course' });
    }

    // 2. Get total lessons for course
    const totalLessons = await Lesson.countDocuments({ courseId });

    let progress = await Progress.findOne({ userId: req.user._id, courseId });

    if (!progress) {
      progress = new Progress({
        userId: req.user._id,
        courseId,
        completedLessons: [lessonId],
        lastLessonId: lessonId,
        completionPercent: Math.round((1 / totalLessons) * 100)
      });
    } else {
      if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
      }
      progress.lastLessonId = lessonId;
      progress.completionPercent = Math.round((progress.completedLessons.length / totalLessons) * 100);
    }

    await progress.save();
    res.json({ success: true, progress });
  } catch (error) {
    console.error('Error in completeLesson:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save video resume position
// @access  Private
exports.updateVideoTimestamp = async (req, res) => {
  try {
    const { courseId, lessonId, timestamp } = req.body;

    // 1. Verify entitlement
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    const isAuthorized = 
      req.user.role === 'admin' || 
      course.accessType === 'free' || 
      lesson.isFreePreview ||
      await Enrollment.exists({ userId: req.user._id, courseId, status: 'active' });

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'You must be enrolled to track progress in this course' });
    }

    let progress = await Progress.findOne({ userId: req.user._id, courseId });

    if (!progress) {
      progress = new Progress({
        userId: req.user._id,
        courseId,
        lastLessonId: lessonId,
        lastVideoTimestamp: timestamp
      });
    } else {
      progress.lastLessonId = lessonId;
      progress.lastVideoTimestamp = timestamp;
    }

    await progress.save();
    res.json({ success: true, progress });
  } catch (error) {
    console.error('Error in updateVideoTimestamp:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's progress for a course
// @access  Private
exports.getCourseProgress = async (req, res) => {
  try {
    // Robustly handle cases where :courseId is not a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.courseId)) {
      return res.status(404).json({ success: false, message: 'Invalid Course ID format' });
    }

    let progress = await Progress.findOne({
      userId: req.user._id,
      courseId: req.params.courseId
    });

    if (!progress) {
      progress = { completedLessons: [], completionPercent: 0, lastLessonId: null, lastVideoTimestamp: 0 };
    }

    res.json({ success: true, progress });
  } catch (error) {
    console.error(`Error in getCourseProgress:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};
