import Update from '../models/Update.js';

// @desc    Get all updates
// @route   GET /api/updates
// @access  Public
export const getAllUpdates = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 12 } = req.query;

    let query = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    const skip = (page - 1) * limit;

    const updates = await Update.find(query)
      .sort({ isPinned: -1, date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Update.countDocuments(query);

    res.status(200).json({
      success: true,
      count: updates.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: updates
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pinned updates
// @route   GET /api/updates/pinned
// @access  Public
export const getPinnedUpdates = async (req, res, next) => {
  try {
    const updates = await Update.find({ isPinned: true, isActive: true })
      .sort({ date: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      count: updates.length,
      data: updates
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get update by ID
// @route   GET /api/updates/:id
// @access  Public
export const getUpdateById = async (req, res, next) => {
  try {
    const update = await Update.findById(req.params.id);

    if (!update) {
      return res.status(404).json({
        success: false,
        message: 'Update not found'
      });
    }

    res.status(200).json({
      success: true,
      data: update
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new update
// @route   POST /api/updates
// @access  Private/Admin
export const createUpdate = async (req, res, next) => {
  try {
    const update = await Update.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Update created successfully',
      data: update
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update update
// @route   PUT /api/updates/:id
// @access  Private/Admin
export const updateUpdate = async (req, res, next) => {
  try {
    const update = await Update.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!update) {
      return res.status(404).json({
        success: false,
        message: 'Update not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Update updated successfully',
      data: update
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete update
// @route   DELETE /api/updates/:id
// @access  Private/Admin
export const deleteUpdate = async (req, res, next) => {
  try {
    const update = await Update.findById(req.params.id);

    if (!update) {
      return res.status(404).json({
        success: false,
        message: 'Update not found'
      });
    }

    await update.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Update deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
