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
  // Kadar emas (contoh: "6K", "8K", "18K", "70%", dll)
  kadarK: {
    type: String,
    required: [true, 'Kadar emas harus diisi'],
    trim: true,
  },
  // Berat referensi (dalam gram) - hanya untuk referensi, bukan untuk perhitungan
  weight: {
    type: Number,
    required: false,
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
  isAvailable: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true, // createdAt, updatedAt
});

// Index untuk pencarian
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ code: 1 });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product; 