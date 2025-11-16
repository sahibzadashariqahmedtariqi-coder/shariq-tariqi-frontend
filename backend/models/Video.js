import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide video title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  videoId: {
    type: String,
    required: [true, 'Please provide YouTube video ID']
  },
  thumbnail: {
    type: String
  },
  category: {
    type: String,
    enum: ['lecture', 'healing', 'ruqyah', 'tutorial', 'other'],
    default: 'lecture'
  },
  duration: {
    type: String
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Video = mongoose.model('Video', videoSchema);
export default Video;
