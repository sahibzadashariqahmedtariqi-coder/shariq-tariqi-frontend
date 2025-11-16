import Video from '../models/Video.js';

// @desc    Get all videos
// @route   GET /api/videos
// @access  Public
export const getAllVideos = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;

    let query = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const videos = await Video.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Video.countDocuments(query);

    res.status(200).json({
      success: true,
      count: videos.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: videos
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured videos
// @route   GET /api/videos/featured
// @access  Public
export const getFeaturedVideos = async (req, res, next) => {
  try {
    const videos = await Video.find({ isFeatured: true, isActive: true })
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get video by ID
// @route   GET /api/videos/:id
// @access  Public
export const getVideoById = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Increment views
    video.views += 1;
    await video.save();

    res.status(200).json({
      success: true,
      data: video
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new video
// @route   POST /api/videos
// @access  Private/Admin
export const createVideo = async (req, res, next) => {
  try {
    const video = await Video.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Video created successfully',
      data: video
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update video
// @route   PUT /api/videos/:id
// @access  Private/Admin
export const updateVideo = async (req, res, next) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Video updated successfully',
      data: video
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete video
// @route   DELETE /api/videos/:id
// @access  Private/Admin
export const deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    await video.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
