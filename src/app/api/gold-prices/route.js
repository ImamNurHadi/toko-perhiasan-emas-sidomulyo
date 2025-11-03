import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import GoldPrice from '../../../../models/GoldPrice';

// GET - Get all gold prices
export async function GET() {
  try {
    await connectDB();
    const goldPrices = await GoldPrice.find({}).sort({ order: 1, createdAt: 1 });
    
    return NextResponse.json({
      success: true,
      data: goldPrices
    });
  } catch (error) {
    console.error('Error fetching gold prices:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data harga emas' },
      { status: 500 }
    );
  }
}

// POST - Create new gold price
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    const { code, buyPrice, sellPrice, order } = body;

    // Validation
    if (!code || !buyPrice || !sellPrice) {
      return NextResponse.json(
        { success: false, error: 'Kode, harga beli, dan harga jual harus diisi' },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingPrice = await GoldPrice.findOne({ code });
    if (existingPrice) {
      return NextResponse.json(
        { success: false, error: 'Kode emas sudah ada' },
        { status: 400 }
      );
    }

    const goldPrice = await GoldPrice.create({
      code,
      buyPrice: parseFloat(buyPrice),
      sellPrice: parseFloat(sellPrice),
      order: order || 0
    });

    return NextResponse.json({
      success: true,
      data: goldPrice
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating gold price:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menambahkan harga emas' },
      { status: 500 }
    );
  }
}

