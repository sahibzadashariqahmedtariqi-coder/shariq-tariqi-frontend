import mongoose from 'mongoose';

const heroSlideSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [200, 'Subtitle cannot be more than 200 characters']
    },
    image: {
      type: String,
      required: [true, 'Please add an image URL']
    },
    buttonText: {
      type: String,
      default: 'Learn More',
      trim: true
    },
    buttonLink: {
      type: String,
      default: '/about',
      trim: true
    },
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Index for sorting
heroSlideSchema.index({ order: 1, createdAt: -1 });

const HeroSlide = mongoose.model('HeroSlide', heroSlideSchema);

export default HeroSlide;
