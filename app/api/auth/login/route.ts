import { type NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword, generateJWT } from '@/lib/auth';
import { validateLogin } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = validateLogin(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Only check database for real users
    const users = await query(
      'SELECT id, email, password_hash, name, is_admin FROM users WHERE email = ? AND status = "active"',
      [email]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await verifyPassword(
      password,
      user.password_hash
    );
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = generateJWT(user);

    // Log successful login
    await query(
      'INSERT INTO audit_logs (user_id, action, category, details, created_at) VALUES (?, ?, ?, ?, NOW())',
      [user.id, 'login', 'auth', 'User logged in successfully']
    );

    const response = NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        role: user.is_admin ? 'admin' : 'user',
      },
      redirectUrl: user.is_admin ? '/admin' : '/dashboard',
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
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
