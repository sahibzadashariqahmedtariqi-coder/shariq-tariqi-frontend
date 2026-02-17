import Coupon from '../models/Coupon.js';

// @desc    Get all coupons (admin)
// @route   GET /api/coupons
// @access  Admin
export const getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Admin
export const createCoupon = async (req, res, next) => {
  try {
    const { code, description, discountType, discountValue, applicableTo, minOrderAmount, maxUses, expiryDate, isActive } = req.body;

    // Check if code already exists
    const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists',
      });
    }

    // Validate percentage max 100
    if (discountType === 'percentage' && discountValue > 100) {
      return res.status(400).json({
        success: false,
        message: 'Percentage discount cannot exceed 100%',
      });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      description,
      discountType,
      discountValue,
      applicableTo: applicableTo || 'all',
      minOrderAmount: minOrderAmount || 0,
      maxUses: maxUses || 0,
      expiryDate: expiryDate || null,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Admin
export const updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // If code is being changed, check uniqueness
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase().trim();
      const existing = await Coupon.findOne({ code: updateData.code, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code already exists',
        });
      }
    }

    if (updateData.discountType === 'percentage' && updateData.discountValue > 100) {
      return res.status(400).json({
        success: false,
        message: 'Percentage discount cannot exceed 100%',
      });
    }

    const coupon = await Coupon.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Admin
export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle coupon active/inactive
// @route   PUT /api/coupons/:id/toggle
// @access  Admin
export const toggleCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.status(200).json({
      success: true,
      message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate a coupon code (public - used at checkout)
// @route   POST /api/coupons/validate
// @access  Public
export const validateCoupon = async (req, res, next) => {
  try {
    const { code, orderType, amount } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required',
      });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code',
      });
    }

    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This coupon is no longer active',
      });
    }

    // Check expiry
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has expired',
      });
    }

    // Check max uses
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has reached its usage limit',
      });
    }

    // Check applicability
    if (coupon.applicableTo !== 'all') {
      // Map orderType to applicableTo format
      const typeMap = {
        product: 'products',
        course: 'courses',
        appointment: 'appointments',
      };
      if (typeMap[orderType] !== coupon.applicableTo) {
        return res.status(400).json({
          success: false,
          message: `This coupon is only valid for ${coupon.applicableTo}`,
        });
      }
    }

    // Check minimum amount
    if (coupon.minOrderAmount > 0 && amount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount for this coupon is Rs. ${coupon.minOrderAmount}`,
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((amount * coupon.discountValue) / 100);
    } else {
      discount = Math.min(coupon.discountValue, amount); // Fixed discount can't exceed amount
    }

    const finalAmount = amount - discount;

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount,
        originalAmount: amount,
        finalAmount,
        isFreeOrder: finalAmount <= 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
