import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Update from '../models/Update.js';

dotenv.config();

const seedUpdates = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Clear existing updates
    await Update.deleteMany({});
    console.log('🗑️  Cleared existing updates');

    // Add Ruhani Punjab Tour update
    const update = await Update.create({
      title: 'Ruhani Punjab Tour',
      description: 'Join us on an enlightening spiritual journey across Punjab. Experience divine blessings, spiritual healing sessions, and traditional Islamic teachings in multiple cities. A transformative tour to strengthen your connection with Allah.',
      category: 'announcement',
      date: new Date('2025-11-20'),
      link: '/blog/2',
      image: 'https://res.cloudinary.com/du7qzhimu/image/upload/v1763731786/shariq-website/updates/xgziegflelffznq6rd9.jpg',
      promoImage: 'https://res.cloudinary.com/du7qzhimu/image/upload/v1763731786/shariq-website/updates/xgziegflelffznq6rd9.jpg',
      isActive: true,
      isPinned: true
    });

    console.log('✅ Created update:', update.title);
    console.log('📊 Total updates in database:', await Update.countDocuments());

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedUpdates();
