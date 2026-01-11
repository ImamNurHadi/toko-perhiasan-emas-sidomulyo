import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Nota from '../../../../models/Nota';
import Customer from '../../../../models/Customer';
import Product from '../../../../models/Product';

// GET /api/nota - Mendapatkan semua nota
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 20;
    const page = parseInt(searchParams.get('page')) || 1;
    const customerId = searchParams.get('customerId');
    
    let query = {};
    if (customerId) {
      query.customer = customerId;
    }
    
    const skip = (page - 1) * limit;
    
    const notas = await Nota.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    
    const total = await Nota.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: notas,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching notas:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notas' },
      { status: 500 }
    );
  }
}

// POST /api/nota - Membuat nota baru
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { tanggal, customerId, nama, alamat, items } = body;
    
    // Validasi
    if (!tanggal || !customerId || !nama || !alamat || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Data nota tidak lengkap' },
        { status: 400 }
      );
    }
    
    // Validasi dan proses items
    const processedItems = [];
    let totalAmount = 0;
    
    for (const item of items) {
      if (!item.productId || !item.biji || !item.berat || !item.hargaPerGram) {
        return NextResponse.json(
          { success: false, error: 'Data item tidak lengkap (productId, biji, berat, dan hargaPerGram harus diisi)' },
          { status: 400 }
        );
      }
      
      // Get product dengan select eksplisit untuk memastikan kadarK diambil
      const product = await Product.findById(item.productId).select('name code kadarK weight category description images isAvailable');
      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product dengan ID ${item.productId} tidak ditemukan` },
          { status: 404 }
        );
      }
      
      // Convert to plain object untuk akses field
      const productData = product.toObject ? product.toObject() : product;
      
      // Debug logging
      console.log(`🔍 Product "${productData.name}":`, {
        id: productData._id,
        kadarK: productData.kadarK,
        kadarKType: typeof productData.kadarK,
        kadarKExists: productData.kadarK !== undefined && productData.kadarK !== null,
        code: productData.code,
        allFields: Object.keys(productData)
      });
      
      // Validasi kadarK harus ada di product
      // Periksa apakah kadarK ada, bukan null, bukan undefined, dan bukan string kosong
      const kadarKValue = productData.kadarK;
      if (!kadarKValue || (typeof kadarKValue === 'string' && kadarKValue.trim() === '')) {
        console.error(`❌ Product "${productData.name}" tidak memiliki kadarK yang valid:`, {
          kadarK: kadarKValue,
          type: typeof kadarKValue,
          isNull: kadarKValue === null,
          isUndefined: kadarKValue === undefined,
          productFields: Object.keys(productData)
        });
        return NextResponse.json(
          { success: false, error: `Product "${productData.name}" tidak memiliki kadar emas (kadarK). Silakan lengkapi data produk terlebih dahulu di halaman Admin > Products.` },
          { status: 400 }
        );
      }
      
      // Hitung jumlah berdasarkan berat manual × harga per gram manual × biji
      const modelKode = productData.code; // +6, X, atau XX
      const hargaPerGram = parseFloat(item.hargaPerGram) || 0;
      const beratManual = parseFloat(item.berat) || 0;
      const jumlah = beratManual * hargaPerGram * item.biji;
      
      processedItems.push({
        product: productData._id,
        biji: item.biji,
        namaBarang: productData.name,
        kadar: typeof kadarKValue === 'string' ? kadarKValue.trim() : String(kadarKValue), // Ambil kadarK dari product (READ-ONLY), pastikan tidak kosong
        berat: beratManual, // Berat manual dari input timbangan
        modelKode: modelKode,
        hargaPerGram: hargaPerGram, // Harga per gram dari input manual
        jumlah: jumlah,
        photo: item.photo || null,
      });
      
      totalAmount += jumlah;
    }
    
    // Fungsi terbilang (sederhana)
    const angkaTerbilang = (angka) => {
      const satuan = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
      
      if (angka < 12) return satuan[angka];
      if (angka < 20) return satuan[angka - 10] + ' belas';
      if (angka < 100) {
        const puluhan = Math.floor(angka / 10);
        const sisa = angka % 10;
        return satuan[puluhan] + ' puluh ' + satuan[sisa];
      }
      if (angka < 200) return 'seratus ' + angkaTerbilang(angka - 100);
      if (angka < 1000) {
        const ratusan = Math.floor(angka / 100);
        const sisa = angka % 100;
        return satuan[ratusan] + ' ratus ' + angkaTerbilang(sisa);
      }
      if (angka < 2000) return 'seribu ' + angkaTerbilang(angka - 1000);
      if (angka < 1000000) {
        const ribuan = Math.floor(angka / 1000);
        const sisa = angka % 1000;
        return angkaTerbilang(ribuan) + ' ribu ' + angkaTerbilang(sisa);
      }
      if (angka < 1000000000) {
        const jutaan = Math.floor(angka / 1000000);
        const sisa = angka % 1000000;
        return angkaTerbilang(jutaan) + ' juta ' + angkaTerbilang(sisa);
      }
      return 'Angka terlalu besar';
    };
    
    const terbilang = angkaTerbilang(Math.round(totalAmount));
    
    // Create nota
    const nota = await Nota.create({
      tanggal: new Date(tanggal),
      customer: customerId,
      nama,
      alamat,
      items: processedItems,
      totalAmount,
      terbilang: `${terbilang} rupiah`,
    });
    
    // Populate untuk response
    await nota.populate('customer', 'nama alamat NIK');
    await nota.populate('items.product', 'name weight code');
    
    return NextResponse.json({
      success: true,
      data: nota,
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating nota:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create nota' },
      { status: 500 }
    );
  }
}
