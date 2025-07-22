'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [storeStatus, setStoreStatus] = useState({ isOpen: false, nextOpen: null });
  const dropdownRef = useRef(null);
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check store status berdasarkan database
  useEffect(() => {
    checkStoreStatus();
    const interval = setInterval(checkStoreStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkStoreStatus = async () => {
    try {
      const response = await fetch('/api/store-settings');
      const data = await response.json();
      
      if (!data.success || !data.data.operatingHours) {
        setStoreStatus({ isOpen: false, nextOpen: null });
        return;
      }

      const schedule = data.data.operatingHours;
      const now = new Date();
      const currentDay = now.getDay();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      // Convert day number to day name key
      const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const todayKey = dayKeys[currentDay];
      const todaySchedule = schedule[todayKey] || [];

      let isOpen = false;

      // Check if currently open
      for (const session of todaySchedule) {
        const openTime = timeToMinutes(session.open);
        const closeTime = timeToMinutes(session.close);
        
        if (currentTime >= openTime && currentTime < closeTime) {
          isOpen = true;
          break;
        }
      }

      setStoreStatus({ isOpen });

    } catch (error) {
      console.error('Error fetching store status:', error);
      setStoreStatus({ isOpen: false, nextOpen: null });
    }
  };

  const timeToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const isActive = (path) => pathname === path;

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Toko Emasku</h1>
            </Link>
          </div>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-yellow-100 text-yellow-700' 
                  : 'text-gray-700 hover:text-yellow-600 hover:bg-yellow-50'
              }`}
            >
              🏠 Beranda
            </Link>
            
            <Link 
              href="/products" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/products') 
                  ? 'bg-yellow-100 text-yellow-700' 
                  : 'text-gray-700 hover:text-yellow-600 hover:bg-yellow-50'
              }`}
            >
              📦 Katalog
            </Link>

            {/* Settings Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                  pathname.startsWith('/admin') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <span>⚙️ Settings</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    Admin Panel
                  </div>
                  
                  <Link
                    href="/admin/products"
                    onClick={() => setIsSettingsOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm transition-colors ${
                      isActive('/admin/products')
                        ? 'bg-yellow-50 text-yellow-700 border-r-2 border-yellow-400'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-3">📦</span>
                    <div>
                      <div className="font-medium">Kelola Produk</div>
                      <div className="text-xs text-gray-500">CRUD Perhiasan</div>
                    </div>
                  </Link>

                  <Link
                    href="/admin/schedule"
                    onClick={() => setIsSettingsOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm transition-colors ${
                      isActive('/admin/schedule')
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-400'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-3">🕒</span>
                    <div>
                      <div className="font-medium">Jadwal Operasional</div>
                      <div className="text-xs text-gray-500">Atur Jam Buka/Tutup</div>
                    </div>
                  </Link>

                  <hr className="my-2 border-gray-100" />
                  
                  <Link
                    href="/admin/settings"
                    onClick={() => setIsSettingsOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm transition-colors ${
                      isActive('/admin/settings')
                        ? 'bg-gray-50 text-gray-700 border-r-2 border-gray-400'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-3">⚙️</span>
                    <div>
                      <div className="font-medium">Pengaturan Toko</div>
                      <div className="text-xs text-gray-500">Visi, Misi, Kontak</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Store Status */}
          <div className="flex items-center space-x-4">
            {/* Store Status Indicator */}
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-100">
              <div className={`w-2 h-2 rounded-full ${storeStatus.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className={`text-xs font-medium ${storeStatus.isOpen ? 'text-green-700' : 'text-red-700'}`}>
                {storeStatus.isOpen ? 'BUKA' : 'TUTUP'}
              </span>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation (collapsed by default) */}
        <div className="md:hidden border-t border-gray-200 pt-4 pb-3">
          <div className="flex flex-col space-y-2">
            <Link href="/" className="px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-yellow-600 hover:bg-yellow-50">
              🏠 Beranda
            </Link>
            <Link href="/products" className="px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-yellow-600 hover:bg-yellow-50">
              📦 Katalog
            </Link>
            <Link href="/admin/products" className="px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50">
              ⚙️ Kelola Produk
            </Link>
            <Link href="/admin/schedule" className="px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50">
              🕒 Jadwal Operasional
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 