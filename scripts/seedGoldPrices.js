const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://adigaming015:16eo0ZnB4uEt4eCM@cluster0.jyglbwe.mongodb.net/sidomulyo?retryWrites=true&w=majority&appName=Cluster0';

// Define GoldPrice schema directly
const GoldPriceSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  buyPrice: {
    type: Number,
    required: true
  },
  sellPrice: {
    type: Number,
    required: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const GoldPrice = mongoose.models.GoldPrice || mongoose.model('GoldPrice', GoldPriceSchema);

// Data harga emas
const goldPricesData = [
  {
    code: 'XX',
    buyPrice: 920000,
    sellPrice: 850000,
    order: 1
  },
  {
    code: 'X',
    buyPrice: 880000,
    sellPrice: 820000,
    order: 2
  },
  {
    code: '+6',
    buyPrice: 845000,
    sellPrice: 795000,
    order: 3
  }
];

async function seedGoldPrices() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Hapus data lama (opsional)
    console.log('🗑️  Menghapus data harga emas lama...');
    await GoldPrice.deleteMany({});
    console.log('✅ Data lama berhasil dihapus');

    // Insert data baru
    console.log('📝 Menambahkan data harga emas baru...');
    const result = await GoldPrice.insertMany(goldPricesData);
    console.log(`✅ Berhasil menambahkan ${result.length} data harga emas:`);
    
    result.forEach(price => {
      console.log(`   - ${price.code}: Beli Rp ${price.buyPrice.toLocaleString('id-ID')} | Jual Rp ${price.sellPrice.toLocaleString('id-ID')}`);
    });

    console.log('\n🎉 Seed harga emas selesai!');
  } catch (error) {
    console.error('❌ Error seeding gold prices:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Koneksi MongoDB ditutup');
    process.exit();
  }
}

// Run the seed
seedGoldPrices();

