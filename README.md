# 🖥️ ProxPanel - VPS Management Dashboard

![ProxPanel Hero](./public/images/proxpanel-dashboard.png)

*A modern, professional web-based dashboard for managing Proxmox VE virtual private servers. Built with Next.js, TypeScript, and Tailwind CSS.*

---

## 🚀 Features

### Core VPS Management
- **Real-time Monitoring** - Live CPU, memory, disk, and network metrics
- **Power Management** - Start, stop, reboot, and reset VMs with one click
- **SSH Access** - Easy-to-copy SSH connection details with password management
- **OS Reinstallation** - Reinstall operating systems with safety confirmations
- **Resource Scaling** - Upgrade/downgrade CPU, memory, and storage

### Advanced Features
- **Automated Backups** - Scheduled snapshots with configurable retention
- **Network Management** - Firewall rules, DNS settings, and traffic monitoring
- **Security Dashboard** - DDoS protection, SSL certificates, vulnerability scanning
- **Performance Analytics** - Historical metrics and performance benchmarking
- **Multi-user Support** - Role-based access control and user management

### Technical Highlights
- **Proxmox API Integration** - Native PVE API token authentication
- **Real-time Updates** - WebSocket connections for live data
- **Responsive Design** - Mobile-friendly interface
- **Security First** - JWT authentication, rate limiting, input validation
- **Database Driven** - MySQL backend with comprehensive logging

## 📸 Screenshots

<div align="center">

### 🏠 **Dashboard Overview**
![Dashboard](./public/images/proxpanel-dashboard.png)
*Real-time VPS monitoring with performance metrics and resource usage*

### 🔐 **Login Interface**
![Login](./public/images/proxpanel-login.png)
*Clean, professional authentication interface*

### 🖥️ **VPS Management**
![VPS Management](./public/images/proxpanel-vps-detail.png)
*Comprehensive VM control panel with power management and SSH access*

### 📊 **Performance Monitoring**
![Monitoring](./public/images/proxpanel-monitoring.png)
*Advanced analytics with historical data and real-time charts*

### 🌐 **Network Configuration**
![Networking](./public/images/proxpanel-networking.png)
*Network management with firewall rules and IP configuration*

### 🔧 **SSH Connection Panel**
![SSH Panel](./public/images/proxpanel-ssh-panel.png)
*Easy SSH access with connection details and password management*

### 💿 **OS Reinstallation**
![OS Reinstall](./public/images/proxpanel-os-reinstall.png)
*Safe operating system reinstallation with confirmation dialogs*

### 📱 **Mobile Interface**
![Mobile](./public/images/proxpanel-mobile.png)
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

### 1. Clone and Install
\`\`\`bash
git clone https://github.com/your-org/proxpanel.git
cd proxpanel
npm install
\`\`\`

### 2. Environment Configuration
Copy the example environment file and configure your settings:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` with your configuration:

\`\`\`env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=proxpanel
DB_PASSWORD=your_secure_password
DB_NAME=proxpanel_db

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters

# Proxmox API (Recommended: API Token)
PROXMOX_HOST=your-proxmox-server.com
PROXMOX_PORT=8006
PROXMOX_TOKEN_ID=root@pam!proxpanel
PROXMOX_TOKEN_SECRET=your-api-token-secret
PROXMOX_VERIFY_SSL=true
\`\`\`

### 3. Database Setup
\`\`\`bash
# Run database migrations
npm run db:migrate

# Seed with sample data
npm run db:seed
\`\`\`

### 4. Development Server
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` and login with:
- **Email**: admin@proxpanel.com
- **Password**: ProxPanel2024!

## 🔧 Proxmox API Token Setup

For secure API access, create an API token in Proxmox:

### 1. Create API Token
\`\`\`bash
# In Proxmox shell
pveum user token add root@pam proxpanel --privsep=0
\`\`\`

### 2. Set Permissions
\`\`\`bash
# Grant necessary permissions
pveum acl modify / --users root@pam --roles Administrator
\`\`\`

### 3. Configure Environment
Add the token to your `.env.local`:
\`\`\`env
PROXMOX_TOKEN_ID=root@pam!proxpanel
PROXMOX_TOKEN_SECRET=your-generated-token-secret
\`\`\`

## 🐳 Docker Deployment

### Production Deployment
\`\`\`bash
# Build and start all services
docker-compose up -d

# Check service health
docker-compose ps
\`\`\`

### Services Included
- **ProxPanel App** - Main application (port 3000)
- **MySQL Database** - Data storage (port 3306)
- **Redis Cache** - Session storage (port 6379)
- **Nginx Proxy** - SSL termination and load balancing (ports 80/443)

## 🔒 Security Configuration

### SSL Certificates
Place your SSL certificates in the `ssl/` directory:
\`\`\`
ssl/
├── cert.pem
└── key.pem
\`\`\`

### Firewall Rules
Configure your firewall to allow:
- Port 80 (HTTP - redirects to HTTPS)
- Port 443 (HTTPS)
- Port 8006 (Proxmox API - internal only)

### Rate Limiting
Built-in rate limiting protects against abuse:
- API routes: 100 requests per 15 minutes
- Login attempts: 5 attempts per 15 minutes

## 📊 Monitoring & Maintenance

### Health Checks
\`\`\`bash
# Check application health
curl http://localhost:3000/api/health

# View application logs
docker-compose logs -f app
\`\`\`

### Database Maintenance
\`\`\`bash
# Backup database
docker-compose exec mysql mysqldump -u root -p proxpanel_db > backup.sql

# Restore database
docker-compose exec -i mysql mysql -u root -p proxpanel_db < backup.sql
\`\`\`

## 🔧 Default Accounts

After seeding the database, these accounts are available:

### Administrator Account
- **Email**: admin@proxpanel.com
- **Password**: ProxPanel2024!
- **Permissions**: Full system access

### Demo Account
- **Email**: demo@proxpanel.com
- **Password**: DemoUser2024!
- **Permissions**: Limited access with sample VMs

**⚠️ Important**: Change default passwords immediately in production!

## 🐛 Troubleshooting

### Common Issues

#### Proxmox Connection Failed
\`\`\`bash
# Test API connectivity
curl -k https://your-proxmox-server:8006/api2/json/version

# Verify token permissions
pveum user token list root@pam
\`\`\`

#### Database Connection Issues
\`\`\`bash
# Check MySQL status
docker-compose exec mysql mysql -u root -p -e "SELECT 1"

# View database logs
docker-compose logs mysql
\`\`\`

#### SSL Certificate Problems
\`\`\`bash
# Verify certificate validity
openssl x509 -in ssl/cert.pem -text -noout

# Check certificate chain
openssl verify -CAfile ssl/chain.pem ssl/cert.pem
\`\`\`

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
\`\`\`bash
# Fork and clone the repository
git clone https://github.com/your-username/proxpanel.git

# Create a feature branch
git checkout -b feature/amazing-feature

# Make your changes and commit
git commit -m "Add amazing feature"

# Push to your fork and create a pull request
git push origin feature/amazing-feature
\`\`\`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Security Best Practices](docs/security.md)

### Community Support
- **GitHub Issues**: Bug reports and feature requests
- **Discord**: Real-time community support
- **Email**: support@proxpanel.com

---

**ProxPanel** - Professional Proxmox VPS Management Made Simple

> ⚠️ **Disclaimer**
>
> This project is provided **as-is**, without any express or implied warranties.  
> Use is permitted under the terms of the **MIT License**, but **at your own risk**.
>
> ### 🛠️ For Production Use:
> - This software directly interfaces with **Proxmox VE** and virtual machine infrastructure.
> - Improper configuration may lead to **data loss**, **security breaches**, or **system downtime**.
> - Always test thoroughly in a **development or staging environment** before deploying in production.
> - It is **your responsibility** to ensure proper backups, access controls, and security policies.
>
> ### 🏢 For Company/Internal Use:
> - If using in an organizational or corporate context, ensure use complies with your company's **IT and security policies**.
> - This software does not come with commercial support; use in **enterprise environments is not officially supported**.
>
> ### 🔐 On Privacy & GDPR Compliance:
> - This dashboard may handle **user credentials**, **hostnames**, **IP addresses**, and potentially **PII**.
> - You are responsible for ensuring that your implementation complies with **GDPR**, **CCPA**, or any other applicable data privacy regulations.
> - This software does not collect telemetry or external analytics by default.
>
> ### 📜 Open Source License Notice:
> - Licensed under the [MIT License](LICENSE).
> - You are free to **use, modify, and distribute** this code, provided you retain the license and copyright.
> - Contributions to this project must also comply with the terms of the MIT License.
>
> By using or deploying this project, you acknowledge that the developers are **not liable** for any issues or damages that may arise.
