'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const searchParams = useSearchParams();

  const categories = [
    { id: 'all', name: 'Semua Produk', emoji: '🏪', count: 0 },
    { id: 'cincin', name: 'Cincin', emoji: '💍', count: 0 },
    { id: 'kalung', name: 'Kalung', emoji: '📿', count: 0 },
    { id: 'gelang', name: 'Gelang', emoji: '🔗', count: 0 },
    { id: 'anting', name: 'Anting', emoji: '👂', count: 0 },
    { id: 'liontin', name: 'Liontin', emoji: '🔶', count: 0 },
    { id: 'bros', name: 'Bros', emoji: '📌', count: 0 },
  ];

  useEffect(() => {
    fetchProducts();
    
    // Set kategori dari URL parameter
    const category = searchParams.get('category');
    if (category && categories.find(cat => cat.id === category)) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products?limit=100');
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data);
        // Update kategori count
        updateCategoryCount(data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCategoryCount = (productList) => {
    categories.forEach(cat => {
      if (cat.id === 'all') {
        cat.count = productList.length;
      } else {
        cat.count = productList.filter(product => product.category === cat.id).length;
      }
    });
  };

  // Filter produk berdasarkan kategori dan pencarian
  const filteredProducts = products.filter(product => {
    const matchCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    // Show products if isAvailable is true OR doesn't exist (for backward compatibility)
    const isAvailable = product.isAvailable !== false;
    return matchCategory && matchSearch && isAvailable;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Extract kode dari material
  const extractCode = (material) => {
    if (material?.includes('emas-+6') || material?.includes('+6')) return '+6';
    if (material?.includes('emas-XX') || material?.includes('-XX')) return 'XX';
    if (material?.includes('emas-X') || material?.includes('-X')) return 'X';
    return material?.toUpperCase() || 'EMAS';
  };

  // Product Card Component
  const ProductCard = ({ product }) => {
    const placeholderSvg = `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
        <rect width="400" height="400" fill="#f3f4f6"/>
        <circle cx="200" cy="160" r="40" fill="#fbbf24" stroke="#f59e0b" stroke-width="2"/>
        <circle cx="200" cy="160" r="25" fill="none" stroke="#f59e0b" stroke-width="1"/>
        <text x="200" y="260" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">Foto Produk</text>
        <text x="200" y="280" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">Tidak Tersedia</text>
        <g transform="translate(180,140)">
          <path d="M 0,0 L 40,0 L 35,10 L 5,10 Z" fill="#fbbf24"/>
          <circle cx="20" cy="5" r="8" fill="none" stroke="#f59e0b" stroke-width="2"/>
        </g>
      </svg>
    `)}`;

    return (
    <div className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105">
      {/* Product Image */}
      <div className="relative h-64 overflow-hidden">
        <Image
          src={product.images[0]?.url || placeholderSvg}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.target.src = placeholderSvg;
          }}
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.featured && (
            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              ⭐ UNGGULAN
            </span>
          )}
          <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
            {extractCode(product.material)}
          </span>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        
        {/* Quick View Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="bg-white text-gray-900 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg">
            👁️ Lihat Detail
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        {/* Category Badge */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-500 font-medium capitalize">
            {categories.find(cat => cat.id === product.category)?.emoji} {product.category}
          </span>
          <span className="text-xs text-gray-400">
            Stock: {product.stock}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Product Details */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Kode:</span>
            <span className="font-medium text-gray-900">{extractCode(product.material)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Berat:</span>
            <span className="font-medium text-gray-900">{product.weight} gram</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between border-t pt-4">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(product.price)}
            </span>
            <div className="text-xs text-gray-500">
              ~{formatCurrency(Math.round(product.price / product.weight))}/gram
            </div>
          </div>
          
          <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors">
            💬 Tanya
          </button>
        </div>
      </div>
    </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat produk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Katalog Perhiasan Emas
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Temukan koleksi perhiasan emas berkualitas tinggi dengan berbagai pilihan desain dan ukuran
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-md mx-auto relative">
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
            <div className="absolute left-4 top-3.5">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`group flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-yellow-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 shadow-md hover:shadow-lg'
                }`}
              >
                <span className="text-xl">{category.emoji}</span>
                <span className="font-semibold">{category.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selectedCategory === category.id
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-200 text-gray-600 group-hover:bg-yellow-200'
                }`}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              {searchQuery ? (
                <>Menampilkan {filteredProducts.length} hasil untuk "<strong>{searchQuery}</strong>"</>
              ) : (
                <>Menampilkan {filteredProducts.length} produk {selectedCategory !== 'all' ? `kategori ${categories.find(cat => cat.id === selectedCategory)?.name}` : ''}</>
              )}
            </p>
            
            {/* Sort Options - Future Enhancement */}
            <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option>Urutkan: Terbaru</option>
              <option>Harga: Rendah ke Tinggi</option>
              <option>Harga: Tinggi ke Rendah</option>
              <option>Nama: A ke Z</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Tidak ada produk ditemukan</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? (
                <>Coba ubah kata kunci pencarian atau pilih kategori lain</>
              ) : (
                <>Belum ada produk di kategori {categories.find(cat => cat.id === selectedCategory)?.name}</>
              )}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="bg-yellow-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-yellow-600 transition-colors"
            >
              Lihat Semua Produk
            </button>
          </div>
        )}

        {/* Load More - Future Enhancement */}
        {filteredProducts.length > 0 && (
          <div className="text-center mt-12">
            <button className="bg-white text-gray-700 px-8 py-3 rounded-full font-semibold border-2 border-gray-300 hover:border-yellow-500 hover:text-yellow-600 transition-colors">
              Muat Lebih Banyak
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
} 