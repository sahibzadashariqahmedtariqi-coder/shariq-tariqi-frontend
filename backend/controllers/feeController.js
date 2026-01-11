import User from '../models/User.js';
import FeePayment from '../models/FeePayment.js';
import { v2 as cloudinary } from 'cloudinary';

// Generate unique student ID like: SAT-2026-0001
const generateStudentId = async () => {
  const year = new Date().getFullYear();
  const prefix = `SAT-${year}`;
  
  // Find the highest student ID for this year
  const lastStudent = await User.findOne({
    studentId: { $regex: `^${prefix}` }
  }).sort({ studentId: -1 });
  
  let nextNumber = 1;
  if (lastStudent && lastStudent.studentId) {
    const lastNumber = parseInt(lastStudent.studentId.split('-')[2]);
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
};

// @desc    Create paid student with credentials (Admin only)
// @route   POST /api/fee/create-student
// @access  Admin
export const createPaidStudent = async (req, res) => {
  try {
    const { name, phone, monthlyFee, courses } = req.body;

    if (!name || !phone || !monthlyFee) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone and monthly fee are required'
      });
    }

    // Generate unique student ID
    const studentId = await generateStudentId();
    
    // Create email using student ID
    const email = `${studentId.toLowerCase()}@student.shariqahmedtariqi.com`;
    
    // Generate a random password
    const password = `Student@${Math.random().toString(36).slice(-8)}`;

    // Create the paid student
    const student = await User.create({
      name,
      email,
      password,
      phone,
      role: 'user',
      isPaidStudent: true,
      studentId,
      monthlyFee,
      feeStatus: 'active',
      enrollmentDate: new Date(),
      grantedCourses: courses ? courses.map(courseId => ({
        courseId,
        grantedBy: req.user._id,
        grantedAt: new Date()
      })) : []
    });

    // Create first month fee record (current month)
    const now = new Date();
    const dueDate = new Date(now.getFullYear(), now.getMonth(), 10); // Due on 10th of month
    
    await FeePayment.create({
      student: student._id,
      studentId,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      amount: monthlyFee,
      status: 'pending',
      dueDate
    });

    res.status(201).json({
      success: true,
      message: 'Paid student created successfully',
      data: {
        student: {
          _id: student._id,
          name: student.name,
          email: student.email,
          phone: student.phone,
          studentId: student.studentId,
          monthlyFee: student.monthlyFee
        },
        credentials: {
          email,
          password,
          studentId
        }
      }
    });
  } catch (error) {
    console.error('Error creating paid student:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get all paid students (Admin only)
// @route   GET /api/fee/students
// @access  Admin
export const getAllPaidStudents = async (req, res) => {
  try {
    const students = await User.find({ isPaidStudent: true })
      .select('-password')
      .populate('grantedCourses.courseId', 'title')
      .sort({ createdAt: -1 });

    // Get fee status for each student
    const studentsWithFeeStatus = await Promise.all(
      students.map(async (student) => {
        const now = new Date();
        const currentMonthFee = await FeePayment.findOne({
          student: student._id,
          month: now.getMonth() + 1,
          year: now.getFullYear()
        });

        const pendingFees = await FeePayment.countDocuments({
          student: student._id,
          status: { $in: ['pending', 'submitted'] }
        });

        const overdueFees = await FeePayment.countDocuments({
          student: student._id,
          status: 'pending',
          dueDate: { $lt: now }
        });

        return {
          ...student.toObject(),
          currentMonthFee: currentMonthFee?.status || 'pending',
          pendingFees,
          overdueFees
        };
      })
    );

    res.json({
      success: true,
      count: studentsWithFeeStatus.length,
      data: studentsWithFeeStatus
    });
  } catch (error) {
    console.error('Error fetching paid students:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get student fee history
// @route   GET /api/fee/history/:studentId
// @access  Admin or Student (own history)
export const getFeeHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Check if user is admin or accessing own history
    const student = await User.findOne({ studentId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    if (req.user.role !== 'admin' && req.user._id.toString() !== student._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this history'
      });
    }

    const feeHistory = await FeePayment.find({ studentId })
      .populate('approvedBy', 'name')
      .populate('rejectedBy', 'name')
      .sort({ year: -1, month: -1 });

    res.json({
      success: true,
      data: {
        student: {
          _id: student._id,
          name: student.name,
          studentId: student.studentId,
          monthlyFee: student.monthlyFee,
          feeStatus: student.feeStatus,
          courseAccessBlocked: student.courseAccessBlocked
        },
        feeHistory
      }
    });
  } catch (error) {
    console.error('Error fetching fee history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Submit fee payment (Student)
// @route   POST /api/fee/submit
// @access  Paid Student
export const submitFeePayment = async (req, res) => {
  try {
    const { month, year, paymentMethod, transactionId, notes } = req.body;
    
    if (!req.user.isPaidStudent) {
      return res.status(403).json({
        success: false,
        message: 'Only paid students can submit fee payments'
      });
    }

    // Find or create fee record
    let feeRecord = await FeePayment.findOne({
      student: req.user._id,
      month,
      year
    });

    if (!feeRecord) {
      const dueDate = new Date(year, month - 1, 10);
      feeRecord = await FeePayment.create({
        student: req.user._id,
        studentId: req.user.studentId,
        month,
        year,
        amount: req.user.monthlyFee,
        status: 'pending',
        dueDate
      });
    }

    if (feeRecord.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'This fee is already approved'
      });
    }

    // Handle screenshot upload
    let screenshotUrl = null;
    let publicId = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'fee-payments',
        resource_type: 'image'
      });
      screenshotUrl = result.secure_url;
      publicId = result.public_id;
    } else if (req.body.screenshot) {
      // Base64 upload
      const result = await cloudinary.uploader.upload(req.body.screenshot, {
        folder: 'fee-payments',
        resource_type: 'image'
      });
      screenshotUrl = result.secure_url;
      publicId = result.public_id;
    }

    if (!screenshotUrl) {
      return res.status(400).json({
        success: false,
        message: 'Payment screenshot is required'
      });
    }

    // Update fee record
    feeRecord.status = 'submitted';
    feeRecord.paymentScreenshot = screenshotUrl;
    feeRecord.paymentScreenshotPublicId = publicId;
    feeRecord.paymentMethod = paymentMethod || 'bank_transfer';
    feeRecord.transactionId = transactionId;
    feeRecord.studentNotes = notes;
    feeRecord.submittedAt = new Date();

    await feeRecord.save();

    res.json({
      success: true,
      message: 'Fee payment submitted successfully. Awaiting admin approval.',
      data: feeRecord
    });
  } catch (error) {
    console.error('Error submitting fee:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Approve fee payment (Admin)
// @route   PUT /api/fee/approve/:feeId
// @access  Admin
export const approveFeePayment = async (req, res) => {
  try {
    const { feeId } = req.params;
    const { adminNotes } = req.body;

    const feeRecord = await FeePayment.findById(feeId);
    if (!feeRecord) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }

    feeRecord.status = 'approved';
    feeRecord.approvedBy = req.user._id;
    feeRecord.approvedAt = new Date();
    feeRecord.adminNotes = adminNotes;

    await feeRecord.save();

    // Update student's fee status if needed
    const student = await User.findById(feeRecord.student);
    if (student && student.feeStatus === 'defaulter') {
      // Check if all overdue fees are now paid
      const overdueFees = await FeePayment.countDocuments({
        student: student._id,
        status: { $in: ['pending', 'submitted'] },
        dueDate: { $lt: new Date() }
      });

      if (overdueFees === 0) {
        student.feeStatus = 'active';
        await student.save();
      }
    }

    res.json({
      success: true,
      message: 'Fee payment approved successfully',
      data: feeRecord
    });
  } catch (error) {
    console.error('Error approving fee:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Reject fee payment (Admin)
// @route   PUT /api/fee/reject/:feeId
// @access  Admin
export const rejectFeePayment = async (req, res) => {
  try {
    const { feeId } = req.params;
    const { reason } = req.body;

    const feeRecord = await FeePayment.findById(feeId);
    if (!feeRecord) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }

    feeRecord.status = 'rejected';
    feeRecord.rejectedBy = req.user._id;
    feeRecord.rejectedAt = new Date();
    feeRecord.rejectionReason = reason;

    await feeRecord.save();

    res.json({
      success: true,
      message: 'Fee payment rejected',
      data: feeRecord
    });
  } catch (error) {
    console.error('Error rejecting fee:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Block student course access (Admin)
// @route   PUT /api/fee/block/:studentId
// @access  Admin
export const blockStudentAccess = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { reason } = req.body;

    const student = await User.findOne({ studentId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    student.courseAccessBlocked = true;
    student.blockedAt = new Date();
    student.blockedBy = req.user._id;
    student.blockReason = reason || 'Fee defaulter';
    student.feeStatus = 'defaulter';

    await student.save();

    res.json({
      success: true,
      message: 'Student course access blocked',
      data: {
        studentId: student.studentId,
        name: student.name,
        courseAccessBlocked: true
      }
    });
  } catch (error) {
    console.error('Error blocking access:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Unblock student course access (Admin)
// @route   PUT /api/fee/unblock/:studentId
// @access  Admin
export const unblockStudentAccess = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findOne({ studentId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    student.courseAccessBlocked = false;
    student.blockedAt = null;
    student.blockedBy = null;
    student.blockReason = null;
    student.feeStatus = 'active';

    await student.save();

    res.json({
      success: true,
      message: 'Student course access unblocked',
      data: {
        studentId: student.studentId,
        name: student.name,
        courseAccessBlocked: false
      }
    });
  } catch (error) {
    console.error('Error unblocking access:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all pending fee submissions (Admin)
// @route   GET /api/fee/pending
// @access  Admin
export const getPendingFees = async (req, res) => {
  try {
    const pendingFees = await FeePayment.find({ status: 'submitted' })
      .populate('student', 'name email studentId phone')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      count: pendingFees.length,
      data: pendingFees
    });
  } catch (error) {
    console.error('Error fetching pending fees:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all fees (Admin dashboard)
// @route   GET /api/fee/all
// @access  Admin
export const getAllFees = async (req, res) => {
  try {
    const { status, month, year } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);

    const fees = await FeePayment.find(filter)
      .populate('student', 'name email studentId phone monthlyFee')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    // Summary stats
    const stats = await FeePayment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      count: fees.length,
      stats,
      data: fees
    });
  } catch (error) {
    console.error('Error fetching all fees:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Generate monthly fee records for all paid students (Admin - run monthly)
// @route   POST /api/fee/generate-monthly
// @access  Admin
export const generateMonthlyFees = async (req, res) => {
  try {
    const { month, year } = req.body;
    const targetMonth = month || new Date().getMonth() + 1;
    const targetYear = year || new Date().getFullYear();

    const paidStudents = await User.find({ isPaidStudent: true, feeStatus: { $ne: 'suspended' } });
    
    let created = 0;
    let skipped = 0;

    for (const student of paidStudents) {
      // Check if fee record already exists
      const exists = await FeePayment.findOne({
        student: student._id,
        month: targetMonth,
        year: targetYear
      });

      if (!exists) {
        const dueDate = new Date(targetYear, targetMonth - 1, 10);
        await FeePayment.create({
          student: student._id,
          studentId: student.studentId,
          month: targetMonth,
          year: targetYear,
          amount: student.monthlyFee,
          status: 'pending',
          dueDate
        });
        created++;
      } else {
        skipped++;
      }
    }

    res.json({
      success: true,
      message: `Monthly fees generated. Created: ${created}, Skipped (already exists): ${skipped}`,
      data: { created, skipped, month: targetMonth, year: targetYear }
    });
  } catch (error) {
    console.error('Error generating monthly fees:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get my fee status (Student)
// @route   GET /api/fee/my-fees
// @access  Paid Student
export const getMyFees = async (req, res) => {
  try {
    if (!req.user.isPaidStudent) {
      return res.status(403).json({
        success: false,
        message: 'Only paid students can access this'
      });
    }

    const feeHistory = await FeePayment.find({ student: req.user._id })
      .sort({ year: -1, month: -1 });

    const now = new Date();
    const currentMonthFee = feeHistory.find(
      f => f.month === now.getMonth() + 1 && f.year === now.getFullYear()
    );

    res.json({
      success: true,
      data: {
        studentId: req.user.studentId,
        monthlyFee: req.user.monthlyFee,
        feeStatus: req.user.feeStatus,
        courseAccessBlocked: req.user.courseAccessBlocked,
        currentMonthFee: currentMonthFee || null,
        feeHistory
      }
    });
  } catch (error) {
    console.error('Error fetching my fees:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
