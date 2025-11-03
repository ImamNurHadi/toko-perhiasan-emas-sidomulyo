'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'Toko Emas Sidomulyo',
    description: 'Perhiasan emas berkualitas untuk momen spesial Anda',
    vision: 'Menjadi toko perhiasan emas terpercaya yang menghadirkan keindahan dan kemewahan dalam setiap karya',
    mission: [
      'Menyediakan perhiasan emas berkualitas tinggi dengan harga yang kompetitif',
      'Memberikan pelayanan prima dengan konsultasi produk yang profesional',
      'Menghadirkan desain perhiasan yang elegan dan sesuai dengan tren masa kini',
      'Membangun kepercayaan pelanggan melalui transparansi dan integritas'
    ],
    contact: {
      address: 'Jl. Raya Sidomulyo No. 123, Sidomulyo, Indonesia',
      phone: '+62 123 4567 8900',
      email: 'info@tokoemassidomulyo.com',
      whatsapp: '+62 123 4567 8900'
    }
  });
  const [loading, setLoading] = useState(true);

  const fetchStoreSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/store-settings', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      const data = await response.json();
      
      if (data.success && data.data) {
        setStoreSettings(data.data);
      }
    } catch (error) {
      console.error('Error fetching store settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStoreSettings();
  }, [fetchStoreSettings]);

  const formatWhatsAppLink = (phoneNumber) => {
    // Remove all non-numeric characters
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    // Add country code if not present
    const formattedNumber = cleanNumber.startsWith('62') ? cleanNumber : `62${cleanNumber.substring(1)}`;
    return `https://wa.me/${formattedNumber}`;
  };

  if (loading) {
    return (
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-600 rounded w-1/4 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-600 rounded w-1/3 mx-auto"></div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            
            {/* Brand Section */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center overflow-hidden">
                  <Image
                    src="/images/logo.png"
                    alt="Logo Sidomulyo"
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<span class="text-white font-bold text-xl">S</span>';
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-yellow-400">{storeSettings.storeName}</h3>
                  <p className="text-gray-300 text-sm">{storeSettings.description}</p>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                {storeSettings.vision}
              </p>

              {/* Social Media Links */}
              <div className="flex space-x-4">
                {storeSettings.contact.whatsapp && (
                  <a 
                    href={formatWhatsAppLink(storeSettings.contact.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center transition-colors"
                    title="WhatsApp"
                  >
                    <span className="text-white text-sm">💬</span>
                  </a>
                )}
                {storeSettings.contact.email && (
                  <a 
                    href={`mailto:${storeSettings.contact.email}`}
                    className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
                    title="Email"
                  >
                    <span className="text-white text-sm">✉️</span>
                  </a>
                )}
                {storeSettings.contact.phone && (
                  <a 
                    href={`tel:${storeSettings.contact.phone}`}
                    className="w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center transition-colors"
                    title="Telepon"
                  >
                    <span className="text-white text-sm">📞</span>
                  </a>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold text-yellow-400 mb-4">Kontak</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <span className="text-yellow-400 mt-0.5">📍</span>
                  <p className="text-gray-300 leading-relaxed">
                    {storeSettings.contact.address}
                  </p>
                </div>
                
                {storeSettings.contact.phone && (
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400">📞</span>
                    <a 
                      href={`tel:${storeSettings.contact.phone}`}
                      className="text-gray-300 hover:text-yellow-400 transition-colors"
                    >
                      {storeSettings.contact.phone}
                    </a>
                  </div>
                )}
                
                {storeSettings.contact.email && (
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400">✉️</span>
                    <a 
                      href={`mailto:${storeSettings.contact.email}`}
                      className="text-gray-300 hover:text-yellow-400 transition-colors"
                    >
                      {storeSettings.contact.email}
                    </a>
                  </div>
                )}
                
                {storeSettings.contact.whatsapp && (
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400">💬</span>
                    <a 
                      href={formatWhatsAppLink(storeSettings.contact.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-yellow-400 transition-colors"
                    >
                      WhatsApp: {storeSettings.contact.whatsapp}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer; 