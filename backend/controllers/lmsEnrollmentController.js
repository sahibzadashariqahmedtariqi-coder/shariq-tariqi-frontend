import Course from '../models/Course.js';  // Use existing Course model
import LMSClass from '../models/LMSClass.js';
import LMSEnrollment from '../models/LMSEnrollment.js';
import LMSProgress from '../models/LMSProgress.js';
import LMSCertificate from '../models/LMSCertificate.js';
import User from '../models/User.js';
import FeePayment from '../models/FeePayment.js';

// ==================== ENROLLMENT MANAGEMENT ====================

// @desc    Enroll student in course (Admin)
// @route   POST /api/lms/enroll
// @access  Admin
export const enrollStudent = async (req, res) => {
  try {
    const { userId, courseId, enrollmentType, notes, expiresAt } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if course exists (using Course model)
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Auto-enable LMS for course if not already enabled
    if (!course.isLMSEnabled) {
      course.isLMSEnabled = true;
      course.lmsStatus = 'published';
      await course.save();
    }

    // Check if already enrolled
    const existingEnrollment = await LMSEnrollment.findOne({ user: userId, course: courseId });
    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'User is already enrolled in this course'
      });
    }

    // Get total classes
    const totalClasses = await LMSClass.countDocuments({ course: courseId, isPublished: true });

    const enrollment = await LMSEnrollment.create({
      user: userId,
      course: courseId,
      enrollmentType: enrollmentType || 'granted',
      enrolledBy: req.user._id,
      status: 'active',
      progress: {
        completedClasses: 0,
        totalClasses,
        percentage: 0
      },
      notes,
      expiresAt
    });

    // Update course enrollment count
    course.enrollmentCount = await LMSEnrollment.countDocuments({ course: courseId });
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Student enrolled successfully',
      data: enrollment
    });
  } catch (error) {
    console.error('Error enrolling student:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all enrollments for a course (Admin)
// @route   GET /api/lms/courses/:courseId/enrollments
// @access  Admin
export const getCourseEnrollments = async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollments = await LMSEnrollment.find({ course: courseId })
      .populate('user', 'name email phone studentId isPaidStudent feeStatus isLMSStudent lmsStudentId')
      .populate('enrolledBy', 'name')
      .sort({ enrolledAt: -1 });

    // Check fee status for paid students
    const enrollmentsWithFeeStatus = await Promise.all(
      enrollments.map(async (enrollment) => {
        const user = enrollment.user;
        let feeDefaulter = false;

        if (user.isPaidStudent) {
          const now = new Date();
          const overdueFees = await FeePayment.countDocuments({
            student: user._id,
            status: 'pending',
            dueDate: { $lt: now }
          });
          feeDefaulter = overdueFees > 0;
        }

        return {
          ...enrollment.toObject(),
          feeDefaulter
        };
      })
    );

    res.json({
      success: true,
      count: enrollmentsWithFeeStatus.length,
      data: enrollmentsWithFeeStatus
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get user's enrolled courses
// @route   GET /api/lms/my-courses
// @access  Protected
export const getMyEnrolledCourses = async (req, res) => {
  try {
    const enrollments = await LMSEnrollment.find({ 
      user: req.user._id,
      status: { $in: ['active', 'completed'] }
    })
      .populate('course', 'title thumbnail category level duration totalClasses status')
      .sort({ enrolledAt: -1 });

    res.json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Block/Unblock enrollment access
// @route   PUT /api/lms/enrollments/:enrollmentId/block
// @access  Admin
export const toggleEnrollmentAccess = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { reason } = req.body;

    const enrollment = await LMSEnrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    if (enrollment.accessBlocked) {
      // Unblock
      enrollment.accessBlocked = false;
      enrollment.blockedReason = null;
      enrollment.blockedAt = null;
      enrollment.blockedBy = null;
    } else {
      // Block
      enrollment.accessBlocked = true;
      enrollment.blockedReason = reason || 'Fee defaulter';
      enrollment.blockedAt = new Date();
      enrollment.blockedBy = req.user._id;
    }

    await enrollment.save();

    res.json({
      success: true,
      message: `Access ${enrollment.accessBlocked ? 'blocked' : 'unblocked'} successfully`,
      data: enrollment
    });
  } catch (error) {
    console.error('Error toggling access:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Remove enrollment
// @route   DELETE /api/lms/enrollments/:enrollmentId
// @access  Admin
export const removeEnrollment = async (req, res) => {
  try {
    const enrollment = await LMSEnrollment.findById(req.params.enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    const courseId = enrollment.course;

    // Delete progress records
    await LMSProgress.deleteMany({ enrollment: enrollment._id });

    // Delete enrollment
    await enrollment.deleteOne();

    // Update course enrollment count (using Course model)
    const count = await LMSEnrollment.countDocuments({ course: courseId });
    await Course.findByIdAndUpdate(courseId, { enrolledStudents: count });

    res.json({
      success: true,
      message: 'Enrollment removed successfully'
    });
  } catch (error) {
    console.error('Error removing enrollment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Block all fee defaulters' access in a course
// @route   PUT /api/lms/courses/:courseId/block-defaulters
// @access  Admin
export const blockFeeDefaulters = async (req, res) => {
  try {
    const { courseId } = req.params;
    const now = new Date();

    // Get all enrollments for this course
    const enrollments = await LMSEnrollment.find({ course: courseId })
      .populate('user');

    let blockedCount = 0;

    for (const enrollment of enrollments) {
      if (enrollment.user?.isPaidStudent) {
        // Check for overdue fees
        const overdueFees = await FeePayment.countDocuments({
          student: enrollment.user._id,
          status: 'pending',
          dueDate: { $lt: now }
        });

        if (overdueFees > 0 && !enrollment.accessBlocked) {
          enrollment.accessBlocked = true;
          enrollment.blockedReason = 'Fee defaulter - automatic block';
          enrollment.blockedAt = now;
          enrollment.blockedBy = req.user._id;
          await enrollment.save();
          blockedCount++;
        }
      }
    }

    res.json({
      success: true,
      message: `Blocked ${blockedCount} fee defaulters`,
      blockedCount
    });
  } catch (error) {
    console.error('Error blocking defaulters:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== PROGRESS TRACKING ====================

// @desc    Get class for watching (Student)
// @route   GET /api/lms/watch/:classId
// @access  Protected
export const watchClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const classItem = await LMSClass.findById(classId)
      .populate('course', 'title certificateEnabled');

    if (!classItem) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    // Check if user is enrolled in this course
    const enrollment = await LMSEnrollment.findOne({
      user: req.user._id,
      course: classItem.course._id,
      status: { $in: ['active', 'completed'] }
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Check if access is blocked
    if (enrollment.accessBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your access to this course has been blocked. Please contact admin.',
        blocked: true,
        reason: enrollment.blockedReason
      });
    }

    // Check if class is locked (unless it's a preview)
    if (classItem.isLocked && !classItem.isPreview) {
      return res.status(403).json({
        success: false,
        message: 'This class is locked. It will be unlocked by the instructor soon.',
        locked: true
      });
    }

    // Get or create progress record
    let progress = await LMSProgress.findOne({
      user: req.user._id,
      class: classId
    });

    if (!progress) {
      progress = await LMSProgress.create({
        user: req.user._id,
        course: classItem.course._id,
        class: classId,
        enrollment: enrollment._id,
        status: 'in_progress',
        startedAt: new Date()
      });
    }

    // Update access count and time
    progress.accessCount += 1;
    progress.lastAccessedAt = new Date();
    await progress.save();

    // Update enrollment last accessed
    enrollment.progress.lastAccessedClass = classId;
    enrollment.progress.lastAccessedAt = new Date();
    await enrollment.save();

    // Get all classes for navigation
    const allClasses = await LMSClass.find({ 
      course: classItem.course._id,
      isPublished: true
    })
      .select('title section order isLocked')
      .sort({ section: 1, order: 1 });

    // Get user's progress for all classes
    const userProgress = await LMSProgress.find({
      user: req.user._id,
      course: classItem.course._id
    }).select('class status watchProgress');

    const progressMap = {};
    userProgress.forEach(p => {
      progressMap[p.class.toString()] = {
        status: p.status,
        watchProgress: p.watchProgress
      };
    });

    res.json({
      success: true,
      data: {
        class: classItem,
        progress,
        enrollment: {
          _id: enrollment._id,
          progress: enrollment.progress
        },
        allClasses,
        progressMap
      }
    });
  } catch (error) {
    console.error('Error watching class:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update watch progress
// @route   PUT /api/lms/progress/:classId
// @access  Protected
export const updateProgress = async (req, res) => {
  try {
    const { classId } = req.params;
    const { watchProgress, lastPosition, totalWatchTime } = req.body;

    let progress = await LMSProgress.findOne({
      user: req.user._id,
      class: classId
    });

    // If progress doesn't exist, create it
    if (!progress) {
      const classItem = await LMSClass.findById(classId);
      if (!classItem) {
        return res.status(404).json({ success: false, message: 'Class not found' });
      }
      
      const enrollment = await LMSEnrollment.findOne({
        user: req.user._id,
        course: classItem.course
      });
      
      if (!enrollment) {
        return res.status(403).json({ success: false, message: 'Not enrolled in this course' });
      }

      progress = await LMSProgress.create({
        user: req.user._id,
        course: classItem.course,
        class: classId,
        enrollment: enrollment._id,
        status: 'in_progress',
        startedAt: new Date()
      });
    }

    // Update progress
    if (watchProgress !== undefined) progress.watchProgress = Math.min(100, watchProgress);
    if (lastPosition !== undefined) progress.lastPosition = lastPosition;
    if (totalWatchTime !== undefined) progress.totalWatchTime = totalWatchTime;
    progress.lastAccessedAt = new Date();

    // Check if completed
    const newlyCompleted = progress.checkCompletion();
    await progress.save();

    // If newly completed, update enrollment progress
    if (newlyCompleted) {
      const enrollment = await LMSEnrollment.findById(progress.enrollment);
      if (enrollment) {
        const completedCount = await LMSProgress.countDocuments({
          enrollment: enrollment._id,
          status: 'completed'
        });
        const totalClasses = await LMSClass.countDocuments({
          course: enrollment.course,
          isPublished: true
        });

        enrollment.updateProgress(completedCount, totalClasses);
        await enrollment.save();

        // Check if course completed for certificate
        if (enrollment.status === 'completed' && !enrollment.certificateIssued) {
          // Will be handled by certificate generation
        }
      }
    }

    res.json({
      success: true,
      data: progress,
      completed: newlyCompleted
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get course progress for student
// @route   GET /api/lms/courses/:courseId/my-progress
// @access  Protected
export const getMyCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollment = await LMSEnrollment.findOne({
      user: req.user._id,
      course: courseId
    }).populate('certificateId');

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Not enrolled in this course' });
    }

    const progress = await LMSProgress.find({
      user: req.user._id,
      course: courseId
    }).populate('class', 'title section order');

    res.json({
      success: true,
      data: {
        enrollment,
        progress
      }
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== CERTIFICATE MANAGEMENT ====================

// @desc    Generate certificate for completed course
// @route   POST /api/lms/certificates/generate
// @access  Protected
export const generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.body;

    const enrollment = await LMSEnrollment.findOne({
      user: req.user._id,
      course: courseId,
      status: 'completed'
    });

    if (!enrollment) {
      return res.status(400).json({
        success: false,
        message: 'Course not completed or not enrolled'
      });
    }

    if (enrollment.certificateIssued) {
      const existingCert = await LMSCertificate.findById(enrollment.certificateId);
      return res.json({
        success: true,
        message: 'Certificate already issued',
        data: existingCert
      });
    }

    const course = await Course.findById(courseId);
    if (!course.certificateEnabled) {
      return res.status(400).json({
        success: false,
        message: 'Certificate not enabled for this course'
      });
    }

    const user = await User.findById(req.user._id);

    const certificate = await LMSCertificate.create({
      user: req.user._id,
      course: courseId,
      enrollment: enrollment._id,
      studentName: user.name,
      studentId: user.studentId || null,
      courseTitle: course.title,
      courseCategory: course.category,
      completionDate: enrollment.completedAt,
      template: course.certificateTemplate,
      grade: 'pass' // Can be calculated based on performance
    });

    // Update enrollment
    enrollment.certificateIssued = true;
    enrollment.certificateId = certificate._id;
    await enrollment.save();

    res.status(201).json({
      success: true,
      message: 'Certificate generated successfully',
      data: certificate
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my certificates
// @route   GET /api/lms/certificates/my
// @access  Protected
export const getMyCertificates = async (req, res) => {
  try {
    const certificates = await LMSCertificate.find({
      user: req.user._id,
      status: 'issued'
    })
      .populate('course', 'title thumbnail category')
      .sort({ issuedAt: -1 });

    res.json({
      success: true,
      count: certificates.length,
      data: certificates
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Verify certificate
// @route   GET /api/lms/certificates/verify/:code
// @access  Public
export const verifyCertificate = async (req, res) => {
  try {
    const { code } = req.params;

    const certificate = await LMSCertificate.findOne({
      $or: [
        { certificateNumber: code },
        { verificationCode: code }
      ]
    })
      .populate('user', 'name')
      .populate('course', 'title category');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
        valid: false
      });
    }

    if (certificate.status === 'revoked') {
      return res.json({
        success: true,
        valid: false,
        message: 'This certificate has been revoked',
        data: {
          certificateNumber: certificate.certificateNumber,
          status: 'revoked',
          revokedAt: certificate.revokedAt,
          revocationReason: certificate.revocationReason
        }
      });
    }

    res.json({
      success: true,
      valid: true,
      data: {
        certificateNumber: certificate.certificateNumber,
        studentName: certificate.studentName,
        courseTitle: certificate.courseTitle,
        completionDate: certificate.completionDate,
        issuedAt: certificate.issuedAt,
        grade: certificate.grade,
        status: certificate.status
      }
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single certificate details
// @route   GET /api/lms/certificates/:id
// @access  Protected
export const getCertificateDetails = async (req, res) => {
  try {
    const certificate = await LMSCertificate.findById(req.params.id)
      .populate('user', 'name email studentId')
      .populate('course', 'title category level duration thumbnail');

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    // Check if user owns this certificate or is admin
    if (certificate.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({
      success: true,
      data: certificate
    });
  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all certificates (Admin)
// @route   GET /api/lms/certificates
// @access  Admin
export const getAllCertificates = async (req, res) => {
  try {
    const certificates = await LMSCertificate.find()
      .populate('user', 'name email studentId')
      .populate('course', 'title')
      .sort({ issuedAt: -1 });

    res.json({
      success: true,
      count: certificates.length,
      data: certificates
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Revoke certificate (Admin)
// @route   PUT /api/lms/certificates/:id/revoke
// @access  Admin
export const revokeCertificate = async (req, res) => {
  try {
    const { reason } = req.body;

    const certificate = await LMSCertificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    certificate.status = 'revoked';
    certificate.revokedAt = new Date();
    certificate.revokedBy = req.user._id;
    certificate.revocationReason = reason;

    await certificate.save();

    res.json({
      success: true,
      message: 'Certificate revoked',
      data: certificate
    });
  } catch (error) {
    console.error('Error revoking certificate:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Toggle class lock for a specific student enrollment
// @route   PUT /api/lms/enrollments/:enrollmentId/class/:classId/toggle-lock
// @access  Admin
export const toggleStudentClassLock = async (req, res) => {
  try {
    const { enrollmentId, classId } = req.params;
    const { action } = req.body; // 'lock' or 'unlock'

    const enrollment = await LMSEnrollment.findById(enrollmentId)
      .populate('user', 'name email lmsStudentId');
    
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    const classItem = await LMSClass.findById(classId);
    if (!classItem) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    // Initialize arrays if not exist
    if (!enrollment.unlockedClasses) enrollment.unlockedClasses = [];
    if (!enrollment.lockedClasses) enrollment.lockedClasses = [];

    const unlockedIndex = enrollment.unlockedClasses.findIndex(id => id.toString() === classId);
    const lockedIndex = enrollment.lockedClasses.findIndex(id => id.toString() === classId);

    if (action === 'unlock') {
      // Add to unlockedClasses if not already there
      if (unlockedIndex === -1) {
        enrollment.unlockedClasses.push(classId);
      }
      // Remove from lockedClasses if there
      if (lockedIndex !== -1) {
        enrollment.lockedClasses.splice(lockedIndex, 1);
      }
    } else if (action === 'lock') {
      // Remove from unlockedClasses if there
      if (unlockedIndex !== -1) {
        enrollment.unlockedClasses.splice(unlockedIndex, 1);
      }
      // Add to lockedClasses if not already there
      if (lockedIndex === -1) {
        enrollment.lockedClasses.push(classId);
      }
    }

    await enrollment.save();

    res.json({
      success: true,
      message: `Class ${action}ed for student successfully`,
      data: {
        enrollmentId: enrollment._id,
        classId,
        action,
        unlockedClasses: enrollment.unlockedClasses,
        lockedClasses: enrollment.lockedClasses
      }
    });
  } catch (error) {
    console.error('Error toggling student class lock:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get enrollment details with all classes and their lock status for a student
// @route   GET /api/lms/enrollments/:enrollmentId/classes
// @access  Admin
export const getEnrollmentClasses = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const enrollment = await LMSEnrollment.findById(enrollmentId)
      .populate('user', 'name email lmsStudentId phone')
      .populate('course', 'title');
    
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    // Get all classes for this course
    const classes = await LMSClass.find({ course: enrollment.course._id })
      .sort({ section: 1, order: 1 })
      .select('title section order duration isLocked isPublished videoUrl');

    // Get progress for each class
    const progress = await LMSProgress.find({
      user: enrollment.user._id,
      course: enrollment.course._id
    }).select('class status watchProgress');

    const progressMap = {};
    progress.forEach(p => {
      progressMap[p.class.toString()] = {
        status: p.status,
        watchProgress: p.watchProgress
      };
    });

    // Build classes with lock status
    const classesWithStatus = classes.map(cls => {
      const classId = cls._id.toString();
      
      // Determine lock status for this student
      // Priority: lockedClasses > unlockedClasses > global isLocked
      let isLockedForStudent = cls.isLocked; // Start with global lock status
      
      // Check if specifically unlocked for this student
      if (enrollment.unlockedClasses?.some(id => id.toString() === classId)) {
        isLockedForStudent = false;
      }
      
      // Check if specifically locked for this student (overrides unlock)
      if (enrollment.lockedClasses?.some(id => id.toString() === classId)) {
        isLockedForStudent = true;
      }

      return {
        _id: cls._id,
        title: cls.title,
        section: cls.section,
        order: cls.order,
        duration: cls.duration,
        globalLocked: cls.isLocked,
        isLockedForStudent,
        isUnlockedForStudent: enrollment.unlockedClasses?.some(id => id.toString() === classId) || false,
        isManuallyLocked: enrollment.lockedClasses?.some(id => id.toString() === classId) || false,
        isPublished: cls.isPublished,
        progress: progressMap[classId] || { status: 'not-started', watchProgress: 0 }
      };
    });

    res.json({
      success: true,
      data: {
        enrollment: {
          _id: enrollment._id,
          user: enrollment.user,
          course: enrollment.course,
          progress: enrollment.progress,
          accessBlocked: enrollment.accessBlocked
        },
        classes: classesWithStatus
      }
    });
  } catch (error) {
    console.error('Error getting enrollment classes:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Bulk unlock/lock classes for a student
// @route   PUT /api/lms/enrollments/:enrollmentId/bulk-class-access
// @access  Admin
export const bulkUpdateStudentClassAccess = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { classIds, action } = req.body; // action: 'unlock' or 'lock'

    const enrollment = await LMSEnrollment.findById(enrollmentId);
    
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    // Initialize arrays if not exist
    if (!enrollment.unlockedClasses) enrollment.unlockedClasses = [];
    if (!enrollment.lockedClasses) enrollment.lockedClasses = [];

    for (const classId of classIds) {
      const unlockedIndex = enrollment.unlockedClasses.findIndex(id => id.toString() === classId);
      const lockedIndex = enrollment.lockedClasses.findIndex(id => id.toString() === classId);

      if (action === 'unlock') {
        if (unlockedIndex === -1) {
          enrollment.unlockedClasses.push(classId);
        }
        if (lockedIndex !== -1) {
          enrollment.lockedClasses.splice(lockedIndex, 1);
        }
      } else if (action === 'lock') {
        if (unlockedIndex !== -1) {
          enrollment.unlockedClasses.splice(unlockedIndex, 1);
        }
        if (lockedIndex === -1) {
          enrollment.lockedClasses.push(classId);
        }
      }
    }

    await enrollment.save();

    res.json({
      success: true,
      message: `${classIds.length} classes ${action}ed for student`,
      data: {
        unlockedClasses: enrollment.unlockedClasses,
        lockedClasses: enrollment.lockedClasses
      }
    });
  } catch (error) {
    console.error('Error bulk updating class access:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Issue certificate manually (Admin)
// @route   POST /api/lms/certificates/issue
// @access  Admin
export const issueCertificateManually = async (req, res) => {
  try {
    const { 
      userId, 
      courseId, 
      enrollmentId,
      grade = 'pass', 
      template = 'islamic',
      instructorName = 'Sahibzada Shariq Ahmed Tariqi',
      instructorTitle = 'Spiritual Guide & Teacher'
    } = req.body;

    // Check if certificate already exists
    const existingCert = await LMSCertificate.findOne({
      user: userId,
      course: courseId,
      status: 'issued'
    });

    if (existingCert) {
      return res.status(400).json({
        success: false,
        message: 'Certificate already issued for this student and course',
        data: existingCert
      });
    }

    // Get user and course details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Get or find enrollment
    let enrollment = null;
    if (enrollmentId) {
      enrollment = await LMSEnrollment.findById(enrollmentId);
    } else {
      enrollment = await LMSEnrollment.findOne({ user: userId, course: courseId });
    }

    // Create certificate
    const certificate = await LMSCertificate.create({
      user: userId,
      course: courseId,
      enrollment: enrollment?._id || null,
      studentName: user.name,
      studentId: user.lmsStudentId || user.studentId || null,
      courseTitle: course.title,
      courseCategory: course.category,
      completionDate: enrollment?.completedAt || new Date(),
      template,
      grade,
      instructorName,
      instructorTitle,
      issuedBy: req.user._id,
      issuedAt: new Date()
    });

    // Update enrollment if exists
    if (enrollment) {
      enrollment.certificateIssued = true;
      enrollment.certificateId = certificate._id;
      enrollment.status = 'completed';
      enrollment.completedAt = enrollment.completedAt || new Date();
      await enrollment.save();
    }

    // Populate the certificate before sending response
    const populatedCert = await LMSCertificate.findById(certificate._id)
      .populate('user', 'name email lmsStudentId')
      .populate('course', 'title category')
      .populate('issuedBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Certificate issued successfully',
      data: populatedCert
    });
  } catch (error) {
    console.error('Error issuing certificate manually:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reissue/Restore a revoked certificate (Admin)
// @route   PUT /api/lms/certificates/:id/restore
// @access  Admin
export const restoreCertificate = async (req, res) => {
  try {
    const certificate = await LMSCertificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    if (certificate.status === 'issued') {
      return res.status(400).json({ success: false, message: 'Certificate is already active' });
    }

    certificate.status = 'issued';
    certificate.revokedAt = null;
    certificate.revokedBy = null;
    certificate.revocationReason = null;

    await certificate.save();

    const populatedCert = await LMSCertificate.findById(certificate._id)
      .populate('user', 'name email lmsStudentId')
      .populate('course', 'title category');

    res.json({
      success: true,
      message: 'Certificate restored successfully',
      data: populatedCert
    });
  } catch (error) {
    console.error('Error restoring certificate:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
