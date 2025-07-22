'use client';

import { useState, useEffect, useCallback } from 'react';
import ProductCard from '../../components/ProductCard';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storeStatus, setStoreStatus] = useState({ isOpen: false, nextOpen: null });

  const fetchFeaturedProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/products?featured=true&limit=6');
      const data = await response.json();
      if (data.success) {
        setFeaturedProducts(data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // State untuk jadwal dari database
  const [storeSchedule, setStoreSchedule] = useState({});

  const timeToMinutes = useCallback((timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }, []);

  const checkStoreStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/store-settings');
      const data = await response.json();
      
      if (!data.success || !data.data.operatingHours) {
        setStoreStatus({ isOpen: false, nextOpen: null });
        return;
      }

      const schedule = data.data.operatingHours;
      
      // Convert to display format (day number as key)
      const displaySchedule = {};
      const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      dayKeys.forEach((dayKey, index) => {
        displaySchedule[index] = schedule[dayKey] || [];
      });
      
      setStoreSchedule(displaySchedule);

      const now = new Date();
      const currentDay = now.getDay();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      const todaySchedule = schedule[dayKeys[currentDay]] || [];
      let isOpen = false;
      let nextOpen = null;

      // Cek apakah toko buka sekarang
      for (const session of todaySchedule) {
        const openTime = timeToMinutes(session.open);
        const closeTime = timeToMinutes(session.close);
        
        if (currentTime >= openTime && currentTime < closeTime) {
          isOpen = true;
          break;
        }
      }

      // Jika tutup, cari kapan buka berikutnya
      if (!isOpen) {
        // Cek sisa hari ini
        for (const session of todaySchedule) {
          const openTime = timeToMinutes(session.open);
          if (currentTime < openTime) {
            nextOpen = `Hari ini pukul ${session.open} WIB`;
            break;
          }
        }

        // Jika tidak ada lagi hari ini, cek hari berikutnya
        if (!nextOpen) {
          for (let i = 1; i <= 7; i++) {
            const nextDay = (currentDay + i) % 7;
            const nextDayKey = dayKeys[nextDay];
            const nextDaySchedule = schedule[nextDayKey];
            
            if (nextDaySchedule && nextDaySchedule.length > 0) {
              const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
              nextOpen = `${dayNames[nextDay]} pukul ${nextDaySchedule[0].open} WIB`;
              break;
            }
          }
        }
      }

      setStoreStatus({ isOpen, nextOpen });

    } catch (error) {
      console.error('Error fetching store status:', error);
      setStoreStatus({ isOpen: false, nextOpen: null });
    }
  }, [timeToMinutes]);

  useEffect(() => {
    fetchFeaturedProducts();
    checkStoreStatus();
    // Update status setiap menit
    const interval = setInterval(checkStoreStatus, 60000);
    return () => clearInterval(interval);
  }, [fetchFeaturedProducts, checkStoreStatus]);

  const getDayName = (dayNumber) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[dayNumber];
  };

  const categories = [
    { id: 'cincin', name: 'Cincin', emoji: '💍' },
    { id: 'kalung', name: 'Kalung', emoji: '📿' },
    { id: 'gelang', name: 'Gelang', emoji: '🔗' },
    { id: 'anting', name: 'Anting', emoji: '👂' },
    { id: 'liontin', name: 'Liontin', emoji: '🔶' },
    { id: 'bros', name: 'Bros', emoji: '📌' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Perhiasan Emas 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                {" "}Berkualitas
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Temukan koleksi perhiasan emas terbaik untuk momen spesial Anda. 
              Kualitas terjamin dengan desain elegan dan harga terjangkau.
            </p>
            
            {/* Store Status Alert */}
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-6 ${storeStatus.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className={`w-2 h-2 rounded-full ${storeStatus.isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">
                {storeStatus.isOpen 
                  ? 'Toko sedang BUKA - Siap melayani Anda!' 
                  : `Toko TUTUP - ${storeStatus.nextOpen || 'Akan segera buka'}`
                }
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/products"
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-center"
              >
                Jelajahi Koleksi
              </a>
              <a 
                href="#contact"
                className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-full font-semibold hover:border-yellow-500 hover:text-yellow-600 transition-colors text-center"
              >
                Hubungi Kami
              </a>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-yellow-300 rounded-full opacity-20 animate-pulse delay-1000"></div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Kategori Perhiasan
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <a
                key={category.id}
                href={`/products?category=${category.id}`}
                className="group bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl text-center hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 block"
              >
                <div className="text-4xl mb-3">{category.emoji}</div>
                <h4 className="font-semibold text-gray-900 group-hover:text-yellow-600 transition-colors">
                  {category.name}
                </h4>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="products" className="py-16 bg-gradient-to-br from-gray-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Produk Pilihan
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Koleksi perhiasan emas terbaik yang dipilih khusus untuk Anda
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">
                Produk akan segera hadir. Silakan kembali lagi nanti!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Visi Misi Section */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Tentang Toko Emasku
            </h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Visi */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-8 rounded-2xl">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">👁️</span>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 ml-4">Visi Kami</h4>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                Menjadi toko perhiasan emas terpercaya yang menghadirkan keindahan dan kemewahan 
                dalam setiap karya, serta memberikan pengalaman berbelanja yang tak terlupakan 
                bagi setiap pelanggan.
              </p>
            </div>

            {/* Misi */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">🎯</span>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 ml-4">Misi Kami</h4>
              </div>
              <ul className="text-gray-700 space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Menyediakan perhiasan emas berkualitas tinggi dengan harga yang kompetitif
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Memberikan pelayanan prima dengan konsultasi produk yang profesional
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Menghadirkan desain perhiasan yang elegan dan sesuai dengan tren masa kini
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Membangun kepercayaan pelanggan melalui transparansi dan integritas
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Store Schedule Section */}
      <section id="schedule" className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Jam Operasional Toko
            </h3>
            <p className="text-gray-600">
              Kami siap melayani Anda sesuai jadwal berikut
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="space-y-4">
              {Object.entries(storeSchedule).map(([dayNum, schedules]) => {
                const dayNumber = parseInt(dayNum);
                const today = new Date().getDay();
                const isToday = dayNumber === today;
                
                return (
                  <div 
                    key={dayNum}
                    className={`flex justify-between items-center p-4 rounded-lg ${isToday ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center">
                      <span className={`font-semibold ${isToday ? 'text-yellow-600' : 'text-gray-700'}`}>
                        {getDayName(dayNumber)}
                      </span>
                      {isToday && (
                        <span className="ml-2 px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full font-medium">
                          Hari Ini
                        </span>
                      )}
                    </div>
                    
                    <div className="text-right">
                      {schedules.length === 0 ? (
                        <span className="text-red-500 font-medium">TUTUP</span>
                      ) : (
                        <div className="space-y-1">
                          {schedules.map((schedule, index) => (
                            <div key={index} className={`text-sm ${isToday ? 'text-yellow-700' : 'text-gray-600'}`}>
                              {schedule.open} - {schedule.close} WIB
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center text-blue-800">
                <span className="mr-2">ℹ️</span>
                <span className="text-sm">
                  <strong>Catatan:</strong> Jadwal dapat berubah sewaktu-waktu pada hari libur nasional. 
                  Hubungi kami untuk konfirmasi.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-yellow-400 to-yellow-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-white mb-4">
            Siap untuk Berbelanja?
          </h3>
          <p className="text-yellow-100 text-lg mb-8">
            Dapatkan perhiasan emas berkualitas tinggi dengan layanan terbaik
          </p>
          <a 
            href="/products"
            className="bg-white text-yellow-600 px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 inline-block"
          >
            Lihat Semua Produk
          </a>
        </div>
      </section>

    </div>
  );
} 