import { setupServer } from 'msw/node'
import { rest } from 'msw'

// Mock API responses
const mockVPSData = [
  {
    id: 1,
    name: 'Test VPS 1',
    status: 'running',
    cpu: 2,
    memory: 4096,
    disk: 50,
    ip: '192.168.1.100',
    os: 'Ubuntu 22.04',
    uptime: 86400,
    cpu_usage: 25,
    memory_usage: 60,
    disk_usage: 30,
  },
  {
    id: 2,
    name: 'Test VPS 2',
    status: 'stopped',
    cpu: 4,
    memory: 8192,
    disk: 100,
    ip: '192.168.1.101',
    os: 'CentOS 8',
    uptime: 0,
    cpu_usage: 0,
    memory_usage: 0,
    disk_usage: 45,
  },
]

const mockUserData = {
  id: 1,
  email: 'admin@proxpanel.com',
  name: 'Admin User',
  role: 'admin',
  created_at: '2024-01-01T00:00:00Z',
  last_login: '2024-01-25T12:00:00Z',
}

const mockStatsData = {
  total_vps: 10,
  running_vps: 7,
  total_users: 25,
  active_users: 18,
  system_uptime: 604800,
  cpu_usage: 35,
  memory_usage: 65,
  disk_usage: 45,
}

// API handlers
export const handlers = [
  // Authentication endpoints
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        user: mockUserData,
        token: 'mock-jwt-token',
      })
    )
  }),

  rest.post('/api/auth/register', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        user: mockUserData,
        token: 'mock-jwt-token',
      })
    )
  }),

  rest.get('/api/auth/me', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        user: mockUserData,
      })
    )
  }),

  rest.post('/api/auth/logout', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Logged out successfully',
      })
    )
  }),

  // VPS endpoints
  rest.get('/api/vps', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: mockVPSData,
        pagination: {
          page: 1,
          limit: 10,
          total: mockVPSData.length,
          pages: 1,
        },
      })
    )
  }),

  rest.get('/api/vps/:id', (req, res, ctx) => {
    const { id } = req.params
    const vps = mockVPSData.find(v => v.id === Number(id))
    
    if (!vps) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          message: 'VPS not found',
        })
      )
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: vps,
      })
    )
  }),

  rest.post('/api/vps', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: {
          id: 3,
          name: 'New VPS',
          status: 'creating',
          cpu: 2,
          memory: 4096,
          disk: 50,
          ip: '192.168.1.102',
          os: 'Ubuntu 22.04',
          uptime: 0,
          cpu_usage: 0,
          memory_usage: 0,
          disk_usage: 0,
        },
      })
    )
  }),

  rest.put('/api/vps/:id/power', (req, res, ctx) => {
    const { id } = req.params
    const { action } = req.body as { action: string }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: `VPS ${id} ${action} successful`,
      })
    )
  }),

  // Admin endpoints
  rest.get('/api/admin/stats', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: mockStatsData,
      })
    )
  }),

  rest.get('/api/admin/users', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: [mockUserData],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1,
        },
      })
    )
  }),

  rest.get('/api/admin/audit', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: [
          {
            id: 1,
            user_id: 1,
            action: 'login',
            details: 'User logged in successfully',
            ip_address: '192.168.1.1',
            user_agent: 'Mozilla/5.0...',
            created_at: '2024-01-25T12:00:00Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1,
        },
      })
    )
  }),

  // Health check
  rest.get('/api/health', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      })
    )
  }),

  // Catch-all handler
  rest.all('*', (req, res, ctx) => {
    console.warn(`Unhandled ${req.method} request to ${req.url}`)
    return res(
      ctx.status(404),
      ctx.json({
        success: false,
        message: 'Endpoint not found',
      })
    )
  }),
]

export const server = setupServer(...handlers) 