import asyncHandler from 'express-async-handler';
import LMSFee from '../models/LMSFee.js';
import User from '../models/User.js';

// @desc    Get all fees for a student
// @route   GET /api/lms/fees/student/:studentId
// @access  Private/Admin
export const getStudentFees = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  
  const fees = await LMSFee.find({ student: studentId })
    .sort({ year: -1, month: -1 })
    .populate('student', 'name email lmsStudentId')
    .populate('createdBy', 'name')
    .populate('updatedBy', 'name');
  
  res.json({
    success: true,
    data: fees
  });
});

// @desc    Get all fees (with filters)
// @route   GET /api/lms/fees
// @access  Private/Admin
export const getAllFees = asyncHandler(async (req, res) => {
  const { month, year, status, studentId } = req.query;
  
  const filter = {};
  if (month) filter.month = month;
  if (year) filter.year = parseInt(year);
  if (status) filter.status = status;
  if (studentId) filter.student = studentId;
  
  const fees = await LMSFee.find(filter)
    .sort({ year: -1, createdAt: -1 })
    .populate('student', 'name email lmsStudentId phone')
    .populate('createdBy', 'name')
    .populate('updatedBy', 'name');
  
  // Calculate summary
  const summary = {
    total: fees.length,
    totalAmount: fees.reduce((sum, f) => sum + f.amount, 0),
    paidAmount: fees.reduce((sum, f) => sum + f.paidAmount, 0),
    pendingAmount: fees.reduce((sum, f) => sum + (f.amount - f.paidAmount), 0),
    paidCount: fees.filter(f => f.status === 'paid').length,
    pendingCount: fees.filter(f => f.status === 'pending').length,
    overdueCount: fees.filter(f => f.status === 'overdue').length,
  };
  
  res.json({
    success: true,
    data: fees,
    summary
  });
});

// @desc    Create fee record
// @route   POST /api/lms/fees
// @access  Private/Admin
export const createFee = asyncHandler(async (req, res) => {
  const { studentId, month, year, amount, dueDate, remarks } = req.body;
  
  // Check if student exists
  const student = await User.findById(studentId);
  if (!student || !student.isLMSStudent) {
    res.status(404);
    throw new Error('LMS Student not found');
  }
  
  // Check if fee already exists for this month
  const existingFee = await LMSFee.findOne({ student: studentId, month, year });
  if (existingFee) {
    res.status(400);
    throw new Error('Fee record already exists for this month');
  }
  
  const fee = await LMSFee.create({
    student: studentId,
    month,
    year,
    amount: amount || 5000,
    dueDate: dueDate || new Date(),
    remarks,
    createdBy: req.user._id
  });
  
  const populatedFee = await LMSFee.findById(fee._id)
    .populate('student', 'name email lmsStudentId');
  
  res.status(201).json({
    success: true,
    data: populatedFee
  });
});

// @desc    Update fee status
// @route   PUT /api/lms/fees/:feeId
// @access  Private/Admin
export const updateFee = asyncHandler(async (req, res) => {
  const { feeId } = req.params;
  const { status, paidAmount, paidDate, paymentMethod, transactionId, remarks, amount } = req.body;
  
  const fee = await LMSFee.findById(feeId);
  if (!fee) {
    res.status(404);
    throw new Error('Fee record not found');
  }
  
  // Update fields
  if (status) fee.status = status;
  if (amount !== undefined) fee.amount = amount;
  if (paidAmount !== undefined) fee.paidAmount = paidAmount;
  if (paidDate) fee.paidDate = paidDate;
  if (paymentMethod) fee.paymentMethod = paymentMethod;
  if (transactionId) fee.transactionId = transactionId;
  if (remarks !== undefined) fee.remarks = remarks;
  fee.updatedBy = req.user._id;
  
  // Auto-update status based on payment
  if (paidAmount !== undefined) {
    if (paidAmount >= fee.amount) {
      fee.status = 'paid';
      fee.paidDate = fee.paidDate || new Date();
    } else if (paidAmount > 0) {
      fee.status = 'partial';
    }
  }
  
  await fee.save();
  
  const updatedFee = await LMSFee.findById(feeId)
    .populate('student', 'name email lmsStudentId phone')
    .populate('updatedBy', 'name');
  
  res.json({
    success: true,
    data: updatedFee
  });
});

// @desc    Delete fee record
// @route   DELETE /api/lms/fees/:feeId
// @access  Private/Admin
export const deleteFee = asyncHandler(async (req, res) => {
  const { feeId } = req.params;
  
  const fee = await LMSFee.findById(feeId);
  if (!fee) {
    res.status(404);
    throw new Error('Fee record not found');
  }
  
  await fee.deleteOne();
  
  res.json({
    success: true,
    message: 'Fee record deleted'
  });
});

// @desc    Generate fees for all students for a month
// @route   POST /api/lms/fees/generate
// @access  Private/Admin
export const generateMonthlyFees = asyncHandler(async (req, res) => {
  const { month, year, amount, dueDate } = req.body;
  
  // Get all LMS students
  const students = await User.find({ isLMSStudent: true });
  
  if (students.length === 0) {
    res.status(400);
    throw new Error('No LMS students found');
  }
  
  const results = {
    created: 0,
    skipped: 0,
    errors: []
  };
  
  for (const student of students) {
    try {
      // Check if fee already exists
      const existing = await LMSFee.findOne({ student: student._id, month, year });
      if (existing) {
        results.skipped++;
        continue;
      }
      
      await LMSFee.create({
        student: student._id,
        month,
        year,
        amount: amount || 5000,
        dueDate: dueDate || new Date(),
        createdBy: req.user._id
      });
      results.created++;
    } catch (error) {
      results.errors.push({ student: student.name, error: error.message });
    }
  }
  
  res.json({
    success: true,
    message: `Generated ${results.created} fee records, skipped ${results.skipped}`,
    data: results
  });
});

// @desc    Get fee summary for a student
// @route   GET /api/lms/fees/summary/:studentId
// @access  Private/Admin
export const getStudentFeeSummary = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  
  const fees = await LMSFee.find({ student: studentId });
  
  const summary = {
    totalFees: fees.length,
    totalAmount: fees.reduce((sum, f) => sum + f.amount, 0),
    paidAmount: fees.reduce((sum, f) => sum + f.paidAmount, 0),
    pendingAmount: fees.reduce((sum, f) => sum + (f.amount - f.paidAmount), 0),
    paidCount: fees.filter(f => f.status === 'paid').length,
    pendingCount: fees.filter(f => f.status === 'pending').length,
    overdueCount: fees.filter(f => f.status === 'overdue').length,
    partialCount: fees.filter(f => f.status === 'partial').length,
  };
  
  res.json({
    success: true,
    data: summary
  });
});
