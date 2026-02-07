import mongoose from 'mongoose';

const donationPageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: [true, 'Please provide slug'],
    unique: true,
    lowercase: true,
    trim: true
  },
  shortDescription: {
    type: String,
    required: [true, 'Please provide short description'],
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide description']
  },
  coverImage: {
    type: String,
    required: [true, 'Please provide cover image']
  },
  galleryImages: [{
    type: String
  }],
  youtubeShortsUrl: {
    type: String
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.model('DonationPage', donationPageSchema);
