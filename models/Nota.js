import mongoose from 'mongoose';

const notaItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  biji: {
    type: Number,
    required: true,
    min: 1,
  },
  namaBarang: {
    type: String,
    required: true,
  },
  kadar: {
    type: String,
    required: true,
  },
  berat: {
    type: Number,
    required: true,
    min: 0,
  },
  modelKode: {
    type: String,
    required: true,
    enum: ['+6', 'X', 'XX'],
  },
  hargaPerGram: {
    type: Number,
    required: true,
    min: 0,
  },
  jumlah: {
    type: Number,
    required: true,
    min: 0,
  },
  photo: {
    type: String, // Base64 atau URL
  },
}, { _id: false });

const notaSchema = new mongoose.Schema({
  tanggal: {
    type: Date,
    required: true,
    default: Date.now,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  nama: {
    type: String,
    required: true,
  },
  alamat: {
    type: String,
    required: true,
  },
  items: [notaItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  terbilang: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true, // createdAt, updatedAt
});

// Index untuk pencarian
notaSchema.index({ tanggal: -1 });
notaSchema.index({ customer: 1 });
notaSchema.index({ nama: 'text' });

// Populate customer dan product saat query
notaSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'customer',
    select: 'nama alamat NIK',
  }).populate({
    path: 'items.product',
    select: 'name weight code kadarK',
  });
  next();
});

const Nota = mongoose.models.Nota || mongoose.model('Nota', notaSchema);

export default Nota;
