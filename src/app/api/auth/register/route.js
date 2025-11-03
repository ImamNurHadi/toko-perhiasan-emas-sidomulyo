import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import User from '../../../../../models/User';

export async function POST(request) {
  try {
    await connectDB();
    const { username, password, fullName, email } = await request.json();

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username dan password harus diisi' },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Username minimal 3 karakter' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Username sudah digunakan' },
        { status: 400 }
      );
    }

    // Create new user
    const user = await User.create({
      username,
      password,
      fullName,
      email,
      role: 'user' // Default role is user
    });

    return NextResponse.json({
      success: true,
      message: 'Registrasi berhasil! Silakan login.',
      data: {
        userId: user._id,
        username: user.username,
        role: user.role
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error during registration:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal melakukan registrasi' },
      { status: 500 }
    );
  }
}

