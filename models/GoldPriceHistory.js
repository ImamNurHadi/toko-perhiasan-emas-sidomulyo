import mongoose from 'mongoose';

const GoldPriceHistorySchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    trim: true
  },
  previousBuyPrice: {
    type: Number,
    required: true
  },
  previousSellPrice: {
    type: Number,
    required: true
  },
  newBuyPrice: {
    type: Number,
    required: true
  },
  newSellPrice: {
    type: Number,
    required: true
  },
  changeType: {
    type: String,
    enum: ['naik', 'turun', 'tetap'],
    required: true
  },
  changeDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index untuk query yang lebih cepat
GoldPriceHistorySchema.index({ code: 1, changeDate: -1 });

export default mongoose.models.GoldPriceHistory || mongoose.model('GoldPriceHistory', GoldPriceHistorySchema);

