'use client';

import Link from 'next/link';

const categories = [
  { id: 'cincin', name: 'Cincin', emoji: '💍' },
  { id: 'kalung', name: 'Kalung', emoji: '📿' },
  { id: 'gelang', name: 'Gelang', emoji: '🔗' },
  { id: 'anting', name: 'Anting', emoji: '👂' },
  { id: 'liontin', name: 'Liontin', emoji: '🔶' },
  { id: 'bros', name: 'Bros', emoji: '📌' },
];

function ProductsContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* Coming Soon Section */}
        <div className="text-center mb-16">
          <div className="inline-block mb-8">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <span className="text-6xl">🔨</span>
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-2xl">⚙️</span>
              </div>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Fitur Katalog Produk
          </h1>
          <p className="text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 font-bold mb-8">
            Akan Datang Segera
          </p>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
            Kami sedang mempersiapkan katalog perhiasan emas terbaik untuk Anda. 
            Nantikan koleksi eksklusif kami!
          </p>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto mb-12">
            <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-full rounded-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Proses persiapan produk: 75%</p>
          </div>
        </div>

        {/* Categories Preview */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Kategori Yang Akan Hadir
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="text-5xl mb-3">{category.emoji}</div>
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* Features Preview */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Fitur Yang Akan Tersedia
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pencarian Produk</h3>
              <p className="text-gray-600">Temukan perhiasan impian dengan mudah menggunakan fitur pencarian canggih</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏷️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Filter Kategori</h3>
              <p className="text-gray-600">Jelajahi produk berdasarkan kategori favorit Anda</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💎</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Detail Lengkap</h3>
              <p className="text-gray-600">Informasi lengkap setiap produk termasuk berat, kode, dan harga</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Sementara Itu...
          </h3>
          <p className="text-gray-600 mb-8">
            Anda dapat menghubungi kami langsung untuk informasi produk dan pemesanan
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              🏠 Kembali ke Beranda
            </Link>
            <Link
              href="/gold-history"
              className="bg-white text-gray-700 px-8 py-3 rounded-full font-semibold border-2 border-gray-300 hover:border-yellow-500 hover:text-yellow-600 transition-colors"
            >
              💰 Lihat Harga Emas
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function ProductsPage() {
  return <ProductsContent />;
} 