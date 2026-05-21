const Resource = require('../models/Resource');

// @desc    Get all published resources (with filters)
// @access  Public
exports.getAllResources = async (req, res) => {
  try {
    const { category, accessType, search, sort, page = 1, limit = 12 } = req.query;
    const query = { isPublished: true };

    if (category && category !== 'All') query.category = category;
    if (accessType) query.accessType = accessType;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'popular') sortOption = { downloadCount: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'name') sortOption = { title: 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Resource.countDocuments(query);
    const resources = await Resource.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      resources,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single resource
// @access  Public
exports.getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource || !resource.isPublished) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.json({ success: true, resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Download a resource (access controlled)
// @access  Public (free) / Private (premium)
exports.downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    if (resource.accessType === 'premium') {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Login required' });
      }
      if (req.user.role !== 'admin' && req.user.role !== 'subscriber' &&
        !(req.user.subscription && req.user.subscription.status === 'active')) {
        return res.status(403).json({ success: false, message: 'Subscription required' });
      }
    }

    // Increment download count
    resource.downloadCount += 1;
    await resource.save();

    res.json({ success: true, downloadUrl: resource.fileUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
