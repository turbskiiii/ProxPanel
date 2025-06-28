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

    // Check for demo credentials first
    const demoCredentials = [
      { email: 'admin@proxpanel.com', password: 'demo123', role: 'admin' },
      { email: 'demo@proxpanel.com', password: 'demo123', role: 'user' },
      { email: 'admin@example.com', password: 'admin', role: 'admin' },
      { email: 'user@example.com', password: 'password', role: 'user' },
    ];

    const demoUser = demoCredentials.find(
      cred => cred.email === email && cred.password === password
    );

    if (demoUser) {
      // Generate demo JWT
      const token = generateJWT({
        id: demoUser.role === 'admin' ? 1 : 2,
        email: demoUser.email,
        name: demoUser.role === 'admin' ? 'Admin User' : 'Demo User',
        is_admin: demoUser.role === 'admin' ? 1 : 0,
      });

      const response = NextResponse.json({
        success: true,
        user: {
          email: demoUser.email,
          name: demoUser.role === 'admin' ? 'Admin User' : 'Demo User',
          role: demoUser.role,
        },
        redirectUrl: demoUser.role === 'admin' ? '/admin' : '/dashboard',
      });

      // Set HTTP-only cookie
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60, // 24 hours
      });

      return response;
    }

    // Check database for real users
    try {
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
    } catch (dbError) {
      console.error('Database error during login:', dbError);
      // Fall back to demo mode if database is not available
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
