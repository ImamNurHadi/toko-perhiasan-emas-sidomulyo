import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Product from '../../../../../models/Product';

// Fix products missing isAvailable field
export async function POST(request) {
  try {
    await connectDB();
    
    console.log('🔧 Fixing products without isAvailable field...');
    
    // Update all products without isAvailable field
    const result = await Product.updateMany(
      { isAvailable: { $exists: false } },
      { $set: { isAvailable: true } }
    );
    
    console.log('🔧 Updated', result.modifiedCount, 'products');
    
    // Get updated count
    const totalProducts = await Product.countDocuments({});
    const availableProducts = await Product.countDocuments({ isAvailable: true });
    
    return NextResponse.json({
      success: true,
      message: 'Fixed products missing isAvailable field',
      updated: result.modifiedCount,
      totalProducts: totalProducts,
      availableProducts: availableProducts
    });
    
  } catch (error) {
    console.error('🔧 Fix Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
} 