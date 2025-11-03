import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import GoldPrice from '../../../../../models/GoldPrice';
import GoldPriceHistory from '../../../../../models/GoldPriceHistory';

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

    // Get previous price data for history
    const previousGoldPrice = await GoldPrice.findById(params.id);
    if (!previousGoldPrice) {
      return NextResponse.json(
        { success: false, error: 'Harga emas tidak ditemukan' },
        { status: 404 }
      );
    }

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

    // Create history record if price changed
    if (buyPrice !== undefined || sellPrice !== undefined) {
      const newBuyPrice = buyPrice !== undefined ? parseFloat(buyPrice) : previousGoldPrice.buyPrice;
      const newSellPrice = sellPrice !== undefined ? parseFloat(sellPrice) : previousGoldPrice.sellPrice;
      
      // Determine change type based on average price
      const previousAvg = (previousGoldPrice.buyPrice + previousGoldPrice.sellPrice) / 2;
      const newAvg = (newBuyPrice + newSellPrice) / 2;
      
      let changeType = 'tetap';
      if (newAvg > previousAvg) {
        changeType = 'naik';
      } else if (newAvg < previousAvg) {
        changeType = 'turun';
      }

      // Only create history if there's actual change
      if (changeType !== 'tetap') {
        await GoldPriceHistory.create({
          code: goldPrice.code,
          previousBuyPrice: previousGoldPrice.buyPrice,
          previousSellPrice: previousGoldPrice.sellPrice,
          newBuyPrice: newBuyPrice,
          newSellPrice: newSellPrice,
          changeType: changeType,
          changeDate: new Date()
        });
      }
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

