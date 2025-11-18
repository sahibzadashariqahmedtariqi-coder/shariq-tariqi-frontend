import mongoose from 'mongoose';
import dotenv from 'dotenv';
import HeroSlide from '../models/HeroSlide.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const heroSlides = [
  {
    title: 'Welcome to Spiritual Guidance',
    subtitle: 'Discover the path to inner peace and enlightenment',
    image: '/images/hero-1.jpg',
    buttonText: 'Explore Courses',
    buttonLink: '/courses',
    order: 1,
    isActive: true
  },
  {
    title: 'Traditional Islamic Healing',
    subtitle: 'Ancient wisdom meets modern wellness',
    image: '/images/hero-2.jpg',
    buttonText: 'Our Services',
    buttonLink: '/services',
    order: 2,
    isActive: true
  },
  {
    title: 'Spiritual Education',
    subtitle: 'Learn from authentic sources and experienced teachers',
    image: '/images/hero-3.jpg',
    buttonText: 'View Media',
    buttonLink: '/media',
    order: 3,
    isActive: true
  },
  {
    title: 'Hikmat & Herbal Medicine',
    subtitle: 'Natural healing through traditional methods',
    image: '/images/hero-4.jpg',
    buttonText: 'Shop Products',
    buttonLink: '/products',
    order: 4,
    isActive: true
  },
  {
    title: 'Personalized Consultation',
    subtitle: 'Book your appointment for spiritual guidance',
    image: '/images/hero-5.jpg',
    buttonText: 'Book Appointment',
    buttonLink: '/appointments',
    order: 5,
    isActive: true
  }
];

async function seedHeroSlides() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Clear existing hero slides
    await HeroSlide.deleteMany({});
    console.log('🗑️  Cleared existing hero slides');

    // Insert new hero slides
    const createdSlides = await HeroSlide.insertMany(heroSlides);
    console.log(`✅ ${createdSlides.length} hero slides seeded successfully`);

    console.log('\n📋 Seeded Hero Slides:');
    createdSlides.forEach((slide, index) => {
      console.log(`${index + 1}. ${slide.title} (Order: ${slide.order})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding hero slides:', error);
    process.exit(1);
  }
}

seedHeroSlides();
