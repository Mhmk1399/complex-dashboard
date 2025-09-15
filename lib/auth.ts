import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export function generateToken(payload: Record<string, unknown>) {
  const tokenSecret = process.env.JWT_SECRET;
  if (!tokenSecret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign(payload, tokenSecret, { expiresIn: '1h' });
}

export function getAuthUser(request: NextRequest): AuthUser | null {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const tokenSecret = process.env.JWT_SECRET;
    
    if (!tokenSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = jwt.verify(token, tokenSecret) as AuthUser;
    return decoded;
  } catch {
    return null;
  }
}