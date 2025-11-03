const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://adigaming015:16eo0ZnB4uEt4eCM@cluster0.jyglbwe.mongodb.net/sidomulyo?retryWrites=true&w=majority&appName=Cluster0';

async function updatePhoneNumber() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Update store settings
    const result = await mongoose.connection.db.collection('storesettings').updateOne(
      {},
      { 
        $set: { 
          'contact.phone': '081234284009',
          'contact.whatsapp': '081234284009'
        } 
      },
      { upsert: true }
    );

    console.log('✅ Nomor telepon berhasil diupdate menjadi: 081234284009');
    console.log('📊 Modified count:', result.modifiedCount);

  } catch (error) {
    console.error('❌ Error updating phone number:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Koneksi MongoDB ditutup');
    process.exit();
  }
}

updatePhoneNumber();

