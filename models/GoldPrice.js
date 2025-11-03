import mongoose from 'mongoose';

const GoldPriceSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Kode emas harus diisi'],
    trim: true,
    unique: true
  },
  buyPrice: {
    type: Number,
    required: [true, 'Harga beli harus diisi'],
    min: 0
  },
  sellPrice: {
    type: Number,
    required: [true, 'Harga jual harus diisi'],
    min: 0
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.models.GoldPrice || mongoose.model('GoldPrice', GoldPriceSchema);

