const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://adigaming015:16eo0ZnB4uEt4eCM@cluster0.jyglbwe.mongodb.net/sidomulyo?retryWrites=true&w=majority&appName=Cluster0';

// Define Product schema directly
const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['cincin', 'kalung', 'gelang', 'anting', 'liontin', 'bros', 'jam-tangan', 'lainnya'],
  },
  code: {
    type: String,
    required: true,
    enum: ['+6', 'X', 'XX'],
    default: '+6'
  },
  kadarK: {
    type: String,
    required: true,
    trim: true,
  },
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
  }
}, {
  timestamps: true,
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// Mapping code ke kadarK default (jika tidak ada di seed data)
const defaultKadarKByCode = {
  '+6': '6K',
  'X': '8K',
  'XX': '10K',
};

async function fixProductKadarK() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all products without kadarK or with empty kadarK
    const productsWithoutKadarK = await Product.find({
      $or: [
        { kadarK: { $exists: false } },
        { kadarK: null },
        { kadarK: '' },
        { kadarK: { $regex: /^\s*$/ } } // Only whitespace
      ]
    });

    console.log(`\n📝 Ditemukan ${productsWithoutKadarK.length} produk tanpa kadarK\n`);

    if (productsWithoutKadarK.length === 0) {
      console.log('✅ Semua produk sudah memiliki kadarK');
      await mongoose.connection.close();
      console.log('🔌 Koneksi MongoDB ditutup');
      process.exit(0);
    }

    let updated = 0;
    let errors = 0;

    for (const product of productsWithoutKadarK) {
      try {
        // Tentukan kadarK berdasarkan code
        let kadarK = defaultKadarKByCode[product.code] || '6K'; // Default ke 6K jika code tidak dikenal

        // Update produk dengan kadarK
        product.kadarK = kadarK;
        await product.save();

        console.log(`✅ Produk "${product.name}" di-update: kadarK = ${kadarK} (code: ${product.code})`);
        updated++;
      } catch (error) {
        console.error(`❌ Error mengupdate produk "${product.name}":`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Ringkasan:');
    console.log(`   ✅ Berhasil di-update: ${updated}`);
    console.log(`   ❌ Error: ${errors}`);
    console.log(`\n🎉 Fix produk kadarK selesai!`);

  } catch (error) {
    console.error('❌ Error fixing products:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Koneksi MongoDB ditutup');
    process.exit();
  }
}

// Run the fix
fixProductKadarK();
