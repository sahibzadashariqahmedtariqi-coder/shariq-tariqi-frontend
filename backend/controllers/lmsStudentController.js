import User from '../models/User.js';
import LMSEnrollment from '../models/LMSEnrollment.js';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import AuditLog from '../models/AuditLog.js';

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

  // Create LMS student with admin-set password saved
  const student = await User.create({
    name,
    email,
    password,
    adminSetPassword: password, // Save plain password for super admin
    phone,
    role: 'lms_student',
    isLMSStudent: true,
    lmsStudentId,
    lmsAccessEnabled: true,
    lmsCreatedBy: req.user._id
  });

  // Create audit log
  await AuditLog.log({
    user: req.user._id,
    userName: req.user.name,
    userEmail: req.user.email,
    userRole: req.user.role,
    action: 'LMS_STUDENT_CREATE',
    targetType: 'User',
    targetId: student._id,
    targetName: student.name,
    description: `Created LMS student: ${student.name} (${student.lmsStudentId})`,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
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
  // Only include adminSetPassword if requester is super admin
  const isSuperAdmin = req.user?.role === 'super_admin';
  
  const students = await User.find({ isLMSStudent: true })
    .select(isSuperAdmin ? '-password +adminSetPassword' : '-password')
    .populate('lmsCreatedBy', 'name email')
    .sort({ createdAt: -1 });

  // Get enrollment details for each student (including course names)
  const studentsWithEnrollments = await Promise.all(
    students.map(async (student) => {
      const enrollments = await LMSEnrollment.find({ 
        user: student._id,
        status: { $ne: 'cancelled' }
      }).populate('course', 'title');
      
      return {
        ...student.toObject(),
        enrolledCourses: enrollments.length,
        enrolledCoursesList: enrollments.map(e => ({
          courseId: e.course?._id,
          courseTitle: e.course?.title || 'Unknown Course',
          enrollmentId: e._id,
          status: e.status
        }))
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

  // Save plain password for super admin to view
  student.adminSetPassword = newPassword;
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

  // Generate unique session token for single device login
  const { v4: uuidv4 } = await import('uuid');
  const sessionToken = uuidv4();

  // Update last login and active session token
  student.lastLogin = new Date();
  student.activeSessionToken = sessionToken;
  await student.save({ validateBeforeSave: false });

  // Generate JWT with session token embedded
  const jwt = await import('jsonwebtoken');
  const token = jwt.default.sign(
    { id: student._id, sessionToken },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );

  // Create audit log
  await AuditLog.log({
    user: student._id,
    userName: student.name,
    userEmail: student.email,
    userRole: student.role,
    action: 'LOGIN',
    description: 'LMS Student logged in (single device enforced)',
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

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

// @desc    Get detailed LMS statistics for admin dashboard
// @route   GET /api/lms/students/stats/detailed
// @access  Private/Admin
export const getLMSDetailedStats = asyncHandler(async (req, res) => {
  const LMSProgress = (await import('../models/LMSProgress.js')).default;
  const LMSCertificate = (await import('../models/LMSCertificate.js')).default;
  const LMSClass = (await import('../models/LMSClass.js')).default;
  const Course = (await import('../models/Course.js')).default;

  // Get all LMS students
  const allStudents = await User.find({ isLMSStudent: true }).select('-password');
  
  // Get students who logged in within last 24 hours (active)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const activeStudents = await User.countDocuments({ 
    isLMSStudent: true, 
    lastLogin: { $gte: oneDayAgo } 
  });
  
  // Get students who logged in within last 7 days
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weeklyActiveStudents = await User.countDocuments({ 
    isLMSStudent: true, 
    lastLogin: { $gte: oneWeekAgo } 
  });

  // Total enrollments
  const totalEnrollments = await LMSEnrollment.countDocuments({ status: { $ne: 'cancelled' } });
  
  // Total certificates issued
  const totalCertificates = await LMSCertificate.countDocuments();
  
  // Total videos/classes
  const totalClasses = await LMSClass.countDocuments({ isPublished: true });
  
  // Total watched (completed progress entries)
  const totalWatchedClasses = await LMSProgress.countDocuments({ status: 'completed' });
  
  // In progress classes
  const inProgressClasses = await LMSProgress.countDocuments({ status: 'in_progress' });

  // Get per-student detailed stats
  const studentStats = await Promise.all(
    allStudents.map(async (student) => {
      // Enrollments
      const enrollments = await LMSEnrollment.find({ 
        user: student._id, 
        status: { $ne: 'cancelled' } 
      }).populate('course', 'title totalClasses');
      
      // Progress (watched videos)
      const completedVideos = await LMSProgress.countDocuments({ 
        user: student._id, 
        status: 'completed' 
      });
      
      const inProgressVideos = await LMSProgress.countDocuments({ 
        user: student._id, 
        status: 'in_progress' 
      });
      
      // Certificates
      const certificates = await LMSCertificate.countDocuments({ user: student._id });
      
      // Total classes across all enrolled courses
      const totalAvailableClasses = enrollments.reduce((acc, e) => {
        return acc + (e.course?.totalClasses || 0);
      }, 0);
      
      // Last activity
      const lastProgress = await LMSProgress.findOne({ user: student._id })
        .sort({ lastAccessedAt: -1 })
        .select('lastAccessedAt');

      // Use last activity for "Online" status - within 15 minutes
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      const lastActivityTime = lastProgress?.lastAccessedAt || student.lastLogin;
      const isCurrentlyOnline = lastActivityTime && lastActivityTime >= fifteenMinutesAgo;

      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        lmsStudentId: student.lmsStudentId,
        lmsAccessEnabled: student.lmsAccessEnabled,
        lastLogin: student.lastLogin,
        isActive: isCurrentlyOnline,  // Online within 15 minutes
        isWeeklyActive: student.lastLogin && student.lastLogin >= oneWeekAgo,
        enrolledCourses: enrollments.length,
        completedVideos,
        inProgressVideos,
        totalAvailableClasses,
        remainingVideos: totalAvailableClasses - completedVideos,
        certificates,
        lastActivity: lastProgress?.lastAccessedAt || student.lastLogin,
        watchProgress: totalAvailableClasses > 0 
          ? Math.round((completedVideos / totalAvailableClasses) * 100) 
          : 0
      };
    })
  );

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalStudents: allStudents.length,
        activeStudents,  // logged in within 24 hours
        weeklyActiveStudents,  // logged in within 7 days
        inactiveStudents: allStudents.length - weeklyActiveStudents,
        totalEnrollments,
        totalCertificates,
        totalClasses,
        totalWatchedClasses,
        inProgressClasses,
        remainingClasses: (totalClasses * totalEnrollments) - totalWatchedClasses - inProgressClasses
      },
      students: studentStats
    }
  });
});
