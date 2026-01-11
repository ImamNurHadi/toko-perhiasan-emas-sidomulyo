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

// Data produk contoh
const productsData = [
  {
    name: 'Cincin Emas Muda Polos',
    description: 'Cincin emas muda polos dengan desain klasik, cocok untuk pria dan wanita',
    category: 'cincin',
    code: '+6',
    kadarK: '6K',
    weight: 3.5,
    isAvailable: true,
  },
  {
    name: 'Kalung Emas X Rantai',
    description: 'Kalung emas dengan kode X, rantai panjang dengan desain elegan',
    category: 'kalung',
    code: 'X',
    kadarK: '8K',
    weight: 8.2,
    isAvailable: true,
  },
  {
    name: 'Gelang Emas XX Tali',
    description: 'Gelang emas kode XX dengan desain tali yang nyaman dipakai',
    category: 'gelang',
    code: 'XX',
    kadarK: '10K',
    weight: 12.5,
    isAvailable: true,
  },
  {
    name: 'Anting Emas +6 Bulat',
    description: 'Anting emas kode +6 dengan bentuk bulat, cocok untuk acara formal',
    category: 'anting',
    code: '+6',
    kadarK: '6K',
    weight: 2.1,
    isAvailable: true,
  },
  {
    name: 'Liontin Emas X Heart',
    description: 'Liontin emas kode X dengan bentuk hati, hadiah romantis',
    category: 'liontin',
    code: 'X',
    kadarK: '8K',
    weight: 1.8,
    isAvailable: true,
  },
  {
    name: 'Bros Emas XX Bunga',
    description: 'Bros emas kode XX dengan motif bunga, elegan untuk blazer',
    category: 'bros',
    code: 'XX',
    kadarK: '10K',
    weight: 3.2,
    isAvailable: true,
  },
  {
    name: 'Cincin Emas X Berlian',
    description: 'Cincin emas kode X dengan batu berlian, cocok untuk tunangan',
    category: 'cincin',
    code: 'X',
    kadarK: '18K',
    weight: 4.5,
    isAvailable: true,
  },
  {
    name: 'Kalung Emas +6 Pendant',
    description: 'Kalung emas kode +6 dengan pendant besar, statement piece',
    category: 'kalung',
    code: '+6',
    kadarK: '6K',
    weight: 15.8,
    isAvailable: true,
  },
];

async function seedProducts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    let created = 0;
    let skipped = 0;
    let errors = 0;

    console.log('📝 Menambahkan data produk...\n');

    for (const productData of productsData) {
      try {
        // Check if product with same name already exists
        const existingProduct = await Product.findOne({ name: productData.name });
        if (existingProduct) {
          // Update produk jika tidak memiliki kadarK atau field penting lainnya
          const needsUpdate = !existingProduct.kadarK || 
                             existingProduct.kadarK.trim() === '' ||
                             !existingProduct.code ||
                             existingProduct.code !== productData.code;
          
          if (needsUpdate) {
            // Update produk dengan data baru
            existingProduct.kadarK = productData.kadarK;
            existingProduct.code = productData.code;
            if (productData.weight) existingProduct.weight = productData.weight;
            if (productData.description) existingProduct.description = productData.description;
            if (productData.category) existingProduct.category = productData.category;
            await existingProduct.save();
            console.log(`🔄 Produk "${productData.name}" di-update (kadarK: ${productData.kadarK}, code: ${productData.code})`);
            created++;
          } else {
            console.log(`⚠️  Produk "${productData.name}" sudah ada dan lengkap`);
            skipped++;
          }
          continue;
        }

        // Create product baru
        const product = await Product.create(productData);
        console.log(`✅ Produk berhasil dibuat: ${product.name} (${product.category}, ${product.weight}g, ${product.code}, ${product.kadarK})`);
        created++;
      } catch (error) {
        console.error(`❌ Error membuat produk ${productData.name}:`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Ringkasan:');
    console.log(`   ✅ Berhasil dibuat: ${created}`);
    console.log(`   ⚠️  Dilewati (sudah ada): ${skipped}`);
    console.log(`   ❌ Error: ${errors}`);
    console.log(`\n🎉 Seed produk selesai!`);

  } catch (error) {
    console.error('❌ Error seeding products:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Koneksi MongoDB ditutup');
    process.exit();
  }
}

// Run the seed
seedProducts();
