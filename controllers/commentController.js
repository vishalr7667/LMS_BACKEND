const Comment = require('../models/Comment');

// @desc    Get comments for a lesson
// @access  Public
exports.getCommentsByLesson = async (req, res) => {
  try {
    const comments = await Comment.find({
      lessonId: req.params.lessonId,
      parentId: null,
      isApproved: true
    })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();

    // Get replies for each comment
    for (let comment of comments) {
      comment.replies = await Comment.find({
        parentId: comment._id,
        isApproved: true
      })
        .populate('userId', 'name avatar')
        .sort({ createdAt: 1 })
        .lean();
    }

    res.json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Post a new comment
// @access  Private
exports.createComment = async (req, res) => {
  try {
    const { lessonId, content, parentId } = req.body;

    const comment = await Comment.create({
      lessonId,
      userId: req.user._id,
      content,
      parentId: parentId || null
    });

    const populated = await Comment.findById(comment._id)
      .populate('userId', 'name avatar');

    res.status(201).json({ success: true, comment: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
