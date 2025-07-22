import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Product from '../../../../models/Product';

// GET /api/products - Mendapatkan semua produk dengan filter
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const material = searchParams.get('material');
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit')) || 20;
    const page = parseInt(searchParams.get('page')) || 1;
    
    // Modified query: include products where isAvailable is true OR doesn't exist
    let query = { 
      $or: [
        { isAvailable: true },
        { isAvailable: { $exists: false } }
      ]
    };
    
    if (category) query.category = category;
    if (material) query.material = material;
    if (featured) query.featured = featured === 'true';
    
    const skip = (page - 1) * limit;
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
      
    const total = await Product.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Menambah produk baru
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    const product = new Product(body);
    await product.save();
    
    return NextResponse.json({
      success: true,
      data: product
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create product' 
      },
      { status: 400 }
    );
  }
} 