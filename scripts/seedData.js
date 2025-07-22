// Script untuk mengisi data awal ke database
import mongoose from 'mongoose';

// MongoDB connection menggunakan environment variable
// Pastikan file .env.local sudah dibuat dengan MONGODB_URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://adigaming015:16eo0ZnB4uEt4eCM@cluster0.jyglbwe.mongodb.net/sidomulyo?retryWrites=true&w=majority&appName=Cluster0';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected to:', MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@')); // Hide credentials in log
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Schema langsung di sini untuk seed
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  material: String,
  weight: Number,
  images: [{ url: String, alt: String }],
  stock: Number,
  isAvailable: Boolean,
  specifications: {
    size: String,
    length: Number,
    gemstone: String,
    gemstoneQuality: String,
    custom: mongoose.Schema.Types.Mixed,
  },
  tags: [String],
  featured: Boolean,
  discount: {
    percentage: Number,
    validUntil: Date,
  }
}, { timestamps: true });

const storeSettingsSchema = new mongoose.Schema({
  storeName: String,
  description: String,
  vision: String,
  mission: [String],
  operatingHours: {
    monday: [{ open: String, close: String }],
    tuesday: [{ open: String, close: String }],
    wednesday: [{ open: String, close: String }],
    thursday: [{ open: String, close: String }],
    friday: [{ open: String, close: String }],
    saturday: [{ open: String, close: String }],
    sunday: [{ open: String, close: String }]
  },
  contact: {
    address: String,
    phone: String,
    email: String,
    whatsapp: String
  },
  settings: {
    autoSchedule: Boolean,
    showStock: Boolean,
    minimumOrder: Number,
    currency: String,
    timezone: String
  }
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const StoreSettings = mongoose.models.StoreSettings || mongoose.model('StoreSettings', storeSettingsSchema);

// Data produk sample
const sampleProducts = [
  {
    name: "Cincin Emas Klasik",
    description: "Cincin emas 24K dengan desain klasik yang elegan, cocok untuk acara formal maupun kasual.",
    price: 2500000,
    category: "cincin",
    material: "emas-24k",
    weight: 5.2,
    images: [
      { url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500", alt: "Cincin Emas Klasik" }
    ],
    stock: 3,
    isAvailable: true,
    specifications: {
      size: "17mm",
      gemstone: "none"
    },
    tags: ["klasik", "formal", "wedding"],
    featured: true,
    discount: { percentage: 0 }
  },
  {
    name: "Kalung Emas Mutiara",
    description: "Kalung emas 18K dengan liontin mutiara asli, memberikan kesan mewah dan anggun.",
    price: 4200000,
    category: "kalung",
    material: "emas-18k",
    weight: 12.8,
    images: [
      { url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500", alt: "Kalung Emas Mutiara" }
    ],
    stock: 2,
    isAvailable: true,
    specifications: {
      length: 45,
      gemstone: "pearl",
      gemstoneQuality: "AAA"
    },
    tags: ["mutiara", "mewah", "formal"],
    featured: true,
    discount: { percentage: 10, validUntil: new Date('2024-12-31') }
  },
  {
    name: "Gelang Emas Anyaman",
    description: "Gelang emas 22K dengan pola anyaman tradisional, menggabungkan keindahan klasik dan modern.",
    price: 3800000,
    category: "gelang",
    material: "emas-22k",
    weight: 18.5,
    images: [
      { url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500", alt: "Gelang Emas Anyaman" }
    ],
    stock: 1,
    isAvailable: true,
    specifications: {
      length: 18,
      gemstone: "none"
    },
    tags: ["anyaman", "tradisional", "elegan"],
    featured: true,
    discount: { percentage: 0 }
  },
  {
    name: "Anting Emas Berlian",
    description: "Anting emas putih dengan berlian asli, sempurna untuk melengkapi penampilan istimewa Anda.",
    price: 6500000,
    category: "anting",
    material: "emas-putih",
    weight: 3.2,
    images: [
      { url: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=500", alt: "Anting Emas Berlian" }
    ],
    stock: 4,
    isAvailable: true,
    specifications: {
      gemstone: "diamond",
      gemstoneQuality: "VS1"
    },
    tags: ["berlian", "premium", "mewah"],
    featured: true,
    discount: { percentage: 5, validUntil: new Date('2024-11-30') }
  },
  {
    name: "Liontin Emas Hati",
    description: "Liontin emas 18K berbentuk hati dengan ukiran halus, simbol cinta yang sempurna.",
    price: 1800000,
    category: "liontin",
    material: "emas-18k",
    weight: 2.8,
    images: [
      { url: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=500", alt: "Liontin Emas Hati" }
    ],
    stock: 5,
    isAvailable: true,
    specifications: {
      gemstone: "none"
    },
    tags: ["romantic", "gift", "love"],
    featured: false,
    discount: { percentage: 0 }
  },
  {
    name: "Bros Emas Bunga",
    description: "Bros emas dengan desain bunga yang menawan, cocok untuk melengkapi kebaya atau dress formal.",
    price: 2200000,
    category: "bros",
    material: "emas-22k",
    weight: 4.5,
    images: [
      { url: "https://images.unsplash.com/photo-1629216049153-c2725f2dc5e4?w=500", alt: "Bros Emas Bunga" }
    ],
    stock: 3,
    isAvailable: true,
    specifications: {
      gemstone: "none"
    },
    tags: ["bunga", "kebaya", "formal"],
    featured: false,
    discount: { percentage: 0 }
  }
];

// Data pengaturan toko
const storeSettingsData = {
  storeName: "Toko Emasku",
  description: "Perhiasan emas berkualitas untuk momen spesial Anda",
  vision: "Menjadi toko perhiasan emas terpercaya yang menghadirkan keindahan dan kemewahan dalam setiap karya, serta memberikan pengalaman berbelanja yang tak terlupakan bagi setiap pelanggan.",
  mission: [
    "Menyediakan perhiasan emas berkualitas tinggi dengan harga yang kompetitif",
    "Memberikan pelayanan prima dengan konsultasi produk yang profesional",
    "Menghadirkan desain perhiasan yang elegan dan sesuai dengan tren masa kini",
    "Membangun kepercayaan pelanggan melalui transparansi dan integritas"
  ],
  operatingHours: {
    monday: [
      { open: "08:00", close: "12:00" },
      { open: "16:00", close: "19:00" }
    ],
    tuesday: [
      { open: "08:00", close: "12:00" },
      { open: "16:00", close: "19:00" }
    ],
    wednesday: [
      { open: "08:00", close: "12:00" },
      { open: "16:00", close: "19:00" }
    ],
    thursday: [
      { open: "08:00", close: "12:00" },
      { open: "16:00", close: "19:00" }
    ],
    friday: [
      { open: "08:00", close: "12:00" },
      { open: "16:00", close: "19:00" }
    ],
    saturday: [
      { open: "08:00", close: "15:00" }
    ],
    sunday: []
  },
  contact: {
    address: "Jl. Emas Mulia No. 123, Jakarta Pusat",
    phone: "+62 123 4567 8900",
    email: "info@tokoemasu.com",
    whatsapp: "+62 123 4567 8900"
  },
  settings: {
    autoSchedule: true,
    showStock: true,
    minimumOrder: 0,
    currency: "IDR",
    timezone: "Asia/Jakarta"
  }
};

// Fungsi untuk seed data
const seedData = async () => {
  try {
    console.log('🌱 Starting data seeding...');
    
    // Clear existing data
    await Product.deleteMany({});
    await StoreSettings.deleteMany({});
    
    console.log('🗑️  Cleared existing data');
    
    // Insert products
    await Product.insertMany(sampleProducts);
    console.log(`📦 Inserted ${sampleProducts.length} products`);
    
    // Insert store settings
    await StoreSettings.create(storeSettingsData);
    console.log('⚙️  Inserted store settings');
    
    console.log('✅ Data seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run seed
const runSeed = async () => {
  await connectDB();
  await seedData();
};

runSeed(); 