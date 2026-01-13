import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';
import LMSEnrollment from '../models/LMSEnrollment.js';
import Course from '../models/Course.js';

const mongoUri = process.env.MONGODB_URI;

console.log('Connecting to MongoDB...');

mongoose.connect(mongoUri).then(async () => {
  console.log('Connected to MongoDB');
  
  // Get all enrollments
  const enrollments = await LMSEnrollment.find({})
    .populate('user', 'name email lmsStudentId')
    .populate('course', 'title isLMSEnabled');
  
  console.log('\n=== Total Enrollments:', enrollments.length, '===\n');
  
  enrollments.forEach((e, i) => {
    console.log('---');
    console.log('Enrollment', i+1);
    console.log('Student:', e.user?.name, '(', e.user?.email, ')');
    console.log('Student ID:', e.user?.lmsStudentId);
    console.log('Course:', e.course?.title);
    console.log('Course ID:', e.course?._id?.toString());
    console.log('LMS Enabled:', e.course?.isLMSEnabled);
    console.log('Enrollment ID:', e._id.toString());
  });

  // Get all courses
  console.log('\n=== ALL Courses (with LMS status) ===\n');
  const allCourses = await Course.find({}, 'title _id isLMSEnabled');
  allCourses.forEach(c => {
    console.log(c.title, '| ID:', c._id.toString(), '| LMS:', c.isLMSEnabled ? 'YES' : 'NO');
  });
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
