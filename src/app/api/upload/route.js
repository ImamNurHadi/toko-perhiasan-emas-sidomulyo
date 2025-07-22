import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file uploaded'
      }, { status: 400 });
    }

    // Validasi file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: 'File type not allowed. Please upload JPEG, PNG, GIF, or WebP images.'
      }, { status: 400 });
    }

    // Validasi file size (max 2MB untuk base64 storage)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: 'File size too large. Maximum size is 2MB for database storage.'
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert to base64
    const base64String = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64String}`;

    // Generate filename for reference
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const filename = `${timestamp}_${originalName}`;

    return NextResponse.json({
      success: true,
      url: dataUrl, // Return base64 data URL instead of file path
      filename: filename,
      size: file.size,
      type: file.type,
      storage: 'base64' // Indicate storage method
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 