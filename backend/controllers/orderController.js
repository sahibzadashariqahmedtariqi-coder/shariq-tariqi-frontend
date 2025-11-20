import Order from '../models/Order.js';
import Course from '../models/Course.js';
import Product from '../models/Product.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
export const createOrder = async (req, res, next) => {
  try {
    const {
      orderType,
      itemId,
      customerName,
      customerEmail,
      customerPhone,
      appointmentDate,
      appointmentTime,
      shippingAddress,
      quantity,
      customerMessage,
    } = req.body;

    // Validate item exists and get details
    let item;
    let amount;
    let itemTitle;

    if (orderType === 'course') {
      item = await Course.findById(itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }
      amount = item.price;
      itemTitle = item.title; // Course uses 'title' field
    } else if (orderType === 'product') {
      item = await Product.findById(itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }
      amount = item.price * (quantity || 1);
      itemTitle = item.name; // Product uses 'name' field
    } else if (orderType === 'appointment') {
      // Appointments don't have itemId
      amount = 1000; // Default appointment charge
      itemTitle = 'Spiritual Consultation Appointment';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid order type',
      });
    }

    // Create order
    const order = await Order.create({
      orderType,
      itemId: orderType === 'appointment' ? null : itemId, // null for appointments
      itemTitle,
      userId: req.user?._id,
      customerName,
      customerEmail,
      customerPhone,
      amount,
      appointmentDate,
      appointmentTime,
      shippingAddress,
      quantity: quantity || 1,
      customerMessage,
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully. Please complete payment.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload payment proof
// @route   PUT /api/orders/:id/payment
// @access  Public
export const uploadPaymentProof = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentProof, transactionId, senderAccountNumber, paymentDate } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.paymentStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Payment already processed',
      });
    }

    order.paymentProof = paymentProof;
    order.transactionId = transactionId;
    order.senderAccountNumber = senderAccountNumber;
    order.paymentDate = paymentDate || Date.now();

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment proof uploaded successfully. Awaiting admin verification.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      $or: [
        { userId: req.user._id },
        { customerEmail: req.user.email },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, type, includeDeleted } = req.query;

    const filter = {};
    
    // Filter by deleted status
    if (includeDeleted === 'true') {
      filter.isDeleted = true;
    } else {
      filter.isDeleted = { $ne: true };
    }
    
    if (status) filter.paymentStatus = status;
    if (type) filter.orderType = type;

    const orders = await Order.find(filter)
      .populate('userId', 'name email')
      .populate('verifiedBy', 'name')
      .populate('deletedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment (Admin)
// @route   PUT /api/orders/:id/verify
// @access  Private/Admin
export const verifyPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.paymentStatus = 'verified';
    order.verifiedBy = req.user._id;
    order.verifiedAt = Date.now();
    order.adminNotes = adminNotes;

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject payment (Admin)
// @route   PUT /api/orders/:id/reject
// @access  Private/Admin
export const rejectPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.paymentStatus = 'rejected';
    order.rejectionReason = rejectionReason;
    order.verifiedBy = req.user._id;
    order.verifiedAt = Date.now();

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment rejected',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('verifiedBy', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
export const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Soft delete - move to trash
    order.isDeleted = true;
    order.deletedAt = Date.now();
    order.deletedBy = req.user._id;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order moved to trash successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Restore order from trash
// @route   PUT /api/orders/:id/restore
// @access  Private/Admin
export const restoreOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (!order.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Order is not in trash',
      });
    }

    // Restore from trash
    order.isDeleted = false;
    order.deletedAt = undefined;
    order.deletedBy = undefined;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order restored successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Permanently delete order
// @route   DELETE /api/orders/:id/permanent
// @access  Private/Admin
export const permanentDeleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    await order.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Order permanently deleted',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Track order by order number (Public)
// @route   GET /api/orders/track/:orderNumber
// @access  Public
export const trackOrder = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;

    const order = await Order.findOne({ orderNumber });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found. Please check your order number.',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
