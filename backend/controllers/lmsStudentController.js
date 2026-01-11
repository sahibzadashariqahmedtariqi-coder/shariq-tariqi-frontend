import User from '../models/User.js';
import LMSEnrollment from '../models/LMSEnrollment.js';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';

// Generate unique LMS Student ID
const generateLMSStudentId = async () => {
  const year = new Date().getFullYear().toString().slice(-2);
  const lastStudent = await User.findOne({ isLMSStudent: true })
    .sort({ createdAt: -1 })
    .select('lmsStudentId');
  
  let sequence = 1;
  if (lastStudent?.lmsStudentId) {
    const lastNum = parseInt(lastStudent.lmsStudentId.split('-').pop()) || 0;
    sequence = lastNum + 1;
  }
  
  return `SAT-STU-${year}-${sequence.toString().padStart(4, '0')}`;
};

// @desc    Create new LMS Student (Admin only)
// @route   POST /api/lms/students
// @access  Private/Admin
export const createLMSStudent = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('Email already registered');
  }

  // Generate unique student ID
  const lmsStudentId = await generateLMSStudentId();

  // Create LMS student
  const student = await User.create({
    name,
    email,
    password,
    phone,
    role: 'lms_student',
    isLMSStudent: true,
    lmsStudentId,
    lmsAccessEnabled: true,
    lmsCreatedBy: req.user._id
  });

  res.status(201).json({
    success: true,
    message: 'LMS Student created successfully',
    data: {
      _id: student._id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      lmsStudentId: student.lmsStudentId,
      lmsAccessEnabled: student.lmsAccessEnabled,
      createdAt: student.createdAt
    }
  });
});

// @desc    Get all LMS Students (Admin only)
// @route   GET /api/lms/students
// @access  Private/Admin
export const getAllLMSStudents = asyncHandler(async (req, res) => {
  const students = await User.find({ isLMSStudent: true })
    .select('-password')
    .populate('lmsCreatedBy', 'name email')
    .sort({ createdAt: -1 });

  // Get enrollment counts for each student
  const studentsWithEnrollments = await Promise.all(
    students.map(async (student) => {
      const enrollmentCount = await LMSEnrollment.countDocuments({ 
        user: student._id,
        status: { $ne: 'cancelled' }
      });
      return {
        ...student.toObject(),
        enrolledCourses: enrollmentCount
      };
    })
  );

  res.status(200).json({
    success: true,
    count: students.length,
    data: studentsWithEnrollments
  });
});

// @desc    Get single LMS Student
// @route   GET /api/lms/students/:id
// @access  Private/Admin
export const getLMSStudent = asyncHandler(async (req, res) => {
  const student = await User.findOne({ 
    _id: req.params.id, 
    isLMSStudent: true 
  }).select('-password');

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  // Get all enrollments for this student
  const enrollments = await LMSEnrollment.find({ user: student._id })
    .populate('course', 'title image category level isPaid')
    .sort({ enrolledAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      ...student.toObject(),
      enrollments
    }
  });
});

// @desc    Update LMS Student
// @route   PUT /api/lms/students/:id
// @access  Private/Admin
export const updateLMSStudent = asyncHandler(async (req, res) => {
  const { name, email, phone, password, lmsAccessEnabled } = req.body;

  const student = await User.findOne({ 
    _id: req.params.id, 
    isLMSStudent: true 
  });

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  // Check if new email is already taken by another user
  if (email && email !== student.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error('Email already taken');
    }
    student.email = email;
  }

  if (name) student.name = name;
  if (phone !== undefined) student.phone = phone;
  if (lmsAccessEnabled !== undefined) student.lmsAccessEnabled = lmsAccessEnabled;
  
  // Update password if provided
  if (password && password.length >= 6) {
    student.password = password; // Will be hashed by pre-save hook
  }

  await student.save();

  res.status(200).json({
    success: true,
    message: 'Student updated successfully',
    data: {
      _id: student._id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      lmsStudentId: student.lmsStudentId,
      lmsAccessEnabled: student.lmsAccessEnabled
    }
  });
});

// @desc    Delete LMS Student
// @route   DELETE /api/lms/students/:id
// @access  Private/Admin
export const deleteLMSStudent = asyncHandler(async (req, res) => {
  const student = await User.findOne({ 
    _id: req.params.id, 
    isLMSStudent: true 
  });

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  // Delete all enrollments
  await LMSEnrollment.deleteMany({ user: student._id });

  // Delete student
  await student.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Student and all enrollments deleted successfully'
  });
});

// @desc    Toggle LMS Access for student
// @route   PUT /api/lms/students/:id/toggle-access
// @access  Private/Admin
export const toggleLMSAccess = asyncHandler(async (req, res) => {
  const student = await User.findOne({ 
    _id: req.params.id, 
    isLMSStudent: true 
  });

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  student.lmsAccessEnabled = !student.lmsAccessEnabled;
  await student.save();

  res.status(200).json({
    success: true,
    message: `LMS access ${student.lmsAccessEnabled ? 'enabled' : 'disabled'} for ${student.name}`,
    data: {
      lmsAccessEnabled: student.lmsAccessEnabled
    }
  });
});

// @desc    Reset Student Password
// @route   PUT /api/lms/students/:id/reset-password
// @access  Private/Admin
export const resetStudentPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const student = await User.findOne({ 
    _id: req.params.id, 
    isLMSStudent: true 
  });

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  student.password = newPassword; // Will be hashed by pre-save hook
  await student.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successfully'
  });
});

// @desc    LMS Student Login
// @route   POST /api/lms/student-login
// @access  Public
export const lmsStudentLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Find student with password
  const student = await User.findOne({ 
    email,
    isLMSStudent: true
  }).select('+password');

  if (!student) {
    res.status(401);
    throw new Error('Invalid credentials or not an LMS student');
  }

  // Check if LMS access is enabled
  if (!student.lmsAccessEnabled) {
    res.status(403);
    throw new Error('Your LMS access has been disabled. Please contact admin.');
  }

  // Check password
  const isMatch = await student.comparePassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Update last login
  student.lastLogin = new Date();
  await student.save({ validateBeforeSave: false });

  // Generate token
  const jwt = await import('jsonwebtoken');
  const token = jwt.default.sign(
    { id: student._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      _id: student._id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      role: student.role,
      lmsStudentId: student.lmsStudentId,
      isLMSStudent: true,
      token
    }
  });
});

// @desc    Get Student's Enrolled Courses (for student)
// @route   GET /api/lms/my-enrolled-courses
// @access  Private (LMS Student)
export const getMyEnrolledCoursesLMS = asyncHandler(async (req, res) => {
  // Verify user is LMS student
  if (!req.user.isLMSStudent) {
    res.status(403);
    throw new Error('Access denied. LMS students only.');
  }

  const enrollments = await LMSEnrollment.find({ 
    user: req.user._id,
    status: { $ne: 'cancelled' },
    accessBlocked: false
  }).populate({
    path: 'course',
    select: 'title description image category level duration totalClasses certificateEnabled isPaid instructor'
  }).sort({ enrolledAt: -1 });

  // Filter out enrollments where course might be deleted
  const validEnrollments = enrollments.filter(e => e.course);

  res.status(200).json({
    success: true,
    count: validEnrollments.length,
    data: validEnrollments
  });
});
