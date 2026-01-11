import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Customer from '../../../../models/Customer';

// GET /api/customers - Mencari customer berdasarkan nama atau NIK
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit')) || 20;
    
    let query = {};
    
    if (search) {
      // Search by nama or NIK
      query = {
        $or: [
          { nama: { $regex: search, $options: 'i' } },
          { NIK: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);
    
    return NextResponse.json({
      success: true,
      data: customers,
    });
    
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// POST /api/customers - Membuat customer baru
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { nama, alamat, NIK, tempatLahir, tanggalLahir } = body;
    
    // Validasi
    if (!nama || !alamat) {
      return NextResponse.json(
        { success: false, error: 'Nama dan alamat harus diisi' },
        { status: 400 }
      );
    }
    
    // Cek jika NIK sudah ada (jika NIK diisi)
    if (NIK) {
      const existingCustomer = await Customer.findOne({ NIK });
      if (existingCustomer) {
        return NextResponse.json(
          { success: false, error: 'NIK sudah terdaftar', data: existingCustomer },
          { status: 400 }
        );
      }
    }
    
    const customer = await Customer.create({
      nama,
      alamat,
      NIK: NIK || undefined,
      tempatLahir: tempatLahir || undefined,
      tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : undefined,
    });
    
    return NextResponse.json({
      success: true,
      data: customer,
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating customer:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'NIK sudah terdaftar' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
