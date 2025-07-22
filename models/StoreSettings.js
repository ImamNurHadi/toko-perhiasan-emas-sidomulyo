import mongoose from 'mongoose';

const storeSettingsSchema = new mongoose.Schema({
  // Informasi Toko
  storeName: {
    type: String,
    default: 'Toko Emasku',
    required: true
  },
  description: {
    type: String,
    default: 'Perhiasan emas berkualitas untuk momen spesial Anda'
  },
  
  // Visi Misi
  vision: {
    type: String,
    default: 'Menjadi toko perhiasan emas terpercaya yang menghadirkan keindahan dan kemewahan dalam setiap karya, serta memberikan pengalaman berbelanja yang tak terlupakan bagi setiap pelanggan.'
  },
  mission: [{
    type: String,
    default: [
      'Menyediakan perhiasan emas berkualitas tinggi dengan harga yang kompetitif',
      'Memberikan pelayanan prima dengan konsultasi produk yang profesional', 
      'Menghadirkan desain perhiasan yang elegan dan sesuai dengan tren masa kini',
      'Membangun kepercayaan pelanggan melalui transparansi dan integritas'
    ]
  }],

  // Jam Operasional
  operatingHours: {
    monday: [{
      open: { type: String, default: '08:00' },
      close: { type: String, default: '12:00' }
    }, {
      open: { type: String, default: '16:00' },
      close: { type: String, default: '19:00' }
    }],
    tuesday: [{
      open: { type: String, default: '08:00' },
      close: { type: String, default: '12:00' }
    }, {
      open: { type: String, default: '16:00' },
      close: { type: String, default: '19:00' }
    }],
    wednesday: [{
      open: { type: String, default: '08:00' },
      close: { type: String, default: '12:00' }
    }, {
      open: { type: String, default: '16:00' },
      close: { type: String, default: '19:00' }
    }],
    thursday: [{
      open: { type: String, default: '08:00' },
      close: { type: String, default: '12:00' }
    }, {
      open: { type: String, default: '16:00' },
      close: { type: String, default: '19:00' }
    }],
    friday: [{
      open: { type: String, default: '08:00' },
      close: { type: String, default: '12:00' }
    }, {
      open: { type: String, default: '16:00' },
      close: { type: String, default: '19:00' }
    }],
    saturday: [{
      open: { type: String, default: '08:00' },
      close: { type: String, default: '15:00' }
    }],
    sunday: [] // Tutup
  },

  // Kontak Informasi
  contact: {
    address: {
      type: String,
      default: 'Jl. Emas Mulia No. 123'
    },
    phone: {
      type: String,
      default: '+62 123 4567 8900'
    },
    email: {
      type: String,
      default: 'info@tokoemasu.com'
    },
    whatsapp: {
      type: String,
      default: '+62 123 4567 8900'
    }
  },

  // Social Media
  socialMedia: {
    instagram: String,
    facebook: String,
    tiktok: String,
    youtube: String
  },

  // Pengaturan Tampilan
  theme: {
    primaryColor: {
      type: String,
      default: '#f59e0b' // yellow-500
    },
    secondaryColor: {
      type: String,
      default: '#d97706' // yellow-600
    },
    logo: String
  },

  // Pengaturuan Khusus
  settings: {
    // Auto close/open berdasarkan jadwal
    autoSchedule: {
      type: Boolean,
      default: true
    },
    // Tampilkan stok produk
    showStock: {
      type: Boolean,
      default: true
    },
    // Minimum order
    minimumOrder: {
      type: Number,
      default: 0
    },
    // Currency
    currency: {
      type: String,
      default: 'IDR'
    },
    // Timezone
    timezone: {
      type: String,
      default: 'Asia/Jakarta'
    }
  },

  // Meta untuk SEO
  seo: {
    title: {
      type: String,
      default: 'Toko Emasku - Perhiasan Emas Berkualitas'
    },
    description: {
      type: String,
      default: 'Toko perhiasan emas terpercaya dengan koleksi cincin, kalung, gelang, dan anting berkualitas tinggi. Harga kompetitif dan pelayanan terbaik.'
    },
    keywords: [{
      type: String,
      default: ['perhiasan emas', 'cincin emas', 'kalung emas', 'gelang emas', 'anting emas', 'toko emas terpercaya']
    }]
  }
}, {
  timestamps: true
});

// Hanya boleh ada satu dokumen settings (singleton pattern)
storeSettingsSchema.statics.getSingleton = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const StoreSettings = mongoose.models.StoreSettings || mongoose.model('StoreSettings', storeSettingsSchema);

export default StoreSettings; 