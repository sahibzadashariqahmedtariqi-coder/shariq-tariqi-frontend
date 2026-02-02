import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Please provide your phone number'],
    trim: true
  },
  country: {
    type: String,
    default: 'Pakistan',
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Please select appointment date']
  },
  time: {
    type: String,
    required: [true, 'Please select appointment time']
  },
  type: {
    type: String,
    required: [true, 'Please select appointment type'],
    enum: ['spiritual-healing', 'consultation', 'ruqyah', 'hijama', 'other']
  },
  message: {
    type: String,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Index for date-based queries
appointmentSchema.index({ date: 1, status: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
