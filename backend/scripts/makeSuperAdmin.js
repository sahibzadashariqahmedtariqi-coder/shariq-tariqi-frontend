import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const makeSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the admin user
    const admin = await User.findOne({ email: 'admin@shariqahmedtariqi.com' });
    
    if (!admin) {
      console.log('Admin user not found!');
      process.exit(1);
    }

    // Update to Super Admin with new password
    const newPassword = process.env.SUPER_ADMIN_PASSWORD;
    if (!newPassword) {
      console.log('❌ Please set SUPER_ADMIN_PASSWORD environment variable');
      process.exit(1);
    }
    admin.isSuperAdmin = true;
    admin.password = newPassword;
    admin.role = 'admin';
    
    await admin.save();

    console.log('✅ Successfully updated Admin to Super Admin!');
    console.log('Email:', admin.email);
    console.log('Name:', admin.name);
    console.log('Is Super Admin:', admin.isSuperAdmin);
    console.log('Password set from SUPER_ADMIN_PASSWORD env variable');
    console.log('\n⚠️  Super Admin Protections:');
    console.log('- Cannot be deleted by anyone');
    console.log('- Only Super Admin can modify Super Admin');
    console.log('- Can view and change any user\'s password');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

makeSuperAdmin();
