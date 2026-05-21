const Lesson = require('../models/Lesson');
const Course = require('../models/Course');

// @desc    Get lesson content (access controlled)
// @access  Public (free preview) / Private (premium)
exports.getLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const course = await Course.findById(lesson.courseId);

    // Check access: free courses or free preview lessons are accessible
    if (course.accessType === 'premium' && !lesson.isFreePreview) {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Login required to access this lesson' });
      }
      if (req.user.role !== 'admin' && req.user.role !== 'subscriber' &&
        !(req.user.subscription && req.user.subscription.status === 'active')) {
        return res.status(403).json({
          success: false,
          message: 'Active subscription required',
          locked: true
        });
      }
    }

    res.json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
