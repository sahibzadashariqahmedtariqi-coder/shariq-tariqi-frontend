import Stats from '../models/Stats.js';

// @desc    Get stats
// @route   GET /api/stats
// @access  Public
export const getStats = async (req, res, next) => {
  try {
    const stats = await Stats.getInstance();
    
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update stats
// @route   PUT /api/stats
// @access  Private/Admin
export const updateStats = async (req, res, next) => {
  try {
    const {
      studentsTrained,
      averageRating,
      coursesOffered,
      subscribers,
      yearsOfExperience,
    } = req.body;

    // Validate average rating
    if (averageRating && (averageRating < 0 || averageRating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Average rating must be between 0 and 5',
      });
    }

    // Get the singleton stats document
    let stats = await Stats.getInstance();

    // Update fields if provided
    if (studentsTrained !== undefined) stats.studentsTrained = studentsTrained;
    if (averageRating !== undefined) stats.averageRating = averageRating;
    if (coursesOffered !== undefined) stats.coursesOffered = coursesOffered;
    if (subscribers !== undefined) stats.subscribers = subscribers;
    if (yearsOfExperience !== undefined) stats.yearsOfExperience = yearsOfExperience;

    // Track who updated
    stats.lastUpdatedBy = req.user._id;
    stats.lastUpdatedAt = Date.now();

    await stats.save();

    res.status(200).json({
      success: true,
      message: 'Stats updated successfully',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
