import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide product description'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  image: {
    type: String,
    required: false,
    default: 'https://res.cloudinary.com/shariqtariqi/image/upload/v1737654000/pdf-icon.png'
  },
  images: [String],
  category: {
    type: String,
    required: [true, 'Please provide product category'],
    enum: ['herbal', 'spiritual', 'books', 'pdf']
  },
  price: {
    type: Number,
    required: [true, 'Please provide product price'],
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  originalPriceINR: {
    type: Number,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  stock: {
    type: Number,
    required: [true, 'Please provide stock quantity'],
    default: 0,
    min: 0
  },
  inStock: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  // For books that have PDF version available
  hasPdfVersion: {
    type: Boolean,
    default: false
  },
  pdfPrice: {
    type: Number,
    min: 0,
    default: null
  },
  pdfPriceINR: {
    type: Number,
    min: 0,
    default: null
  },
  // For books that only have PDF, no hard copy
  isPdfOnly: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    rating: Number,
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  // Indian price in INR
  priceINR: {
    type: Number,
    min: 0,
    default: null
  },
  // PDF URL for free PDFs category
  pdfUrl: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Pre-save hook to convert old category names to new ones
productSchema.pre('save', function(next) {
  const categoryMapping = {
    'herbs': 'herbal',
    'taweez': 'spiritual',
    'other': 'books'
  };
  
  if (this.category && categoryMapping[this.category]) {
    this.category = categoryMapping[this.category];
  }
  next();
});

// Pre-validate hook to convert old category names before validation
productSchema.pre('validate', function(next) {
  const categoryMapping = {
    'herbs': 'herbal',
    'taweez': 'spiritual',
    'other': 'books',
    'pdfs': 'pdf'
  };
  
  if (this.category && categoryMapping[this.category]) {
    this.category = categoryMapping[this.category];
  }
  next();
});

// Index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
