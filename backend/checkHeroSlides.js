import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://shariqtariqi:ZH7veFRNvPRLkCvC@cluster0.woxghxd.mongodb.net/shariq-tariqi';

async function checkHeroSlides() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const slides = await mongoose.connection.db.collection('heroslides').find({}).toArray();
    console.log('\n=== Hero Slides in Database ===');
    console.log('Total slides:', slides.length);
    console.log(JSON.stringify(slides, null, 2));
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkHeroSlides();
