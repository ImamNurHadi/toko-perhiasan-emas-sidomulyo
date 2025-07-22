import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Product from '../../../../../models/Product';

// Debug endpoint - tampilkan semua produk tanpa filter
export async function GET(_request) {
  try {
    await connectDB();
    
    console.log('🐛 Debug: Fetching all products without filter...');
    
    // Ambil SEMUA produk tanpa filter apapun
    const allProducts = await Product.find({});
    
    console.log('🐛 Debug: Found', allProducts.length, 'products');
    console.log('🐛 Debug: Sample product:', allProducts[0] || 'No products');
    
    // Juga cek dengan filter isAvailable
    const availableProducts = await Product.find({ isAvailable: true });
    const unavailableProducts = await Product.find({ isAvailable: false });
    const noIsAvailableField = await Product.find({ isAvailable: { $exists: false } });
    
    return NextResponse.json({
      success: true,
      debug: {
        totalProducts: allProducts.length,
        availableProducts: availableProducts.length,
        unavailableProducts: unavailableProducts.length,
        noIsAvailableField: noIsAvailableField.length,
        sampleProduct: allProducts[0] || null,
        connectionString: process.env.MONGODB_URI ? 'Environment variable found' : 'No MONGODB_URI found'
      },
      data: allProducts
    });
    
  } catch (error) {
    console.error('🐛 Debug Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        debug: {
          connectionString: process.env.MONGODB_URI ? 'Environment variable found' : 'No MONGODB_URI found'
        }
      },
      { status: 500 }
    );
  }
} 