/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable access from external network
  experimental: {
    // Allow external access
  },
  
  // Allow cross-origin requests dari IP network lokal
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '192.168.56.1',
    '192.168.1.8',
    '0.0.0.0'
  ],
  
  // Server configuration
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
  
  // Image domains (untuk gambar produk dari external sources)
  images: {
    domains: [
      'images.unsplash.com',
      'localhost',
      '192.168.1.8',
    ],
  },
  
  // Note: File uploads now use base64 storage in database
  // No need for file system packages
}

module.exports = nextConfig 