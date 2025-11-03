'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [storeStatus, setStoreStatus] = useState({ isOpen: false, nextOpen: null });
  const [storeSettings, setStoreSettings] = useState({ storeName: 'Toko Emas Sidomulyo' });
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);
  const pathname = usePathname();

  // Check auth status
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        if (data.authenticated) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const timeToMinutes = useCallback((timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }, []);

  const checkStoreStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/store-settings', {
        cache: 'no-store'
      });
      const data = await response.json();
      
      if (!data.success || !data.data) {
        setStoreStatus({ isOpen: false, nextOpen: null });
        return;
      }

      // Update store settings for navbar
      if (data.data.storeName) {
        setStoreSettings({ storeName: data.data.storeName });
      }

      if (!data.data.operatingHours) {
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
  }, [timeToMinutes]);

  // Check store status berdasarkan database
  useEffect(() => {
    checkStoreStatus();
    const interval = setInterval(checkStoreStatus, 60000);
    return () => clearInterval(interval);
  }, [checkStoreStatus]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setIsUserMenuOpen(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const isActive = (path) => pathname === path;

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                <Image
                  src="/images/logo.png"
                  alt="Logo Sidomulyo"
                  width={32}
                  height={32}
                  className="rounded-full object-cover w-full h-full"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<span class="text-white font-bold text-base sm:text-xl">S</span>';
                  }}
                />
              </div>
              <h1 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 truncate max-w-[120px] sm:max-w-none">{storeSettings.storeName}</h1>
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

            {/* Settings Dropdown - Only for Admin */}
            {user && user.role === 'admin' && (
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
                    href="/admin/gold-prices"
                    onClick={() => setIsSettingsOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm transition-colors ${
                      isActive('/admin/gold-prices')
                        ? 'bg-yellow-50 text-yellow-700 border-r-2 border-yellow-400'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-3">💰</span>
                    <div>
                      <div className="font-medium">Harga Emas</div>
                      <div className="text-xs text-gray-500">Update Harga Emas</div>
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

                  <Link
                    href="/admin/store-settings"
                    onClick={() => setIsSettingsOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm transition-colors ${
                      isActive('/admin/store-settings')
                        ? 'bg-yellow-50 text-yellow-700 border-r-2 border-yellow-400'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-3">🏪</span>
                    <div>
                      <div className="font-medium">Pengaturan Toko</div>
                      <div className="text-xs text-gray-500">Visi, Misi, Kontak</div>
                    </div>
                  </Link>



                </div>
              )}
            </div>
            )}
          </div>

          {/* Right Side - Store Status & Auth */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Store Status Indicator */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-100">
              <div className={`w-2 h-2 rounded-full ${storeStatus.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className={`text-xs font-medium ${storeStatus.isOpen ? 'text-green-700' : 'text-red-700'}`}>
                {storeStatus.isOpen ? 'BUKA' : 'TUTUP'}
              </span>
            </div>

            {/* Auth Buttons / User Menu */}
            {!authLoading && (
              <>
                {user ? (
                  /* User Menu */
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {user.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700 hidden md:block">
                        {user.username}
                      </span>
                      <svg 
                        className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* User Dropdown */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">{user.fullName || user.username}</p>
                          <p className="text-xs text-gray-500">{user.role === 'admin' ? '👑 Admin' : '👤 User'}</p>
                        </div>
                        
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          🚪 Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Login / Register Buttons */
                  <div className="flex items-center space-x-2">
                    <Link
                      href="/login"
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-yellow-600 transition-colors"
                    >
                      🔐 Login
                    </Link>
                    <Link
                      href="/register"
                      className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      📝 Daftar
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <svg 
                className="w-6 h-6 text-gray-700" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation (toggleable) */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 pt-4 pb-3">
            <div className="flex flex-col space-y-2">
              <Link 
                href="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/') 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : 'text-gray-700 hover:text-yellow-600 hover:bg-yellow-50'
                }`}
              >
                🏠 Beranda
              </Link>
              <Link 
                href="/products" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/products') 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : 'text-gray-700 hover:text-yellow-600 hover:bg-yellow-50'
                }`}
              >
                📦 Katalog
              </Link>
              
              {/* Admin Menu - Only for Admin */}
              {user && user.role === 'admin' && (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Admin Panel
                  </div>
                  <Link 
                    href="/admin/products" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive('/admin/products') 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    ⚙️ Kelola Produk
                  </Link>
                  <Link 
                    href="/admin/gold-prices" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive('/admin/gold-prices') 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'text-gray-700 hover:text-yellow-600 hover:bg-yellow-50'
                    }`}
                  >
                    💰 Harga Emas
                  </Link>
                  <Link 
                    href="/admin/schedule" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive('/admin/schedule') 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    🕒 Jadwal Operasional
                  </Link>
                  <Link 
                    href="/admin/store-settings" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive('/admin/store-settings') 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'text-gray-700 hover:text-yellow-600 hover:bg-yellow-50'
                    }`}
                  >
                    🏪 Pengaturan Toko
                  </Link>
                </>
              )}

              {/* Store Status in Mobile */}
              <div className="sm:hidden flex items-center space-x-2 px-3 py-2">
                <div className={`w-2 h-2 rounded-full ${storeStatus.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className={`text-sm font-medium ${storeStatus.isOpen ? 'text-green-700' : 'text-red-700'}`}>
                  Toko {storeStatus.isOpen ? 'BUKA' : 'TUTUP'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 