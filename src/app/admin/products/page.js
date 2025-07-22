'use client';

import { useState, useEffect } from 'react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'url'
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'cincin',
    code: '+6', // Kode emas: +6, X, XX
    weight: '',
    images: [{ url: '', alt: '' }],
    // Field otomatis yang akan dihitung
    price: 0,
    material: 'emas',
    stock: 1,
    isAvailable: true,
    description: '',
    specifications: {},
    tags: [],
    featured: false,
    discount: {
      percentage: 0,
      validUntil: ''
    }
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  // Harga per gram berdasarkan kode emas
  const goldPrices = {
    '+6': 705000,
    'X': 740000,
    'XX': 780000
  };

  // Fungsi untuk menghitung harga otomatis
  const calculatePrice = (code, weight) => {
    const pricePerGram = goldPrices[code] || 0;
    const weightNum = parseFloat(weight) || 0;
    return pricePerGram * weightNum;
  };

  // Update harga saat kode atau berat berubah
  useEffect(() => {
    const newPrice = calculatePrice(formData.code, formData.weight);
    setFormData(prev => ({
      ...prev,
      price: newPrice
    }));
  }, [formData.code, formData.weight]);

  // Fungsi untuk upload gambar
  const handleImageUpload = async (file) => {
    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const result = await response.json();

      if (result.success) {
        setFormData(prev => ({
          ...prev,
          images: [{ url: result.url, alt: formData.name || 'Produk Emas' }]
        }));
        alert('Gambar berhasil diupload!');
      } else {
        alert('Error upload: ' + result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Gagal upload gambar');
    } finally {
      setUploading(false);
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi ukuran file (2MB max untuk base64 storage)
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file terlalu besar. Maksimal 2MB untuk penyimpanan database.');
        return;
      }
      
      // Validasi tipe file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Tipe file tidak didukung. Gunakan JPEG, PNG, GIF, atau WebP.');
        return;
      }

      handleImageUpload(file);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=100');
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Auto-generate deskripsi berdasarkan input
    const autoDescription = `${formData.name} berbahan emas ${formData.code} dengan berat ${formData.weight} gram. Kategori: ${formData.category}.`;
    
    const productData = {
      ...formData,
      price: calculatePrice(formData.code, formData.weight),
      weight: parseFloat(formData.weight),
      stock: parseInt(formData.stock),
      description: autoDescription,
      tags: Array.isArray(formData.tags) ? formData.tags : [],
      material: `emas-${formData.code}`,
      discount: {
        percentage: parseInt(formData.discount.percentage) || 0,
        validUntil: formData.discount.validUntil ? new Date(formData.discount.validUntil) : null
      }
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const result = await response.json();
      
      if (result.success) {
        await fetchProducts();
        closeModal();
        alert(editingProduct ? 'Produk berhasil diupdate!' : 'Produk berhasil ditambah!');
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Gagal menyimpan produk');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    
    // Extract kode dari material (contoh: emas-+6 -> +6)
    const extractCode = (material) => {
      if (material.includes('emas-+6')) return '+6';
      if (material.includes('emas-X')) return 'X';  
      if (material.includes('emas-XX')) return 'XX';
      return '+6'; // default
    };
    
    setFormData({
      name: product.name || '',
      category: product.category || 'cincin',
      code: extractCode(product.material || ''),
      weight: product.weight?.toString() || '',
      images: product.images || [{ url: '', alt: '' }],
      price: product.price || 0,
      material: product.material || 'emas',
      stock: product.stock || 1,
      isAvailable: product.isAvailable !== false,
      description: product.description || '',
      specifications: product.specifications || {},
      tags: product.tags || [],
      featured: product.featured || false,
      discount: {
        percentage: product.discount?.percentage || 0,
        validUntil: product.discount?.validUntil ? new Date(product.discount.validUntil).toISOString().slice(0, 16) : ''
      }
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (productId) => {
    if (confirm('Yakin ingin menghapus produk ini?')) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          await fetchProducts();
          alert('Produk berhasil dihapus!');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Gagal menghapus produk');
      }
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'cincin',
      code: '+6', // Kode emas default
      weight: '',
      images: [{ url: '', alt: '' }],
      // Field otomatis
      price: 0,
      material: 'emas',
      stock: 1,
      isAvailable: true,
      description: '',
      specifications: {},
      tags: [],
      featured: false,
      discount: {
        percentage: 0,
        validUntil: ''
      }
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kelola Produk</h1>
              <p className="mt-2 text-gray-600">Manage semua produk perhiasan di toko Anda</p>
            </div>
            <button
              onClick={openAddModal}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Tambah Produk</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="text-blue-600 text-xl">📦</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Produk</p>
                <p className="text-2xl font-semibold text-gray-900">{products.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-green-600 text-xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Tersedia</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {products.filter(p => p.isAvailable && p.stock > 0).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <span className="text-yellow-600 text-xl">⭐</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Featured</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {products.filter(p => p.featured).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Stok Habis</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {products.filter(p => p.stock === 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harga
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stok
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={product.images[0]?.url || `data:image/svg+xml;base64,${btoa(`
                              <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
                                <rect width="100" height="100" fill="#f3f4f6"/>
                                <circle cx="50" cy="40" r="10" fill="#fbbf24" stroke="#f59e0b" stroke-width="1"/>
                                <text x="50" y="65" text-anchor="middle" font-family="Arial" font-size="8" fill="#6b7280">No Image</text>
                              </svg>
                            `)}`}
                            alt={product.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.weight}gr • {product.material}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock} unit
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {product.featured && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⭐ Featured
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.isAvailable ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-md transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md transition-colors"
                      >
                        🗑️ Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Add/Edit Product */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Info Harga per Gram */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">📊 Harga Emas per Gram</h4>
                    <div className="grid grid-cols-3 gap-4 text-xs text-yellow-700">
                      <div className="text-center">
                        <strong>+6</strong><br/>
                        Rp {goldPrices['+6'].toLocaleString('id-ID')}
                      </div>
                      <div className="text-center">
                        <strong>X</strong><br/>
                        Rp {goldPrices['X'].toLocaleString('id-ID')}
                      </div>
                      <div className="text-center">
                        <strong>XX</strong><br/>
                        Rp {goldPrices['XX'].toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>

                  {/* Input Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nama Produk */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📝 Nama Produk *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Contoh: Cincin Solitaire Elegant"
                      />
                    </div>

                    {/* Kategori */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📦 Kategori *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="cincin">💍 Cincin</option>
                        <option value="kalung">📿 Kalung</option>
                        <option value="gelang">🔗 Gelang</option>
                        <option value="anting">👂 Anting</option>
                        <option value="liontin">🔶 Liontin</option>
                        <option value="bros">📌 Bros</option>
                      </select>
                    </div>

                    {/* Kode Emas */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🏷️ Kode Emas *
                      </label>
                      <select
                        value={formData.code}
                        onChange={(e) => setFormData({...formData, code: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="+6">+6 (Rp {goldPrices['+6'].toLocaleString('id-ID')}/gram)</option>
                        <option value="X">X (Rp {goldPrices['X'].toLocaleString('id-ID')}/gram)</option>
                        <option value="XX">XX (Rp {goldPrices['XX'].toLocaleString('id-ID')}/gram)</option>
                      </select>
                    </div>

                    {/* Berat */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ⚖️ Berat (gram) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        required
                        value={formData.weight}
                        onChange={(e) => setFormData({...formData, weight: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Contoh: 2.5"
                      />
                    </div>
                  </div>

                  {/* Harga Otomatis */}
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <label className="block text-sm font-medium text-green-800 mb-2">
                      💰 Harga Otomatis
                    </label>
                    <div className="text-2xl font-bold text-green-600">
                      {formData.price > 0 ? (
                        <>Rp {formData.price.toLocaleString('id-ID')}</>
                      ) : (
                        <span className="text-gray-400">Masukkan berat untuk kalkulasi harga</span>
                      )}
                    </div>
                    {formData.weight && formData.code && (
                      <div className="text-sm text-green-600 mt-1">
                        {formData.weight} gram × Rp {goldPrices[formData.code].toLocaleString('id-ID')} = Rp {calculatePrice(formData.code, formData.weight).toLocaleString('id-ID')}
                      </div>
                    )}
                  </div>

                  {/* Gambar Produk */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🖼️ Gambar Produk
                    </label>
                    
                    {/* Toggle Upload Mode */}
                    <div className="flex items-center space-x-4 mb-4">
                      <button
                        type="button"
                        onClick={() => setUploadMode('file')}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          uploadMode === 'file' 
                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
                            : 'bg-gray-100 text-gray-600 border border-gray-300'
                        }`}
                      >
                        📁 Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadMode('url')}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          uploadMode === 'url' 
                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
                            : 'bg-gray-100 text-gray-600 border border-gray-300'
                        }`}
                      >
                        🔗 URL Gambar
                      </button>
                    </div>

                    {/* File Upload Mode */}
                    {uploadMode === 'file' && (
                      <div>
                        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-blue-400 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="image-upload"
                            disabled={uploading}
                          />
                          <label 
                            htmlFor="image-upload" 
                            className={`cursor-pointer ${uploading ? 'opacity-50' : ''}`}
                          >
                            {uploading ? (
                              <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                <span className="text-sm text-gray-600">Mengupload...</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <span className="text-sm text-gray-600">Klik untuk upload gambar</span>
                                <span className="text-xs text-gray-500 mt-1">JPEG, PNG, GIF, WebP (Max 2MB)</span>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    )}

                    {/* URL Mode */}
                    {uploadMode === 'url' && (
                      <input
                        type="url"
                        value={formData.images[0]?.url || ''}
                        onChange={(e) => setFormData({
                          ...formData, 
                          images: [{ url: e.target.value, alt: formData.name || 'Produk Emas' }]
                        })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    )}

                    {/* Image Preview */}
                    {formData.images[0]?.url && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600 mb-2">Preview:</p>
                        <div className="flex items-center space-x-4">
                          <img 
                            src={formData.images[0].url} 
                            alt="Preview" 
                            className="w-24 h-24 object-cover rounded border shadow-sm"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9ImZlYXRoZXIgZmVhdGhlci1pbWFnZSI+PHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiByeD0iMiIgcnk9IjIiLz48Y2lyY2xlIGN4PSI4LjUiIGN5PSI4LjUiIHI9IjEuNSIvPjxwb2x5bGluZSBwb2ludHM9IjIxLDE1IDEzLDUgOSwxMSIvPjwvc3ZnPg==';
                            }}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">
                              {formData.images[0].url.split('/').pop()}
                            </p>
                            <button
                              type="button"
                              onClick={() => setFormData({
                                ...formData,
                                images: [{ url: '', alt: '' }]
                              })}
                              className="text-xs text-red-600 hover:text-red-800 mt-1"
                            >
                              🗑️ Hapus Gambar
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Options */}
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm text-gray-700">⭐ Produk Unggulan</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isAvailable}
                        onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                        className="rounded text-green-600"
                      />
                      <span className="text-sm text-gray-700">✅ Tersedia</span>
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {editingProduct ? 'Update' : 'Simpan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts; 