import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import connectDB from '../config/database.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    console.log('🔍 Checking for existing admin user...');

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@shariqahmedtariqi.com' });

    if (adminExists) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email:', adminExists.email);
      console.log('👤 Name:', adminExists.name);
      console.log('🔑 Role:', adminExists.role);
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@shariqahmedtariqi.com',
      password: 'Admin@123456',
      phone: '+92-300-0000000',
      role: 'admin'
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('🔒 Password: Admin@123456');
    console.log('🔑 Role:', admin.role);
    console.log('\n🎉 You can now login with these credentials!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
