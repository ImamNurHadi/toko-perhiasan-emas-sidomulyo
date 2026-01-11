'use client';

import Link from 'next/link';

export default function RegisterPage() {
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
            Fitur Daftar
          </h1>
          <p className="text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 font-bold mb-8">
            Masih Dalam Pengembangan
          </p>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
            Kami sedang mempersiapkan fitur registrasi yang aman dan mudah untuk Anda. 
            Nantikan fitur pendaftaran akun yang akan segera hadir!
          </p>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto mb-12">
            <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-full rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Proses pengembangan: 60%</p>
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
                <span className="text-3xl">🔐</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Registrasi Aman</h3>
              <p className="text-gray-600">Daftar dengan keamanan terjamin dan data terlindungi</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👤</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Profil Lengkap</h3>
              <p className="text-gray-600">Kelola profil Anda dengan informasi lengkap dan terupdate</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⭐</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Akses Eksklusif</h3>
              <p className="text-gray-600">Dapatkan akses ke fitur-fitur eksklusif untuk member</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Sementara Itu...
          </h3>
          <p className="text-gray-600 mb-8">
            Anda dapat menghubungi kami langsung untuk informasi lebih lanjut
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              🏠 Kembali ke Beranda
            </Link>
            <Link
              href="/login"
              className="bg-white text-gray-700 px-8 py-3 rounded-full font-semibold border-2 border-gray-300 hover:border-yellow-500 hover:text-yellow-600 transition-colors"
            >
              🔐 Halaman Login
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

