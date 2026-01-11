const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://adigaming015:16eo0ZnB4uEt4eCM@cluster0.jyglbwe.mongodb.net/sidomulyo?retryWrites=true&w=majority&appName=Cluster0';

// Define Customer schema directly
const CustomerSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: true,
    trim: true,
  },
  alamat: {
    type: String,
    required: true,
    trim: true,
  },
  NIK: {
    type: String,
    unique: true,
    sparse: true,
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
  timestamps: true,
});

const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);

// Data customer contoh
const customersData = [
  {
    nama: 'Budi Santoso',
    alamat: 'Jl. Raya Kediri No. 123, Kecamatan Pesantren, Kota Kediri',
    NIK: '3506010101800001',
    tempatLahir: 'Kediri',
    tanggalLahir: new Date('1980-01-01'),
  },
  {
    nama: 'Siti Nurhaliza',
    alamat: 'Jl. Diponegoro No. 45, Kecamatan Mojoroto, Kota Kediri',
    NIK: '3506010202850002',
    tempatLahir: 'Kediri',
    tanggalLahir: new Date('1985-02-02'),
  },
  {
    nama: 'Ahmad Fauzi',
    alamat: 'Jl. Ahmad Yani No. 78, Kecamatan Pesantren, Kota Kediri',
    NIK: '3506010303900003',
    tempatLahir: 'Kediri',
    tanggalLahir: new Date('1990-03-03'),
  },
  {
    nama: 'Dewi Sartika',
    alamat: 'Jl. Gatot Subroto No. 12, Kecamatan Mojoroto, Kota Kediri',
    NIK: '3506010404950004',
    tempatLahir: 'Kediri',
    tanggalLahir: new Date('1995-04-04'),
  },
  {
    nama: 'Rudi Hartono',
    alamat: 'Jl. Soekarno Hatta No. 56, Kecamatan Pesantren, Kota Kediri',
    NIK: '3506010505000005',
    tempatLahir: 'Kediri',
    tanggalLahir: new Date('2000-05-05'),
  },
  {
    nama: 'Maya Sari',
    alamat: 'Jl. Hayam Wuruk No. 89, Kecamatan Mojoroto, Kota Kediri',
    NIK: '3506010606050006',
    tempatLahir: 'Kediri',
    tanggalLahir: new Date('2005-06-06'),
  },
  {
    nama: 'Joko Widodo',
    alamat: 'Jl. Sudirman No. 34, Kecamatan Pesantren, Kota Kediri',
    NIK: '3506010707100007',
    tempatLahir: 'Kediri',
    tanggalLahir: new Date('2010-07-07'),
  },
  {
    nama: 'Indah Permata',
    alamat: 'Jl. Merdeka No. 67, Kecamatan Mojoroto, Kota Kediri',
    NIK: '3506010808150008',
    tempatLahir: 'Kediri',
    tanggalLahir: new Date('2015-08-08'),
  },
  {
    nama: 'Bambang Sutrisno',
    alamat: 'Jl. Kartini No. 23, Kecamatan Pesantren, Kota Kediri',
    NIK: '3506010909200009',
    tempatLahir: 'Kediri',
    tanggalLahir: new Date('2020-09-09'),
  },
  {
    nama: 'Ratna Dewi',
    alamat: 'Jl. Pahlawan No. 90, Kecamatan Mojoroto, Kota Kediri',
    NIK: '3506011010250010',
    tempatLahir: 'Kediri',
    tanggalLahir: new Date('2025-10-10'),
  },
];

async function seedCustomers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    let created = 0;
    let skipped = 0;
    let errors = 0;

    console.log('📝 Menambahkan data customer...\n');

    for (const customerData of customersData) {
      try {
        // Check if customer with same NIK already exists
        if (customerData.NIK) {
          const existingCustomer = await Customer.findOne({ NIK: customerData.NIK });
          if (existingCustomer) {
            console.log(`⚠️  Customer dengan NIK ${customerData.NIK} sudah ada: ${existingCustomer.nama}`);
            skipped++;
            continue;
          }
        }

        // Check if customer with same name and address exists
        const existingByName = await Customer.findOne({ 
          nama: customerData.nama,
          alamat: customerData.alamat 
        });
        if (existingByName) {
          console.log(`⚠️  Customer "${customerData.nama}" dengan alamat yang sama sudah ada`);
          skipped++;
          continue;
        }

        // Create customer
        const customer = await Customer.create(customerData);
        console.log(`✅ Customer berhasil dibuat: ${customer.nama} (NIK: ${customer.NIK || 'Tidak ada'})`);
        created++;
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️  Duplikat: ${customerData.nama} - ${error.message}`);
          skipped++;
        } else {
          console.error(`❌ Error membuat customer ${customerData.nama}:`, error.message);
          errors++;
        }
      }
    }

    console.log('\n📊 Ringkasan:');
    console.log(`   ✅ Berhasil dibuat: ${created}`);
    console.log(`   ⚠️  Dilewati (sudah ada): ${skipped}`);
    console.log(`   ❌ Error: ${errors}`);
    console.log(`\n🎉 Seed customer selesai!`);

  } catch (error) {
    console.error('❌ Error seeding customers:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Koneksi MongoDB ditutup');
    process.exit();
  }
}

// Run the seed
seedCustomers();
