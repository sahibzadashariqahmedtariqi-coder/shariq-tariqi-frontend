import Donation from '../models/Donation.js';

// @desc    Create new donation
// @route   POST /api/donations
// @access  Public
export const createDonation = async (req, res) => {
  try {
    const {
      donorName,
      donorEmail,
      donorPhone,
      donorCountry,
      amount,
      currency,
      purpose,
      customPurpose,
      donorMessage,
      isAnonymous,
      isRecurring,
      recurringFrequency,
    } = req.body;

    const donation = await Donation.create({
      donorName,
      donorEmail,
      donorPhone,
      donorCountry,
      amount,
      currency,
      purpose,
      customPurpose,
      donorMessage,
      isAnonymous,
      isRecurring,
      recurringFrequency,
    });

    res.status(201).json({
      success: true,
      message: 'Donation initiated successfully',
      data: donation,
    });
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create donation',
      error: error.message,
    });
  }
};

// @desc    Upload payment proof for donation
// @route   PUT /api/donations/:id/payment
// @access  Public
export const uploadPaymentProof = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentProof, transactionId, senderAccountNumber } = req.body;

    const donation = await Donation.findByIdAndUpdate(
      id,
      {
        paymentProof,
        transactionId,
        senderAccountNumber,
        paymentDate: new Date(),
      },
      { new: true }
    );

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found',
      });
    }

    res.json({
      success: true,
      message: 'Payment proof uploaded successfully. JazakAllah Khair for your generous donation!',
      data: donation,
    });
  } catch (error) {
    console.error('Upload payment proof error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload payment proof',
      error: error.message,
    });
  }
};

// @desc    Get all donations (Admin)
// @route   GET /api/donations
// @access  Private/Admin
export const getAllDonations = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, purpose } = req.query;

    const query = {};
    if (status) query.paymentStatus = status;
    if (purpose) query.purpose = purpose;

    const donations = await Donation.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('verifiedBy', 'name email');

    const total = await Donation.countDocuments(query);

    res.json({
      success: true,
      data: donations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donations',
      error: error.message,
    });
  }
};

// @desc    Get donation by ID
// @route   GET /api/donations/:id
// @access  Public
export const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found',
      });
    }

    res.json({
      success: true,
      data: donation,
    });
  } catch (error) {
    console.error('Get donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donation',
      error: error.message,
    });
  }
};

// @desc    Verify donation (Admin)
// @route   PUT /api/donations/:id/verify
// @access  Private/Admin
export const verifyDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const donation = await Donation.findByIdAndUpdate(
      id,
      {
        paymentStatus: 'verified',
        verifiedBy: req.user._id,
        verifiedAt: new Date(),
        adminNotes,
      },
      { new: true }
    );

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found',
      });
    }

    res.json({
      success: true,
      message: 'Donation verified successfully',
      data: donation,
    });
  } catch (error) {
    console.error('Verify donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify donation',
      error: error.message,
    });
  }
};

// @desc    Reject donation (Admin)
// @route   PUT /api/donations/:id/reject
// @access  Private/Admin
export const rejectDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason, adminNotes } = req.body;

    const donation = await Donation.findByIdAndUpdate(
      id,
      {
        paymentStatus: 'rejected',
        verifiedBy: req.user._id,
        verifiedAt: new Date(),
        rejectionReason,
        adminNotes,
      },
      { new: true }
    );

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found',
      });
    }

    res.json({
      success: true,
      message: 'Donation rejected',
      data: donation,
    });
  } catch (error) {
    console.error('Reject donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject donation',
      error: error.message,
    });
  }
};

// @desc    Get donation stats (Admin)
// @route   GET /api/donations/stats
// @access  Private/Admin
export const getDonationStats = async (req, res) => {
  try {
    const totalDonations = await Donation.countDocuments();
    const verifiedDonations = await Donation.countDocuments({ paymentStatus: 'verified' });
    const pendingDonations = await Donation.countDocuments({ paymentStatus: 'pending' });

    // Total amount by currency
    const totalByPKR = await Donation.aggregate([
      { $match: { paymentStatus: 'verified', currency: 'PKR' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalByINR = await Donation.aggregate([
      { $match: { paymentStatus: 'verified', currency: 'INR' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // By purpose
    const byPurpose = await Donation.aggregate([
      { $match: { paymentStatus: 'verified' } },
      { $group: { _id: '$purpose', count: { $sum: 1 }, total: { $sum: '$amount' } } },
    ]);

    // Recent donations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCount = await Donation.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      paymentStatus: 'verified',
    });

    res.json({
      success: true,
      data: {
        total: totalDonations,
        verified: verifiedDonations,
        pending: pendingDonations,
        totalAmountPKR: totalByPKR[0]?.total || 0,
        totalAmountINR: totalByINR[0]?.total || 0,
        byPurpose,
        recentCount,
      },
    });
  } catch (error) {
    console.error('Get donation stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donation stats',
      error: error.message,
    });
  }
};

// @desc    Delete donation (Admin)
// @route   DELETE /api/donations/:id
// @access  Private/Admin
export const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findByIdAndDelete(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found',
      });
    }

    res.json({
      success: true,
      message: 'Donation deleted successfully',
    });
  } catch (error) {
    console.error('Delete donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete donation',
      error: error.message,
    });
  }
};
