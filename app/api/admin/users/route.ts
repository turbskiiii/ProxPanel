import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { apiRateLimiter } from '@/lib/rate-limiter';

// In-memory mock user store for demo/dev mode
const users = [
  {
    id: '1',
    username: 'john.doe',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: { id: 'user', name: 'User' },
    status: 'active',
    vpsCount: 3,
    totalSpent: 450.75,
    lastLogin: '2 hours ago',
    createdAt: '2023-06-15',
    location: 'New York, USA',
    phone: '+1-555-0123',
  },
  {
    id: '2',
    username: 'admin',
    email: 'admin@turbskiiii.com',
    name: 'System Administrator',
    role: { id: 'admin', name: 'Admin' },
    status: 'active',
    vpsCount: 0,
    totalSpent: 0,
    lastLogin: '5 minutes ago',
    createdAt: '2023-01-01',
    location: 'Remote',
  },
];

function getUser(id: string) {
  return users.find(u => u.id === id);
}
function getUserByEmail(email: string) {
  return users.find(u => u.email === email);
}
function getRole(roleId: string) {
  return [
    { id: 'user', name: 'User' },
    { id: 'admin', name: 'Admin' },
    { id: 'moderator', name: 'Moderator' },
  ].find(r => r.id === roleId);
}
function createUser(user: any) {
  const newUser = { ...user, id: (users.length + 1).toString() };
  users.push(newUser);
  return newUser;
}
function updateUser(userId: string, updates: any) {
  const user = getUser(userId);
  if (!user) return null;
  Object.assign(user, updates);
  return user;
}
function deleteUser(userId: string) {
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return false;
  users.splice(idx, 1);
  return true;
}
function getUserAnalytics() {
  return {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    pending: users.filter(u => u.status === 'pending').length,
  };
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip || 'unknown';
    const { allowed } = await apiRateLimiter.isAllowed(identifier);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    const email = searchParams.get('email');
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    if (userId) {
      const user = getUser(userId);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ user });
    }

    if (email) {
      const user = getUserByEmail(email);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ user });
    }

    // Get all users with filters
    let filteredUsers = users;

    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role.id === role);
    }

    if (status) {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }

    return NextResponse.json({
      users: filteredUsers,
      total: filteredUsers.length,
      analytics: getUserAnalytics(),
    });
  } catch (error) {
    logger.error('Error fetching users', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip || 'unknown';
    const { allowed } = await apiRateLimiter.isAllowed(identifier);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      email,
      username,
      firstName,
      lastName,
      roleId,
      profile,
      security,
      billing,
    } = body;

    // Validation
    if (!email || !username || !firstName || !lastName || !roleId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Get role
    const role = getRole(roleId);
    if (!role) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Create user
    const user = createUser({
      email,
      username,
      firstName,
      lastName,
      status: 'pending',
      role,
      permissions: [],
      profile: {
        avatar: profile?.avatar,
        phone: profile?.phone,
        company: profile?.company,
        position: profile?.position,
        timezone: profile?.timezone || 'UTC',
        language: profile?.language || 'en',
        preferences: {
          theme: 'auto',
          notifications: {
            email: true,
            sms: false,
            push: false,
            webhook: false,
            frequency: 'immediate',
            types: {
              security: true,
              billing: true,
              system: true,
              maintenance: true,
            },
          },
          dashboard: {
            defaultView: 'overview',
            widgets: [],
            refreshInterval: 30,
          },
          api: {
            enabled: false,
            rateLimit: 1000,
            allowedIPs: [],
            webhooks: [],
          },
        },
      },
      security: {
        twoFactorEnabled: false,
        twoFactorMethod: 'totp',
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
          maxAge: 90,
          preventReuse: 5,
        },
        sessionPolicy: {
          maxSessions: 5,
          sessionTimeout: 480,
          idleTimeout: 30,
          requireReauth: false,
          allowedDevices: [],
        },
        loginHistory: [],
        securityQuestions: [],
      },
      billing: {
        plan: 'free',
        ...billing,
      },
      metadata: {},
    });

    return NextResponse.json(
      {
        user,
        message: 'User created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Error creating user', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip || 'unknown';
    const { allowed } = await apiRateLimiter.isAllowed(identifier);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { userId, updates } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const updatedUser = updateUser(userId, updates);
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: updatedUser,
      message: 'User updated successfully',
    });
  } catch (error) {
    logger.error('Error updating user', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip || 'unknown';
    const { allowed } = await apiRateLimiter.isAllowed(identifier);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const deleteSuccess = deleteUser(userId);
    if (!deleteSuccess) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting user', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
