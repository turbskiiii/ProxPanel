import { type NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, generateJWT } from '@/lib/auth';
import { validateUserRegistration } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = validateUserRegistration(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;

    // Check if user already exists
    const existingUsers = await query('SELECT id FROM users WHERE email = ?', [
      email,
    ]);
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await query(
      "INSERT INTO users (name, email, password_hash, status, created_at) VALUES (?, ?, ?, 'active', NOW())",
      [name, email, passwordHash]
    );

    const userId = (result as any).insertId;

    // Log registration
    await query(
      'INSERT INTO audit_logs (user_id, action, category, details, created_at) VALUES (?, ?, ?, ?, NOW())',
      [userId, 'register', 'auth', 'User registered successfully']
    );

    // Generate JWT
    const token = generateJWT({
      id: userId,
      email,
      name,
      is_admin: 0,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        email,
        name,
        role: 'user',
      },
      redirectUrl: '/dashboard',
    });

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
