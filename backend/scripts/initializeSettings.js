import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from '../models/Settings.js';

dotenv.config();

const initializeSettings = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if settings already exist
    const existingSettings = await Settings.findOne();
    
    if (existingSettings) {
      console.log('Settings already exist:', existingSettings);
    } else {
      // Create default settings
      const settings = await Settings.create({
        email: 'sahibzadashariqahmedtariqi@gmail.com',
        phone: '923182392985',
        whatsappLink: 'https://api.whatsapp.com/send/?phone=923182392985&text&type=phone_number&app_absent=0',
        clinicName: 'Al Anum Dawakhana',
        clinicSubtitle: 'Sahibzada Shariq Huzoor',
        timings: '11 AM To 3 PM',
        address: 'Karachi, Pakistan',
        facebookUrl: 'https://www.facebook.com/profile.php?id=61553408394146',
        youtubeUrl: 'https://www.youtube.com/@Sahibzadashariqahmedtariqi',
        instagramUrl: 'https://www.instagram.com/sahibzadashariqahmedtariqi?igsh=NDhwc3d2M3Z1cGM1',
        tiktokUrl: 'https://www.tiktok.com/@sahibzadashariqahmed?_r=1&_t=ZS-91WRMNMm7GM',
        whatsappChannelUrl: 'https://whatsapp.com/channel/0029VaPkzc89cDDh42CswW3S',
        footerDescription: 'Rooted in the timeless wisdom of Sufism and the healing sciences of Hikmat, illuminating hearts with divine knowledge of spirituality and traditional healing.',
      });
      
      console.log('Settings initialized successfully:', settings);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error initializing settings:', error);
    process.exit(1);
  }
};

initializeSettings();
