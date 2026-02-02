import Service from '../models/Service.js';

// @desc    Get all services
// @route   GET /api/services
// @access  Public
export const getAllServices = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 50, all } = req.query;

    // If 'all' query param is set, return all services including inactive
    if (all === 'true') {
      const services = await Service.find().sort({ order: 1, createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: services.length,
        data: services
      });
    }

    let query = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    const skip = (page - 1) * limit;

    const services = await Service.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Service.countDocuments(query);

    res.status(200).json({
      success: true,
      count: services.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: services
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured services
// @route   GET /api/services/featured
// @access  Public
export const getFeaturedServices = async (req, res, next) => {
  try {
    const services = await Service.find({ isFeatured: true, isActive: true })
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get service by ID
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new service
// @route   POST /api/services
// @access  Private/Admin
export const createService = async (req, res, next) => {
  try {
    const service = await Service.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Admin
export const updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Admin
export const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    await service.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk update/upsert services
// @route   PUT /api/services/bulk
// @access  Private/Admin
export const bulkUpdateServices = async (req, res, next) => {
  try {
    const { services } = req.body;

    if (!services || !Array.isArray(services)) {
      return res.status(400).json({
        success: false,
        message: 'Services array is required'
      });
    }

    const results = [];

    for (const service of services) {
      if (service.serviceId) {
        // Upsert based on serviceId
        const updated = await Service.findOneAndUpdate(
          { serviceId: service.serviceId },
          service,
          { new: true, upsert: true, runValidators: true }
        );
        results.push(updated);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Services updated successfully',
      count: results.length,
      data: results
    });
  } catch (error) {
    next(error);
  }
};
