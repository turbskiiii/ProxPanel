import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { NextRequest } from 'next/server';
import { query } from './db';

export interface User {
  userId: number;
  email: string;
  name: string;
  isAdmin: boolean;
}

export async function verifyAuth(request: NextRequest): Promise<User | null> {
  try {
    // Get token from cookie or Authorization header
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return null;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Get user from database to ensure they still exist and are active
    const users = await query(
      'SELECT id, email, name, is_admin FROM users WHERE id = ? AND status = "active"',
      [decoded.userId]
    );

    if (users.length === 0) {
      return null;
    }

    const user = users[0];
    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.is_admin === 1,
    };
  } catch (error) {
    console.error('Auth verification failed:', error);
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateJWT(user: any): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.is_admin,
    },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );
}
