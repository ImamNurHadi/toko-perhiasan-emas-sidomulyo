'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminProtect from '../../../../components/AdminProtect';

export default function GoldPricesAdmin() {
  const [goldPrices, setGoldPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    code: '',
    buyPrice: '',
    sellPrice: '',
    order: 0
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchGoldPrices = useCallback(async () => {
    try {
      const response = await fetch('/api/gold-prices');
      const data = await response.json();
      if (data.success) {
        setGoldPrices(data.data);
      }
    } catch (error) {
      console.error('Error fetching gold prices:', error);
      showMessage('error', 'Gagal memuat data harga emas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoldPrices();
  }, [fetchGoldPrices]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.code || !formData.buyPrice || !formData.sellPrice) {
      showMessage('error', 'Semua field harus diisi');
      return;
    }

    try {
      const url = editingId 
        ? `/api/gold-prices/${editingId}`
        : '/api/gold-prices';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', editingId ? 'Harga emas berhasil diperbarui!' : 'Harga emas berhasil ditambahkan!');
        setFormData({ code: '', buyPrice: '', sellPrice: '', order: 0 });
        setEditingId(null);
        fetchGoldPrices();
      } else {
        showMessage('error', data.error || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Error saving gold price:', error);
      showMessage('error', 'Gagal menyimpan data');
    }
  };

  const handleEdit = (price) => {
    setFormData({
      code: price.code,
      buyPrice: price.buyPrice,
      sellPrice: price.sellPrice,
      order: price.order || 0
    });
    setEditingId(price._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setFormData({ code: '', buyPrice: '', sellPrice: '', order: 0 });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus harga emas ini?')) return;

    try {
      const response = await fetch(`/api/gold-prices/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Harga emas berhasil dihapus!');
        fetchGoldPrices();
      } else {
        showMessage('error', data.error || 'Gagal menghapus data');
      }
    } catch (error) {
      console.error('Error deleting gold price:', error);
      showMessage('error', 'Gagal menghapus data');
    }
  };

  return (
    <AdminProtect>
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            💰 Kelola Harga Emas
          </h1>
          <p className="text-gray-600">
            Tambah, edit, atau hapus harga emas yang ditampilkan di halaman utama
          </p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            <div className="flex items-center">
              <span className="mr-2">{message.type === 'success' ? '✅' : '❌'}</span>
              {message.text}
            </div>
          </div>
        )}

        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingId ? '✏️ Edit Harga Emas' : '➕ Tambah Harga Emas Baru'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kode Emas *
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="Contoh: XX, X, +6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Kode unik untuk jenis emas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urutan Tampilan
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">Nomor urut tampilan (semakin kecil, semakin depan)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga Beli (Rp/gram) *
                </label>
                <input
                  type="number"
                  name="buyPrice"
                  value={formData.buyPrice}
                  onChange={handleInputChange}
                  placeholder="920000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Harga beli per gram dalam Rupiah</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga Jual (Rp/gram) *
                </label>
                <input
                  type="number"
                  name="sellPrice"
                  value={formData.sellPrice}
                  onChange={handleInputChange}
                  placeholder="850000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Harga jual per gram dalam Rupiah</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
              >
                {editingId ? '💾 Update Harga' : '➕ Tambah Harga'}
              </button>
              
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  ❌ Batal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              📋 Daftar Harga Emas
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
            </div>
          ) : goldPrices.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {goldPrices.map((price) => (
                <div key={price._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-yellow-600">
                          {price.code}
                        </h3>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          Urutan: {price.order}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                          <div className="text-xs text-green-600 font-semibold mb-1">
                            💵 HARGA BELI
                          </div>
                          <div className="text-xl font-bold text-green-700">
                            Rp {price.buyPrice.toLocaleString('id-ID')}
                          </div>
                          <div className="text-xs text-green-600 mt-1">per gram</div>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                          <div className="text-xs text-red-600 font-semibold mb-1">
                            💰 HARGA JUAL
                          </div>
                          <div className="text-xl font-bold text-red-700">
                            Rp {price.sellPrice.toLocaleString('id-ID')}
                          </div>
                          <div className="text-xs text-red-600 mt-1">per gram</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 md:flex-col">
                      <button
                        onClick={() => handleEdit(price)}
                        className="flex-1 md:flex-none px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(price._id)}
                        className="flex-1 md:flex-none px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-2">
                📊 Belum ada data harga emas
              </p>
              <p className="text-gray-400 text-sm">
                Tambahkan harga emas baru menggunakan form di atas
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
    </AdminProtect>
  );
}

