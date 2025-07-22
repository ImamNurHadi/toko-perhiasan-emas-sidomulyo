import Image from 'next/image';
import Link from 'next/link';

const ProductCard = ({ product }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryDisplay = (category) => {
    const categories = {
      'cincin': 'Cincin',
      'kalung': 'Kalung', 
      'gelang': 'Gelang',
      'anting': 'Anting',
      'liontin': 'Liontin',
      'bros': 'Bros',
      'jam-tangan': 'Jam Tangan',
      'lainnya': 'Lainnya'
    };
    return categories[category] || category;
  };

  const getMaterialDisplay = (material) => {
    const materials = {
      'emas-24k': 'Emas 24K',
      'emas-22k': 'Emas 22K',
      'emas-18k': 'Emas 18K',
      'emas-putih': 'Emas Putih',
      'perak': 'Perak',
      'platinum': 'Platinum',
      'kombinasi': 'Kombinasi'
    };
    return materials[material] || material;
  };

  const isDiscounted = product.discount.percentage > 0 && 
                      new Date(product.discount.validUntil) > new Date();

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
      {/* Badge untuk produk featured atau diskon */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {product.featured && (
          <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Featured
          </span>
        )}
        {isDiscounted && (
          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            -{product.discount.percentage}%
          </span>
        )}
      </div>

      {/* Gambar Produk */}
      <div className="relative h-80 overflow-hidden">
        <Image
          src={product.images[0]?.url || `data:image/svg+xml;base64,${btoa(`
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
          `)}`}
          alt={product.images[0]?.alt || product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Overlay pada hover */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        
        {/* Quick View Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Link 
            href={`/produk/${product._id}`}
            className="bg-white text-gray-900 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            Lihat Detail
          </Link>
        </div>
      </div>

      {/* Informasi Produk */}
      <div className="p-6">
        {/* Kategori dan Material */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500 font-medium">
            {getCategoryDisplay(product.category)}
          </span>
          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
            {getMaterialDisplay(product.material)}
          </span>
        </div>

        {/* Nama Produk */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Berat */}
        <p className="text-sm text-gray-600 mb-3">
          Berat: {product.weight}gr
        </p>

        {/* Spesifikasi tambahan */}
        {product.specifications.gemstone !== 'none' && (
          <p className="text-sm text-gray-600 mb-3 capitalize">
            Batu: {product.specifications.gemstone}
          </p>
        )}

        {/* Harga */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {isDiscounted ? (
              <>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(product.finalPrice)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatCurrency(product.price)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
          
          {/* Stock indicator */}
          <div className="text-right">
            {product.stock > 0 ? (
              <span className="text-sm text-green-600 font-medium">
                Tersedia
              </span>
            ) : (
              <span className="text-sm text-red-600 font-medium">
                Habis
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard; 