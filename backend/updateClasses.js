import dotenv from 'dotenv';
dotenv.config();

import connectDB from './config/database.js';
import LMSClass from './models/LMSClass.js';

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

const updateClasses = async () => {
  try {
    await connectDB();
    
    // Get all classes
    const classes = await LMSClass.find({});
    console.log('Found', classes.length, 'classes');
    
    for (const cls of classes) {
      const videoId = extractYouTubeId(cls.videoUrl);
      console.log(`Class: ${cls.title}`);
      console.log(`  URL: ${cls.videoUrl}`);
      console.log(`  Extracted ID: ${videoId}`);
      
      if (videoId) {
        cls.videoId = videoId;
        cls.isPublished = true;
        cls.isLocked = false;
        await cls.save();
        console.log(`  ✅ Updated!`);
      }
    }
    
    // Show updated classes
    const updated = await LMSClass.find({}).select('title videoUrl videoId isPublished isLocked');
    console.log('\nUpdated classes:', JSON.stringify(updated, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateClasses();
