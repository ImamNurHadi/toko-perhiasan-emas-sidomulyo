import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import GoldPrice from '../../../../../models/GoldPrice';

// GET - Get single gold price
export async function GET(request, { params }) {
  try {
    await connectDB();
    const goldPrice = await GoldPrice.findById(params.id);
    
    if (!goldPrice) {
      return NextResponse.json(
        { success: false, error: 'Harga emas tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: goldPrice
    });
  } catch (error) {
    console.error('Error fetching gold price:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data harga emas' },
      { status: 500 }
    );
  }
}

// PUT - Update gold price
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();
    
    const { code, buyPrice, sellPrice, order } = body;

    // Check if code exists for other records
    if (code) {
      const existingPrice = await GoldPrice.findOne({ code, _id: { $ne: params.id } });
      if (existingPrice) {
        return NextResponse.json(
          { success: false, error: 'Kode emas sudah digunakan oleh data lain' },
          { status: 400 }
        );
      }
    }

    const updateData = {};
    if (code) updateData.code = code;
    if (buyPrice !== undefined) updateData.buyPrice = parseFloat(buyPrice);
    if (sellPrice !== undefined) updateData.sellPrice = parseFloat(sellPrice);
    if (order !== undefined) updateData.order = parseInt(order);

    const goldPrice = await GoldPrice.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!goldPrice) {
      return NextResponse.json(
        { success: false, error: 'Harga emas tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: goldPrice
    });
  } catch (error) {
    console.error('Error updating gold price:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui harga emas' },
      { status: 500 }
    );
  }
}

// DELETE - Delete gold price
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const goldPrice = await GoldPrice.findByIdAndDelete(params.id);

    if (!goldPrice) {
      return NextResponse.json(
        { success: false, error: 'Harga emas tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting gold price:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus harga emas' },
      { status: 500 }
    );
  }
}

