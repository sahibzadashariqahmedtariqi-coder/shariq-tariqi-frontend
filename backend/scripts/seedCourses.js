import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/database.js';
import Course from '../models/Course.js';

dotenv.config();

const courses = [
  {
    title: 'Tarbiyat ul Amileen',
    description: 'Learn the fundamentals of Spiritual Courses and spiritual energy work',
    shortDescription: 'روحانی علاج کا جامع کورس',
    image: '/images/tarbiyat-course.jpg',
    category: 'spiritual',
    duration: '8 Weeks',
    level: 'beginner',
    price: 3000,
    isPaid: true,
    isFeatured: true,
    isActive: true,
    enrolledStudents: 234
  },
  {
    title: 'Jabl E Amliyat Season 2 Surah e Muzzamil Special',
    description: 'Deep dive into spiritual sciences and mystical practices',
    shortDescription: 'روحانی علاج کا جامع کورس',
    image: '/images/jabl-amliyat.jpg',
    category: 'spiritual',
    duration: '12 Weeks',
    level: 'advanced',
    price: 3000,
    isPaid: true,
    isFeatured: true,
    isActive: true,
    enrolledStudents: 156
  },
  {
    title: 'Traditional Hikmat & Healing',
    description: 'Learn traditional Islamic medicine and natural healing methods',
    shortDescription: 'روحانی علاج کا جامع کورس',
    image: '/images/hikmat-tariqi.jpg',
    category: 'jismani',
    duration: '10 Weeks',
    level: 'intermediate',
    price: 600,
    isPaid: true,
    isFeatured: true,
    isActive: true,
    enrolledStudents: 189
  },
  {
    title: 'Pakistan & Overseas Free Amliyat',
    description: 'Free spiritual practices and amliyat for Pakistan and overseas students',
    shortDescription: 'مفت روحانی عملیات',
    image: '/images/free-amliyat.jpg',
    category: 'roohani',
    duration: '6 Weeks',
    level: 'beginner',
    price: 0,
    isPaid: false,
    isFeatured: false,
    isActive: true,
    enrolledStudents: 312
  },
  {
    title: 'India Free Amliyat',
    description: 'Free spiritual practices and amliyat specifically for students in India',
    shortDescription: 'مفت روحانی عملیات',
    image: '/images/free-amliyat.jpg',
    category: 'roohani',
    duration: '6 Weeks',
    level: 'beginner',
    price: 0,
    isPaid: false,
    isFeatured: false,
    isActive: true,
    enrolledStudents: 278
  },
  {
    title: 'Jabl-E-Amliyat-Season-1',
    description: 'Special Course',
    shortDescription: 'خصوصی کورس',
    image: '/images/jabl-amliyat-1.jpg',
    category: 'spiritual',
    duration: '8 Weeks',
    level: 'advanced',
    price: 5000,
    isPaid: true,
    isFeatured: true,
    isActive: true,
    enrolledStudents: 145
  }
];

const seedCourses = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing courses...');
    await Course.deleteMany({});
    console.log('✅ Courses cleared');

    console.log('📚 Adding courses to database...');
    const createdCourses = await Course.insertMany(courses);
    console.log(`✅ ${createdCourses.length} courses added successfully!`);

    console.log('\n📊 Summary:');
    const spiritualHealing = createdCourses.filter(c => c.category === 'spiritual-healing').length;
    const medicine = createdCourses.filter(c => c.category === 'medicine').length;
    const free = createdCourses.filter(c => !c.isPaid).length;
    const featured = createdCourses.filter(c => c.isFeatured).length;

    console.log(`  • Spiritual Healing: ${spiritualHealing}`);
    console.log(`  • Medicine: ${medicine}`);
    console.log(`  • Free Courses: ${free}`);
    console.log(`  • Featured: ${featured}`);
    console.log(`\n✅ Total: ${createdCourses.length} courses\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    process.exit(1);
  }
};

seedCourses();
