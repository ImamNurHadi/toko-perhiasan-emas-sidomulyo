import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: [true, 'Nama customer harus diisi'],
    trim: true,
  },
  alamat: {
    type: String,
    required: [true, 'Alamat customer harus diisi'],
    trim: true,
  },
  NIK: {
    type: String,
    unique: true,
    sparse: true, // Allow null/undefined but enforce uniqueness when present
    trim: true,
  },
  tempatLahir: {
    type: String,
    trim: true,
  },
  tanggalLahir: {
    type: Date,
  },
}, {
  timestamps: true, // createdAt, updatedAt
});

// Index untuk pencarian
customerSchema.index({ nama: 'text', NIK: 'text' });
customerSchema.index({ NIK: 1 });
customerSchema.index({ nama: 1 });

const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);

export default Customer;
