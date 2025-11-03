import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'sidomulyo-secret-key-2024-very-secure';

// Generate JWT token
export function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' } // Token berlaku 7 hari
  );
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Get current user from cookies (server-side)
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token');
    
    if (!token) return null;
    
    const decoded = verifyToken(token.value);
    return decoded;
  } catch (error) {
    return null;
  }
}

// Check if user is admin
export async function isAdmin() {
  const user = await getCurrentUser();
  return user && user.role === 'admin';
}

// Middleware to protect admin routes
export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error('Unauthorized: Admin access required');
  }
  return true;
}

