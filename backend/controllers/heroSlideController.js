import HeroSlide from '../models/HeroSlide.js';

// @desc    Get all hero slides
// @route   GET /api/hero-slides
// @access  Public
export const getHeroSlides = async (req, res, next) => {
  try {
    const slides = await HeroSlide.find({ isActive: true }).sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: slides.length,
      data: slides
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single hero slide
// @route   GET /api/hero-slides/:id
// @access  Public
export const getHeroSlide = async (req, res, next) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Hero slide not found'
      });
    }

    res.status(200).json({
      success: true,
      data: slide
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create hero slide
// @route   POST /api/hero-slides
// @access  Private/Admin
export const createHeroSlide = async (req, res, next) => {
  try {
    const slide = await HeroSlide.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Hero slide created successfully',
      data: slide
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update hero slide
// @route   PUT /api/hero-slides/:id
// @access  Private/Admin
export const updateHeroSlide = async (req, res, next) => {
  try {
    const slide = await HeroSlide.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Hero slide not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Hero slide updated successfully',
      data: slide
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete hero slide
// @route   DELETE /api/hero-slides/:id
// @access  Private/Admin
export const deleteHeroSlide = async (req, res, next) => {
  try {
    const slide = await HeroSlide.findByIdAndDelete(req.params.id);

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Hero slide not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Hero slide deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
