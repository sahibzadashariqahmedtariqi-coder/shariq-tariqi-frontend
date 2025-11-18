import mongoose from 'mongoose';

const statsSchema = new mongoose.Schema(
  {
    studentsTrained: {
      type: Number,
      default: 4000,
      required: true,
    },
    averageRating: {
      type: Number,
      default: 4.9,
      required: true,
      min: 0,
      max: 5,
    },
    coursesOffered: {
      type: Number,
      default: 25,
      required: true,
    },
    subscribers: {
      type: Number,
      default: 27.4,
      required: true,
    },
    yearsOfExperience: {
      type: Number,
      default: 15,
      required: true,
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

// Ensure only one stats document exists (singleton pattern)
statsSchema.statics.getInstance = async function () {
  let stats = await this.findOne();
  if (!stats) {
    stats = await this.create({});
  }
  return stats;
};

const Stats = mongoose.model('Stats', statsSchema);

export default Stats;
