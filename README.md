# 🖥️ ProxPanel - VPS Management Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0-black)](https://nextjs.org/)

*A modern, professional web-based dashboard for managing Proxmox VE virtual private servers. Built with Next.js, TypeScript, and Tailwind CSS.*

---

## 🚀 Features

### 🎛️ **VPS Management**
- **Complete Lifecycle Management** - Create, start, stop, restart, and delete VPS instances
- **Real-time Monitoring** - Live CPU, memory, disk, and network metrics
- **Resource Management** - Flexible resource allocation and scaling
- **Multiple OS Support** - Ubuntu, Debian, CentOS, Alpine, and custom templates
- **SSH Access Management** - Secure shell access with custom port configuration

### 👥 **User Management**
- **Multi-tenant Architecture** - Isolated user environments
- **Role-based Access Control** - Admin, moderator, and user roles
- **User Dashboard** - Personalized control panel for each user
- **Account Management** - Registration, authentication, and profile management

### 🔧 **Admin Panel**
- **System Overview** - Comprehensive dashboard with key metrics
- **User Administration** - Complete user lifecycle management
- **Audit Logging** - Detailed activity tracking and compliance
- **Server Monitoring** - Real-time server health and performance
- **Security Center** - Security alerts and threat monitoring

### 🔒 **Security & Compliance**
- **JWT Authentication** - Secure token-based authentication
- **Rate Limiting** - Protection against abuse and DDoS
- **Input Validation** - Comprehensive data validation with Zod
- **Audit Trail** - Complete activity logging for compliance
- **Security Headers** - OWASP-compliant security headers

### 📊 **Monitoring & Analytics**
- **Real-time Metrics** - Live performance monitoring
- **Historical Data** - Trend analysis and capacity planning
- **Alert System** - Proactive monitoring and notifications
- **Health Checks** - Automated system health monitoring

## 📸 Screenshots

<div align="center">

### 🏠 **Dashboard Overview**
![Dashboard Overview](./public/images/proxpanel-dashboard.png)
*Real-time VPS monitoring with performance metrics and resource usage*

### 🔐 **Login Interface**
![Login Interface](./public/images/proxpanel-login.png)
*Clean, professional authentication interface*

### 🖥️ **VPS Management**
![VPS Management](./public/images/proxpanel-vps-detail.png)
*Comprehensive VM control panel with power management and SSH access*

### 📊 **Performance Monitoring**
![Performance Monitoring](./public/images/proxpanel-monitoring.png)
*Advanced analytics with historical data and real-time charts*

### 🌐 **Network Configuration**
![Network Configuration](./public/images/proxpanel-networking.png)
*Network management with firewall rules and IP configuration*

### 🔧 **SSH Connection Panel**
![SSH Connection Panel](./public/images/proxpanel-ssh-panel.png)
*Easy SSH access with connection details and password management*

### 💿 **OS Reinstallation**
![OS Reinstallation](./public/images/proxpanel-os-reinstall.png)
*Safe operating system reinstallation with confirmation dialogs*

### 📱 **Mobile Interface**
![Mobile Interface](./public/images/proxpanel-mobile.png)
*Fully responsive design optimized for mobile devices*

</div>

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API routes, MySQL database
- **Authentication**: JWT tokens with HTTP-only cookies
- **Proxmox Integration**: Native PVE API with token authentication
- **Deployment**: Docker, Docker Compose, Nginx reverse proxy

## 📋 Prerequisites

- Node.js 18+ and npm
- MySQL 8.0+
- Proxmox VE 7.0+ with API access
- Docker and Docker Compose (for deployment)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher
- **MySQL** 8.0 or higher
- **Proxmox VE** 7.0 or higher
- **Docker** (optional, for containerized deployment)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/your-org/proxpanel.git
   cd proxpanel
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp env.example .env
   # Edit .env with your configuration
   \`\`\`

4. **Initialize the database**
   \`\`\`bash
   # Create database and tables
   mysql -u root -p < database/schema.sql
   
   # Load sample data (optional)
   mysql -u root -p < database/seed.sql
   \`\`\`

5. **Validate environment**
   \`\`\`bash
   npm run validate-env
   \`\`\`

6. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

7. **Access the application**
   - Dashboard: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin

## 🐳 Docker Deployment

### Development
\`\`\`bash
docker-compose up -d
\`\`\`

### Production
\`\`\`bash
# Set environment variables
export DB_USER=your_db_user
export DB_PASSWORD=your_db_password
export JWT_SECRET=your_jwt_secret
# ... other variables

# Deploy
npm run deploy:prod
\`\`\`

## 📋 Environment Variables

### Required Variables
\`\`\`bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=proxpanel

# JWT Secret (minimum 32 characters)
JWT_SECRET=your_super_secret_jwt_key_here

# Proxmox Configuration
PROXMOX_HOST=your-proxmox-server.com
PROXMOX_PORT=8006
PROXMOX_USERNAME=root
PROXMOX_PASSWORD=your_proxmox_password
PROXMOX_REALM=pam
\`\`\`

### Optional Variables
\`\`\`bash
# Application
NODE_ENV=production
APP_URL=https://your-domain.com
LOG_LEVEL=info

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_email_password
\`\`\`

## 🧪 Testing

\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
\`\`\`

## 🔧 Development

### Code Quality
\`\`\`bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check

# Format code
npm run format
\`\`\`

### Database Operations
\`\`\`bash
# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Backup database
npm run db:backup
\`\`\`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### VPS Management Endpoints
- `GET /api/vps` - List user VPS instances
- `POST /api/vps` - Create new VPS
- `GET /api/vps/[id]` - Get VPS details
- `PUT /api/vps/[id]` - Update VPS
- `DELETE /api/vps/[id]` - Delete VPS
- `POST /api/vps/[id]/power` - Power management
- `POST /api/vps/[id]/password` - Reset root password

### Admin Endpoints
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/users` - User management
- `GET /api/admin/audit` - Audit logs

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes, Node.js
- **Database**: MySQL 8.0
- **Authentication**: JWT with HTTP-only cookies
- **Validation**: Zod schema validation
- **Testing**: Jest, React Testing Library

### Project Structure
\`\`\`
proxpanel/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # User dashboard
│   ├── admin/            # Admin panel
│   └── (auth)/           # Authentication pages
├── components/            # React components
├── lib/                  # Utility libraries
├── database/             # Database schema and migrations
├── scripts/              # Deployment and utility scripts
├── __tests__/            # Test files
└── public/               # Static assets
\`\`\`

## 🔒 Security

### Security Features
- **Input Validation** - All inputs validated with Zod schemas
- **Rate Limiting** - API endpoint protection
- **SQL Injection Prevention** - Parameterized queries
- **XSS Protection** - Content Security Policy headers
- **CSRF Protection** - SameSite cookie configuration
- **Secure Headers** - OWASP-compliant security headers

### Security Best Practices
- Regular security audits with `npm audit`
- Environment variable validation
- Comprehensive logging and monitoring
- Secure password hashing with bcrypt
- JWT token expiration and rotation

## 📈 Performance

### Optimization Features
- **Server-Side Rendering** - Fast initial page loads
- **Static Generation** - Optimized static pages
- **Image Optimization** - Next.js image optimization
- **Code Splitting** - Automatic code splitting
- **Caching** - Intelligent caching strategies

### Monitoring
- Health check endpoints
- Performance metrics collection
- Error tracking and logging
- Resource usage monitoring

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [GitHub Wiki](https://github.com/your-org/proxpanel/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-org/proxpanel/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/proxpanel/discussions)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Proxmox VE](https://www.proxmox.com/) - Virtualization platform

---

**ProxPanel** - Professional VPS Management Made Simple 🚀
