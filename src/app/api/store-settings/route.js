import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import StoreSettings from '../../../../models/StoreSettings';

// GET /api/store-settings - Mendapatkan pengaturan toko
export async function GET(_request) {
  try {
    await connectDB();
    
    const settings = await StoreSettings.getSingleton();
    
    return NextResponse.json({
      success: true,
      data: settings
    });
    
  } catch (error) {
    console.error('Error fetching store settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch store settings' },
      { status: 500 }
    );
  }
}

// PUT /api/store-settings - Update pengaturan toko
export async function PUT(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Cari settings yang ada atau buat baru
    let settings = await StoreSettings.findOne();
    
    if (!settings) {
      // Buat settings baru jika belum ada
      settings = new StoreSettings(body);
    } else {
      // Update settings yang ada
      Object.assign(settings, body);
    }
    
    await settings.save();
    
    return NextResponse.json({
      success: true,
      data: settings,
      message: 'Store settings updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating store settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update store settings' 
      },
      { status: 400 }
    );
  }
} 