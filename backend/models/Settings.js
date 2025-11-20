import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    // Contact Information
    email: {
      type: String,
      required: true,
      default: 'sahibzadashariqahmedtariqi@gmail.com',
    },
    phone: {
      type: String,
      required: true,
      default: '923182392985',
    },
    whatsappLink: {
      type: String,
      required: true,
      default: 'https://api.whatsapp.com/send/?phone=923182392985&text&type=phone_number&app_absent=0',
    },
    
    // Address & Timings
    clinicName: {
      type: String,
      default: 'Al Anum Dawakhana',
    },
    clinicSubtitle: {
      type: String,
      default: 'Sahibzada Shariq Huzoor',
    },
    timings: {
      type: String,
      default: '11 AM To 3 PM',
    },
    address: {
      type: String,
      default: 'Karachi, Pakistan',
    },
    
    // Social Media Links
    facebookUrl: {
      type: String,
      default: 'https://www.facebook.com/profile.php?id=61553408394146',
    },
    youtubeUrl: {
      type: String,
      default: 'https://www.youtube.com/@Sahibzadashariqahmedtariqi',
    },
    instagramUrl: {
      type: String,
      default: 'https://www.instagram.com/sahibzadashariqahmedtariqi?igsh=NDhwc3d2M3Z1cGM1',
    },
    tiktokUrl: {
      type: String,
      default: 'https://www.tiktok.com/@sahibzadashariqahmed?_r=1&_t=ZS-91WRMNMm7GM',
    },
    whatsappChannelUrl: {
      type: String,
      default: 'https://whatsapp.com/channel/0029VaPkzc89cDDh42CswW3S',
    },
    
    // Footer Description
    footerDescription: {
      type: String,
      default: 'Rooted in the timeless wisdom of Sufism and the healing sciences of Hikmat, illuminating hearts with divine knowledge of spirituality and traditional healing.',
    },
    
    // Bank Payment Details
    bankName: {
      type: String,
      default: 'HBL (Habib Bank Limited)',
    },
    accountTitle: {
      type: String,
      default: 'Muhammad Shariq',
    },
    accountNumber: {
      type: String,
      default: '24407000008303',
    },
    ibanNumber: {
      type: String,
      default: 'PK25 HABB 0024407000008303',
    },
    bankBranch: {
      type: String,
      default: 'Bara Market Branch',
    },
    paymentInstructions: {
      type: String,
      default: 'Please transfer the amount to the above account and upload the payment receipt/screenshot for verification.',
    },
    
    // For tracking updates
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists (singleton pattern)
settingsSchema.statics.getInstance = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
