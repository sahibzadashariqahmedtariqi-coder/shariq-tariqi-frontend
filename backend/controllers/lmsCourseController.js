import Course from '../models/Course.js';  // Use existing Course model
import LMSClass from '../models/LMSClass.js';
import LMSEnrollment from '../models/LMSEnrollment.js';
import LMSProgress from '../models/LMSProgress.js';
import LMSCertificate from '../models/LMSCertificate.js';
import User from '../models/User.js';
import { v2 as cloudinary } from 'cloudinary';

// ==================== COURSE MANAGEMENT ====================

// @desc    Get all LMS-enabled courses (Admin)
// @route   GET /api/lms/courses/admin
// @access  Admin
export const getAllCoursesAdmin = async (req, res) => {
  try {
    // Get all courses that have LMS enabled OR all courses if admin wants to enable LMS
    const courses = await Course.find()
      .sort({ createdAt: -1 });

    // Get class counts and enrollment counts
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const classCount = await LMSClass.countDocuments({ course: course._id });
        const enrollmentCount = await LMSEnrollment.countDocuments({ course: course._id });
        const unlockedClasses = await LMSClass.countDocuments({ course: course._id, isLocked: false });

        return {
          ...course.toObject(),
          totalClasses: classCount,
          unlockedClasses,
          enrollmentCount
        };
      })
    );

    res.json({
      success: true,
      count: coursesWithStats.length,
      data: coursesWithStats
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get published LMS courses (Public/Student)
// @route   GET /api/lms/courses
// @access  Public
export const getPublishedCourses = async (req, res) => {
  try {
    const { category, level, type } = req.query;
    
    const filter = { isLMSEnabled: true, lmsStatus: 'published', isActive: true };
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (type === 'paid') filter.isPaid = true;
    if (type === 'free') filter.isPaid = false;

    const courses = await Course.find(filter)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single course details
// @route   GET /api/lms/courses/:id
// @access  Public
export const getCourseDetails = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get course classes (grouped by section)
    const classes = await LMSClass.find({ course: course._id, isPublished: true })
      .select('title section order duration isLocked isPreview')
      .sort({ section: 1, order: 1 });

    // Group by section
    const sections = {};
    classes.forEach(cls => {
      if (!sections[cls.section]) {
        sections[cls.section] = [];
      }
      sections[cls.section].push(cls);
    });

    res.json({
      success: true,
      data: {
        course,
        sections,
        totalClasses: classes.length
      }
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get course for enrolled student (learning page)
// @route   GET /api/lms/courses/:courseId/learn
// @access  Protected
export const getCourseForStudent = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check enrollment
    const enrollment = await LMSEnrollment.findOne({
      user: req.user._id,
      course: courseId,
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
        message: 'Your access to this course has been blocked',
        blocked: true,
        reason: enrollment.blockedReason
      });
    }

    // Get course (using Course model)
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Get all published classes
    const classes = await LMSClass.find({ course: courseId, isPublished: true })
      .select('title description section order duration isLocked pdfAttachment')
      .sort({ section: 1, order: 1 });

    // Get user's progress for all classes
    const progress = await LMSProgress.find({
      user: req.user._id,
      course: courseId
    });

    const progressMap = {};
    progress.forEach(p => {
      progressMap[p.class.toString()] = {
        status: p.status,
        watchProgress: p.watchProgress,
        lastPosition: p.lastPosition
      };
    });

    res.json({
      success: true,
      data: {
        course,
        enrollment: {
          _id: enrollment._id,
          status: enrollment.status,
          progress: enrollment.progress,
          certificateIssued: enrollment.certificateIssued,
          certificateId: enrollment.certificateId
        },
        classes,
        progressMap
      }
    });
  } catch (error) {
    console.error('Error fetching course for student:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Enable LMS for a course
// @route   PUT /api/lms/courses/:id/enable-lms
// @access  Admin
export const enableLMS = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    course.isLMSEnabled = true;
    course.lmsStatus = 'draft';
    course.certificateEnabled = req.body.certificateEnabled || false;
    course.certificateTemplate = req.body.certificateTemplate || 'default';
    await course.save();

    res.json({
      success: true,
      message: 'LMS enabled for this course',
      data: course
    });
  } catch (error) {
    console.error('Error enabling LMS:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update course LMS settings
// @route   PUT /api/lms/courses/:id
// @access  Admin
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Update LMS-specific fields
    if (req.body.isLMSEnabled !== undefined) course.isLMSEnabled = req.body.isLMSEnabled;
    if (req.body.lmsStatus) course.lmsStatus = req.body.lmsStatus;
    if (req.body.certificateEnabled !== undefined) course.certificateEnabled = req.body.certificateEnabled;
    if (req.body.certificateTemplate) course.certificateTemplate = req.body.certificateTemplate;

    await course.save();

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Publish/Unpublish LMS course
// @route   PUT /api/lms/courses/:courseId/toggle-publish
// @access  Admin
export const toggleCoursePublish = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    course.lmsStatus = course.lmsStatus === 'published' ? 'draft' : 'published';
    await course.save();

    res.json({
      success: true,
      message: `LMS ${course.lmsStatus === 'published' ? 'published' : 'unpublished'} successfully`,
      data: course
    });
  } catch (error) {
    console.error('Error toggling publish:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== CLASS MANAGEMENT ====================

// @desc    Add class to course
// @route   POST /api/lms/courses/:courseId/classes
// @access  Admin
export const addClass = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, section, videoUrl, duration, notes, isPreview } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Get next order number
    const lastClass = await LMSClass.findOne({ course: courseId, section: section || 'Main Content' })
      .sort({ order: -1 });
    const nextOrder = lastClass ? lastClass.order + 1 : 1;

    // Handle PDF upload from multer (req.file with memoryStorage)
    let pdfAttachment = null;
    if (req.file) {
      try {
        // Upload buffer to Cloudinary using upload_stream
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'lms-pdfs',
              resource_type: 'raw',
              public_id: `${Date.now()}-${req.file.originalname.replace(/\.[^/.]+$/, '')}`
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });
        
        pdfAttachment = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          filename: req.file.originalname || 'attachment.pdf',
          size: uploadResult.bytes
        };
        console.log('✅ PDF uploaded to Cloudinary:', uploadResult.secure_url);
      } catch (uploadError) {
        console.error('❌ PDF upload error:', uploadError);
        // Continue without PDF if upload fails
      }
    }

    // Extract YouTube video ID from URL
    const extractYouTubeId = (url) => {
      if (!url) return null;
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/watch\?.*&v=)([^#&?]*)/,
        /^([a-zA-Z0-9_-]{11})$/
      ];
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
      return null;
    };

    const videoId = extractYouTubeId(videoUrl);

    const newClass = await LMSClass.create({
      course: courseId,
      title,
      description,
      section: section || 'Main Content',
      order: nextOrder,
      videoUrl,
      videoId, // Add extracted video ID
      duration: duration || 0,
      notes,
      pdfAttachment,
      isPreview: isPreview || false,
      isLocked: false, // Unlocked by default taake student dekh sake
      isPublished: true, // Published by default taake student ko show ho
      createdBy: req.user._id
    });

    // Update course total classes
    course.totalClasses = await LMSClass.countDocuments({ course: courseId });
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Class added successfully',
      data: newClass
    });
  } catch (error) {
    console.error('Error adding class:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all classes for a course (Admin)
// @route   GET /api/lms/courses/:courseId/classes
// @access  Admin
export const getCourseClasses = async (req, res) => {
  try {
    const { courseId } = req.params;

    const classes = await LMSClass.find({ course: courseId })
      .sort({ section: 1, order: 1 });

    // Group by section
    const sections = {};
    classes.forEach(cls => {
      if (!sections[cls.section]) {
        sections[cls.section] = [];
      }
      sections[cls.section].push(cls);
    });

    res.json({
      success: true,
      totalClasses: classes.length,
      sections,
      data: classes
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update class
// @route   PUT /api/lms/classes/:classId
// @access  Admin
export const updateClass = async (req, res) => {
  try {
    const classItem = await LMSClass.findById(req.params.classId);
    if (!classItem) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const updates = { ...req.body };

    // Handle PDF upload from multer (req.file with memoryStorage)
    if (req.file) {
      try {
        // Delete old PDF
        if (classItem.pdfAttachment?.publicId) {
          await cloudinary.uploader.destroy(classItem.pdfAttachment.publicId, { resource_type: 'raw' });
        }
        
        // Upload buffer to Cloudinary using upload_stream
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'lms-pdfs',
              resource_type: 'raw',
              public_id: `${Date.now()}-${req.file.originalname.replace(/\.[^/.]+$/, '')}`
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });
        
        updates.pdfAttachment = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          filename: req.file.originalname || 'attachment.pdf',
          size: uploadResult.bytes
        };
        console.log('✅ PDF updated on Cloudinary:', uploadResult.secure_url);
      } catch (uploadError) {
        console.error('❌ PDF upload error:', uploadError);
      }
    }

    updates.updatedBy = req.user._id;

    const updatedClass = await LMSClass.findByIdAndUpdate(
      req.params.classId,
      updates,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Class updated successfully',
      data: updatedClass
    });
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete class
// @route   DELETE /api/lms/classes/:classId
// @access  Admin
export const deleteClass = async (req, res) => {
  try {
    const classItem = await LMSClass.findById(req.params.classId);
    if (!classItem) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    // Delete PDF from cloudinary
    if (classItem.pdfAttachment?.publicId) {
      await cloudinary.uploader.destroy(classItem.pdfAttachment.publicId, { resource_type: 'raw' });
    }

    const courseId = classItem.course;
    await classItem.deleteOne();

    // Update course total classes (using Course model)
    const totalClasses = await LMSClass.countDocuments({ course: courseId });
    await Course.findByIdAndUpdate(courseId, { totalClasses });

    // Delete related progress records
    await LMSProgress.deleteMany({ class: req.params.classId });

    res.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Lock/Unlock class
// @route   PUT /api/lms/classes/:classId/lock
// @access  Admin
export const toggleClassLock = async (req, res) => {
  try {
    const classItem = await LMSClass.findById(req.params.classId);
    if (!classItem) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    classItem.isLocked = !classItem.isLocked;
    classItem.updatedBy = req.user._id;
    await classItem.save();

    res.json({
      success: true,
      message: `Class ${classItem.isLocked ? 'locked' : 'unlocked'} successfully`,
      data: classItem
    });
  } catch (error) {
    console.error('Error toggling lock:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Publish/Unpublish class
// @route   PUT /api/lms/classes/:classId/publish
// @access  Admin
export const toggleClassPublish = async (req, res) => {
  try {
    const classItem = await LMSClass.findById(req.params.classId);
    if (!classItem) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    classItem.isPublished = !classItem.isPublished;
    classItem.updatedBy = req.user._id;
    await classItem.save();

    res.json({
      success: true,
      message: `Class ${classItem.isPublished ? 'published' : 'unpublished'} successfully`,
      data: classItem
    });
  } catch (error) {
    console.error('Error toggling publish:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Bulk unlock classes
// @route   PUT /api/lms/courses/:courseId/unlock-all
// @access  Admin
export const unlockAllClasses = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    await LMSClass.updateMany(
      { course: courseId },
      { isLocked: false, updatedBy: req.user._id }
    );

    res.json({
      success: true,
      message: 'All classes unlocked successfully'
    });
  } catch (error) {
    console.error('Error unlocking classes:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Bulk lock classes
// @route   PUT /api/lms/courses/:courseId/lock-all
// @access  Admin
export const lockAllClasses = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    await LMSClass.updateMany(
      { course: courseId },
      { isLocked: true, updatedBy: req.user._id }
    );

    res.json({
      success: true,
      message: 'All classes locked successfully'
    });
  } catch (error) {
    console.error('Error locking classes:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
