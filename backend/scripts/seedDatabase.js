import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Service from '../models/Service.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log('🗑️  Dropping database for fresh start...');
    await mongoose.connection.dropDatabase();
    console.log('✅ Database dropped');

    console.log('👤 Creating admin user...');
    const admin = await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@shariqahmedtariqi.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: 'admin'
    });
    console.log(`✅ Admin created: ${admin.email}`);

    console.log('📚 Creating sample courses...');
    const courses = await Course.insertMany([
      {
        title: 'جبل عملیات کورس',
        description: 'یہ ایک مکمل روحانی علاج کا کورس ہے جو جبل عملیات پر مبنی ہے۔',
        shortDescription: 'روحانی علاج کا جامع کورس',
        image: '/images/jabl-amliyat-1.jpg',
        category: 'spiritual',
        duration: '6 Weeks',
        level: 'intermediate',
        price: 5000,
        isPaid: true,
        isFeatured: true,
        enrolledStudents: 120
      },
      {
        title: 'روحانی تربیت کورس',
        description: 'نفس کی اصلاح اور روحانی ترقی کے لیے خصوصی کورس۔',
        shortDescription: 'نفس کی تربیت کا کورس',
        image: '/images/tarbiyat-course.jpg',
        category: 'roohani',
        duration: '8 Weeks',
        level: 'beginner',
        price: 0,
        isPaid: false,
        isFeatured: true,
        enrolledStudents: 250
      }
    ]);
    console.log(`✅ ${courses.length} courses created`);

    console.log('🏥 Creating sample services...');
    const services = await Service.insertMany([
      {
        title: 'Spiritual Healing',
        description: 'Complete spiritual healing session with Quranic verses and prayers',
        shortDescription: 'Spiritual healing with Quran',
        icon: 'Heart',
        category: 'healing',
        price: 2000,
        duration: '1 Hour',
        isFeatured: true
      },
      {
        title: 'Hijama Therapy',
        description: 'Traditional Islamic cupping therapy for physical and spiritual wellness',
        shortDescription: 'Cupping therapy',
        icon: 'Activity',
        category: 'therapy',
        price: 1500,
        duration: '45 Minutes',
        isFeatured: true
      },
      {
        title: 'Ruqyah Session',
        description: 'Complete Ruqyah session for protection and healing',
        shortDescription: 'Islamic exorcism',
        icon: 'Shield',
        category: 'spiritual',
        price: 3000,
        duration: '1.5 Hours',
        isFeatured: true
      }
    ]);
    console.log(`✅ ${services.length} services created`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Admin Credentials:');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${process.env.ADMIN_PASSWORD || 'Admin@123456'}`);
    console.log('\n⚠️  Please change these credentials after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
