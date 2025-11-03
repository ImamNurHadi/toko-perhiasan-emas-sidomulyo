import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../../lib/auth';
import connectDB from '../../../../../lib/mongodb';
import User from '../../../../../models/User';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        user: null
      });
    }

    // Get fresh user data from database
    await connectDB();
    const user = await User.findById(currentUser.userId).select('-password');

    if (!user || !user.isActive) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        user: null
      });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        userId: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error checking auth:', error);
    return NextResponse.json({
      success: false,
      authenticated: false,
      user: null
    });
  }
}

