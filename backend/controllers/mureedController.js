import { getMureedModel } from '../models/Mureed.js';

// Helper function to get Mureed model
const getMureed = () => getMureedModel();

// Register a new Mureed
export const registerMureed = async (req, res) => {
  try {
    const Mureed = getMureed();
    const {
      fullName,
      fatherName,
      contactNumber,
      country,
      city,
      dateOfBirth,
      address,
      profilePicture,
      email,
    } = req.body;

    // Validate required fields
    if (!fullName || !fatherName || !contactNumber || !country || !city || !dateOfBirth || !address || !profilePicture) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check if contact number already exists
    const existingMureed = await Mureed.findOne({ contactNumber });
    if (existingMureed) {
      return res.status(400).json({
        success: false,
        message: 'A Mureed with this contact number already exists',
        existingMureedId: existingMureed.mureedId,
      });
    }

    // Create new Mureed
    const mureed = await Mureed.create({
      fullName,
      fatherName,
      contactNumber,
      country,
      city,
      dateOfBirth: new Date(dateOfBirth),
      address,
      profilePicture,
      email,
      status: 'approved', // Auto-approve for now
      cardGeneratedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Mureed registered successfully',
      data: mureed,
    });
  } catch (error) {
    console.error('Error registering mureed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register mureed',
      error: error.message,
    });
  }
};

// Get Mureed by ID
export const getMureedById = async (req, res) => {
  try {
    const Mureed = getMureed();
    const { id } = req.params;
    
    // Try to find by mureedId first, then by MongoDB _id
    let mureed = await Mureed.findOne({ mureedId: parseInt(id) });
    
    if (!mureed) {
      mureed = await Mureed.findById(id);
    }

    if (!mureed) {
      return res.status(404).json({
        success: false,
        message: 'Mureed not found',
      });
    }

    res.status(200).json({
      success: true,
      data: mureed,
    });
  } catch (error) {
    console.error('Error fetching mureed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mureed',
      error: error.message,
    });
  }
};

// Get all Mureeds (Admin)
export const getAllMureeds = async (req, res) => {
  try {
    const Mureed = getMureed();
    const { page = 1, limit = 20, status, search } = req.query;
    
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { fatherName: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Mureed.countDocuments(query);
    const mureeds = await Mureed.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: mureeds,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching mureeds:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mureeds',
      error: error.message,
    });
  }
};

// Update Mureed status (Admin)
export const updateMureedStatus = async (req, res) => {
  try {
    const Mureed = getMureed();
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const mureed = await Mureed.findByIdAndUpdate(
      id,
      { 
        status,
        ...(status === 'approved' && { cardGeneratedAt: new Date() }),
      },
      { new: true }
    );

    if (!mureed) {
      return res.status(404).json({
        success: false,
        message: 'Mureed not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `Mureed ${status} successfully`,
      data: mureed,
    });
  } catch (error) {
    console.error('Error updating mureed status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update mureed status',
      error: error.message,
    });
  }
};

// Delete Mureed (Admin)
export const deleteMureed = async (req, res) => {
  try {
    const Mureed = getMureed();
    const { id } = req.params;

    const mureed = await Mureed.findByIdAndDelete(id);

    if (!mureed) {
      return res.status(404).json({
        success: false,
        message: 'Mureed not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Mureed deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting mureed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete mureed',
      error: error.message,
    });
  }
};

// Get Mureed stats (Admin)
export const getMureedStats = async (req, res) => {
  try {
    const Mureed = getMureed();
    const total = await Mureed.countDocuments();
    const approved = await Mureed.countDocuments({ status: 'approved' });
    const pending = await Mureed.countDocuments({ status: 'pending' });
    const rejected = await Mureed.countDocuments({ status: 'rejected' });

    // Get country-wise distribution
    const countryStats = await Mureed.aggregate([
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCount = await Mureed.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        approved,
        pending,
        rejected,
        recentCount,
        countryStats,
      },
    });
  } catch (error) {
    console.error('Error fetching mureed stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message,
    });
  }
};

// Check if contact exists
export const checkContact = async (req, res) => {
  try {
    const Mureed = getMureed();
    const { contact } = req.params;
    
    const mureed = await Mureed.findOne({ contactNumber: contact });
    
    res.status(200).json({
      success: true,
      exists: !!mureed,
      mureedId: mureed?.mureedId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking contact',
    });
  }
};
