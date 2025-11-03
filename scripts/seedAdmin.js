const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://adigaming015:16eo0ZnB4uEt4eCM@cluster0.jyglbwe.mongodb.net/sidomulyo?retryWrites=true&w=majority&appName=Cluster0';

// Define User schema directly
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  fullName: String,
  email: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'AdminSM' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin AdminSM sudah ada di database');
      console.log('ℹ️  Username: AdminSM');
      console.log('ℹ️  Role:', existingAdmin.role);
    } else {
      // Hash password menggunakan bcrypt
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('sidomulyo123', salt);

      // Create admin user
      const admin = await User.create({
        username: 'AdminSM',
        password: hashedPassword,
        role: 'admin',
        fullName: 'Administrator Sidomulyo',
        email: 'admin@sidomulyo.com',
        isActive: true
      });

      console.log('✅ Admin berhasil dibuat!');
      console.log('📝 Username: AdminSM');
      console.log('🔑 Password: sidomulyo123');
      console.log('👤 Role:', admin.role);
      console.log('\n⚠️  PENTING: Ganti password default setelah login pertama!');
    }

  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Koneksi MongoDB ditutup');
    process.exit();
  }
}

seedAdmin();

