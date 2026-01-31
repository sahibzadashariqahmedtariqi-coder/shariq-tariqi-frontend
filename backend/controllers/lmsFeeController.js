import asyncHandler from 'express-async-handler';
import LMSFee from '../models/LMSFee.js';
import LMSPaymentRequest from '../models/LMSPaymentRequest.js';
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

// @desc    Get my fees (for logged in student)
// @route   GET /api/lms/fees/my
// @access  Private (LMS Student)
export const getMyFees = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  
  const fees = await LMSFee.find({ student: studentId })
    .sort({ year: -1, createdAt: -1 });
  
  // Calculate summary
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
    data: {
      fees,
      summary
    }
  });
});

// @desc    Submit payment request (for student)
// @route   POST /api/lms/fees/pay
// @access  Private (LMS Student)
export const submitPaymentRequest = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const { feeId, amount, paymentMethod, transactionId, accountTitle, accountNumber, paymentProof, remarks } = req.body;
  
  // Validate fee exists and belongs to this student
  const fee = await LMSFee.findOne({ _id: feeId, student: studentId });
  if (!fee) {
    res.status(404);
    throw new Error('Fee record not found');
  }
  
  // Check remaining amount
  const remainingAmount = fee.amount - fee.paidAmount;
  if (amount > remainingAmount) {
    res.status(400);
    throw new Error(`Payment amount cannot exceed remaining amount of Rs ${remainingAmount}`);
  }
  
  if (amount <= 0) {
    res.status(400);
    throw new Error('Payment amount must be greater than 0');
  }
  
  // Check if there's already a pending request for this fee
  const existingRequest = await LMSPaymentRequest.findOne({ 
    fee: feeId, 
    student: studentId,
    status: 'pending' 
  });
  
  if (existingRequest) {
    res.status(400);
    throw new Error('You already have a pending payment request for this fee. Please wait for admin approval.');
  }
  
  // Create payment request
  const paymentRequest = await LMSPaymentRequest.create({
    student: studentId,
    fee: feeId,
    amount,
    paymentMethod,
    transactionId,
    accountTitle,
    accountNumber,
    paymentProof,
    remarks,
    status: 'pending'
  });
  
  const populatedRequest = await LMSPaymentRequest.findById(paymentRequest._id)
    .populate('student', 'name email lmsStudentId')
    .populate('fee', 'month year amount');
  
  res.status(201).json({
    success: true,
    message: 'Payment request submitted successfully. Admin will review and approve it.',
    data: populatedRequest
  });
});

// @desc    Get my payment requests (for student)
// @route   GET /api/lms/fees/my-payments
// @access  Private (LMS Student)
export const getMyPaymentRequests = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  
  const requests = await LMSPaymentRequest.find({ student: studentId })
    .populate('fee', 'month year amount')
    .sort({ createdAt: -1 });
  
  res.json({
    success: true,
    data: requests
  });
});

// @desc    Get all payment requests (for admin)
// @route   GET /api/lms/fees/payment-requests
// @access  Private/Admin
export const getAllPaymentRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;
  
  const filter = {};
  if (status) filter.status = status;
  
  const requests = await LMSPaymentRequest.find(filter)
    .populate('student', 'name email lmsStudentId phone')
    .populate('fee', 'month year amount paidAmount status')
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 });
  
  // Summary
  const summary = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    totalAmount: requests.reduce((sum, r) => sum + r.amount, 0),
    pendingAmount: requests.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0),
  };
  
  res.json({
    success: true,
    data: requests,
    summary
  });
});

// @desc    Review payment request (approve/reject)
// @route   PUT /api/lms/fees/payment-requests/:requestId
// @access  Private/Admin
export const reviewPaymentRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { status, adminRemarks } = req.body;
  
  if (!['approved', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Status must be either approved or rejected');
  }
  
  const paymentRequest = await LMSPaymentRequest.findById(requestId);
  if (!paymentRequest) {
    res.status(404);
    throw new Error('Payment request not found');
  }
  
  if (paymentRequest.status !== 'pending') {
    res.status(400);
    throw new Error('This payment request has already been reviewed');
  }
  
  // Update payment request
  paymentRequest.status = status;
  paymentRequest.adminRemarks = adminRemarks;
  paymentRequest.reviewedBy = req.user._id;
  paymentRequest.reviewedAt = new Date();
  await paymentRequest.save();
  
  // If approved, update the fee record
  if (status === 'approved') {
    const fee = await LMSFee.findById(paymentRequest.fee);
    if (fee) {
      fee.paidAmount += paymentRequest.amount;
      fee.paidDate = new Date();
      fee.paymentMethod = paymentRequest.paymentMethod;
      fee.transactionId = paymentRequest.transactionId;
      fee.updatedBy = req.user._id;
      
      // Update status based on payment
      if (fee.paidAmount >= fee.amount) {
        fee.status = 'paid';
      } else if (fee.paidAmount > 0) {
        fee.status = 'partial';
      }
      
      await fee.save();
    }
  }
  
  const updatedRequest = await LMSPaymentRequest.findById(requestId)
    .populate('student', 'name email lmsStudentId')
    .populate('fee', 'month year amount paidAmount status')
    .populate('reviewedBy', 'name');
  
  res.json({
    success: true,
    message: `Payment request ${status}`,
    data: updatedRequest
  });
});
