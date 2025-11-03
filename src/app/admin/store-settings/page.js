'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import AdminProtect from '../../../../components/AdminProtect';

const AdminStoreSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
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
    },
    settings: {
      autoSchedule: true,
      showStock: true,
      minimumOrder: 0,
      currency: 'IDR',
      timezone: 'Asia/Jakarta'
    }
  });

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/store-settings');
      const data = await response.json();
      
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Error fetching store settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value
      }
    }));
  };

  const handleMissionChange = (index, value) => {
    setSettings(prev => ({
      ...prev,
      mission: prev.mission.map((item, i) => i === index ? value : item)
    }));
  };

  const addMission = () => {
    setSettings(prev => ({
      ...prev,
      mission: [...prev.mission, '']
    }));
  };

  const removeMission = (index) => {
    setSettings(prev => ({
      ...prev,
      mission: prev.mission.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/store-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Pengaturan toko berhasil disimpan!');
      } else {
        alert('❌ Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('❌ Gagal menyimpan pengaturan toko');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat pengaturan toko...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminProtect>
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
              <Image
                src="/images/logo_sidomulyo.png"
                alt="Logo Sidomulyo"
                width={48}
                height={48}
                className="rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<span class="text-white font-bold text-2xl">S</span>';
                }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pengaturan Toko</h1>
              <p className="mt-2 text-gray-600">Kelola informasi toko, visi, misi, dan kontak</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Informasi Dasar Toko */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <span className="text-2xl mr-2">🏪</span>
              Informasi Dasar Toko
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Toko *
                </label>
                <input
                  type="text"
                  required
                  value={settings.storeName}
                  onChange={(e) => handleInputChange('storeName', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Nama toko Anda"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tagline/Slogan
                </label>
                <input
                  type="text"
                  value={settings.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Deskripsi singkat toko Anda"
                />
              </div>
            </div>
          </div>

          {/* Visi */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <span className="text-2xl mr-2">🎯</span>
              Visi Toko
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visi
              </label>
              <textarea
                rows="3"
                value={settings.vision}
                onChange={(e) => handleInputChange('vision', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Visi jangka panjang toko Anda"
              />
            </div>
          </div>

          {/* Misi */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <span className="text-2xl mr-2">🚀</span>
              Misi Toko
            </h2>

            <div className="space-y-4">
              {settings.mission.map((mission, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 min-w-[20px]">{index + 1}.</span>
                  <input
                    type="text"
                    value={mission}
                    onChange={(e) => handleMissionChange(index, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder={`Misi ${index + 1}`}
                  />
                  {settings.mission.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMission(index)}
                      className="text-red-600 hover:text-red-800 px-2 py-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={addMission}
                className="text-yellow-600 hover:text-yellow-800 text-sm font-medium flex items-center"
              >
                ➕ Tambah Misi
              </button>
            </div>
          </div>

          {/* Kontak */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <span className="text-2xl mr-2">📞</span>
              Informasi Kontak
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🏠 Alamat Lengkap *
                </label>
                <textarea
                  rows="3"
                  required
                  value={settings.contact.address}
                  onChange={(e) => handleContactChange('address', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Alamat lengkap toko Anda"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📞 Nomor Telepon *
                  </label>
                  <input
                    type="tel"
                    required
                    value={settings.contact.phone}
                    onChange={(e) => handleContactChange('phone', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="+62 123 4567 8900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💬 WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={settings.contact.whatsapp}
                    onChange={(e) => handleContactChange('whatsapp', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="+62 123 4567 8900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ✉️ Email *
                </label>
                <input
                  type="email"
                  required
                  value={settings.contact.email}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="email@tokoemassidomulyo.com"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
              <span className="text-xl mr-2">👁️</span>
              Preview Footer
            </h3>
            
            <div className="bg-white rounded-md p-4 border">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Image
                    src="/images/logo_sidomulyo.png"
                    alt="Logo"
                    width={40}
                    height={40}
                    className="rounded-full mr-3"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{settings.storeName}</h4>
                    <p className="text-sm text-gray-600">{settings.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">Kontak</h5>
                    <p className="text-gray-600">{settings.contact.phone}</p>
                    <p className="text-gray-600">{settings.contact.email}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">Alamat</h5>
                    <p className="text-gray-600">{settings.contact.address}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">Visi</h5>
                    <p className="text-gray-600 text-xs">{settings.vision.substring(0, 100)}...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : '💾 Simpan Pengaturan'}
            </button>
          </div>

        </form>
      </div>
    </div>
    </AdminProtect>
  );
};

export default AdminStoreSettings; 