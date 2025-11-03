import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongodb';
import GoldPriceHistory from '../../../../../models/GoldPriceHistory';

// GET - Ambil history perubahan harga emas dengan limit optional
export async function GET(request) {
  try {
    await dbConnect();

    // Get limit from query params, default to 10
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;

    const history = await GoldPriceHistory
      .find()
      .sort({ changeDate: -1 })
      .limit(Math.min(limit, 100)); // Max 100 items

    return NextResponse.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching gold price history:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil history harga emas' },
      { status: 500 }
    );
  }
}

