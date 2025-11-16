import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide article title'],
    trim: true,
    maxlength: [300, 'Title cannot exceed 300 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide article content']
  },
  excerpt: {
    type: String,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  image: {
    type: String,
    required: [true, 'Please provide article image']
  },
  author: {
    type: String,
    default: 'Sahibzada Shariq Ahmed Tariqi'
  },
  category: {
    type: String,
    required: [true, 'Please provide article category'],
    enum: ['spiritual', 'health', 'islamic', 'healing', 'general']
  },
  tags: [String],
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
  isPublished: {
    type: Boolean,
    default: true
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    email: String,
    comment: String,
    isApproved: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for search
articleSchema.index({ title: 'text', content: 'text', tags: 'text' });

const Article = mongoose.model('Article', articleSchema);
export default Article;
