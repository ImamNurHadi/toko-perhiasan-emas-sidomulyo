import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nama produk harus diisi'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Deskripsi produk harus diisi'],
  },
  price: {
    type: Number,
    required: [true, 'Harga produk harus diisi'],
    min: 0,
  },
  category: {
    type: String,
    required: [true, 'Kategori harus dipilih'],
    enum: ['cincin', 'kalung', 'gelang', 'anting', 'liontin', 'bros', 'jam-tangan', 'lainnya'],
  },
  // Kode emas untuk perhitungan harga
  code: {
    type: String,
    required: [true, 'Kode emas harus dipilih'],
    enum: ['+6', 'X', 'XX'],
    default: '+6'
  },
  material: {
    type: String,
    required: [true, 'Material harus diisi'],
    enum: ['emas-+6', 'emas-X', 'emas-XX', 'emas-24k', 'emas-22k', 'emas-18k', 'emas-putih', 'perak', 'platinum', 'kombinasi', 'emas'],
    default: 'emas'
  },
  weight: {
    type: Number,
    required: [true, 'Berat harus diisi (dalam gram)'],
    min: 0,
  },
  images: [{
    url: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      default: '',
    }
  }],
  stock: {
    type: Number,
    required: [true, 'Stok harus diisi'],
    min: 0,
    default: 0,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  specifications: {
    // Untuk cincin
    size: String, // UK, US, atau diameter dalam mm
    // Untuk kalung/gelang
    length: Number, // dalam cm
    // Untuk batu mulia
    gemstone: {
      type: String,
      enum: ['diamond', 'ruby', 'sapphire', 'emerald', 'pearl', 'none'],
      default: 'none'
    },
    // Kualitas batu
    gemstoneQuality: String,
    // Custom specifications
    custom: mongoose.Schema.Types.Mixed,
  },
  tags: [String],
  featured: {
    type: Boolean,
    default: false,
  },
  discount: {
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    validUntil: Date,
  }
}, {
  timestamps: true, // createdAt, updatedAt
});

// Index untuk pencarian
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ material: 1 });
productSchema.index({ price: 1 });
productSchema.index({ featured: 1 });

// Virtual untuk harga setelah diskon
productSchema.virtual('finalPrice').get(function() {
  if (this.discount.percentage > 0 && this.discount.validUntil > new Date()) {
    return this.price * (1 - this.discount.percentage / 100);
  }
  return this.price;
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product; 