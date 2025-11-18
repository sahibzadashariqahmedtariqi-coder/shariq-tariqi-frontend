import mongoose from 'mongoose';
import dotenv from 'dotenv';
import HeroSlide from '../models/HeroSlide.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

async function checkHeroSlides() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    const slides = await HeroSlide.find().sort({ order: 1 });
    
    console.log(`📊 Total Hero Slides: ${slides.length}\n`);
    
    slides.forEach((slide, index) => {
      console.log(`${index + 1}. ${slide.title}`);
      console.log(`   Order: ${slide.order}`);
      console.log(`   Active: ${slide.isActive ? '✅' : '❌'}`);
      console.log(`   Image: ${slide.image}`);
      console.log(`   ID: ${slide._id}\n`);
    });

    const activeSlides = slides.filter(s => s.isActive);
    console.log(`✅ Active Slides: ${activeSlides.length}`);
    console.log(`❌ Inactive Slides: ${slides.length - activeSlides.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkHeroSlides();
