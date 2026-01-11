import mongoose from 'mongoose';
import { getMureedConnection } from '../config/mureedDatabase.js';

const mureedSchema = new mongoose.Schema({
  mureedId: {
    type: Number,
    unique: true,
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  fatherName: {
    type: String,
    required: [true, 'Father name is required'],
    trim: true,
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true,
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
  },
  profilePicture: {
    type: String,
    required: [true, 'Profile picture is required'],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  cardGeneratedAt: {
    type: Date,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Auto-increment mureedId before saving
mureedSchema.pre('save', async function(next) {
  if (this.isNew) {
    const lastMureed = await this.constructor.findOne({}, {}, { sort: { 'mureedId': -1 } });
    this.mureedId = lastMureed ? lastMureed.mureedId + 1 : 1001; // Start from 1001
  }
  next();
});

// Export a function that returns the model using the separate connection
let MureedModel = null;

export const getMureedModel = () => {
  if (MureedModel) return MureedModel;
  
  const mureedConnection = getMureedConnection();
  if (mureedConnection) {
    MureedModel = mureedConnection.model('Mureed', mureedSchema);
    return MureedModel;
  }
  
  // Fallback to default mongoose connection if separate connection not available
  return mongoose.model('Mureed', mureedSchema);
};

// Default export for backward compatibility
export default mongoose.model('Mureed', mureedSchema);
