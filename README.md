# 🖥️ ProxPanel - VPS Management Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0-black)](https://nextjs.org/)
[![GitHub](https://img.shields.io/badge/GitHub-turbskiiii-181717?logo=github)](https://github.com/turbskiiii)

> **🚀 Live Demo:** [https://v0-react-dashboard-design-henna.vercel.app](https://v0-react-dashboard-design-henna.vercel.app)

*A modern, professional web-based dashboard for managing Proxmox VE virtual private servers. Built with Next.js, TypeScript, and Tailwind CSS.*

**Created by [Aaron (turbskiiii)](https://github.com/turbskiiii)** - Full-Stack Developer & IT Systems Specialist

---

## 🎯 **Demo Access**

### 👑 **Admin Panel Access**
- **Email:** `admin@proxpanel.com`
- **Password:** `demo123`
- **Features:** Full admin dashboard, user management, system monitoring

### 👤 **User Dashboard Access**  
- **Email:** `demo@proxpanel.com`
- **Password:** `demo123`
- **Features:** VPS management, monitoring, resource control

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

## 📸 Screenshots

<div align="center">

### 🔐 **Login Interface**
![Login Interface](https://v0-react-dashboard-design-henna.vercel.app/login)
*Professional authentication with demo credentials*

### 🏠 **User Dashboard**
*Real-time VPS monitoring with performance metrics*

### 👑 **Admin Panel**
*Comprehensive system administration and user management*

</div>

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API routes with demo data
- **Authentication**: JWT tokens with HTTP-only cookies
- **Deployment**: Vercel with Edge Runtime
- **Database**: Demo data (MySQL schema included for production)

## 🚀 Quick Start

### 🌐 **Try the Live Demo**
Visit [https://v0-react-dashboard-design-henna.vercel.app](https://v0-react-dashboard-design-henna.vercel.app) and use the demo credentials above.

### 💻 **Local Development**

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/turbskiiii/proxpanel.git
   cd proxpanel
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Start development server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Access the application**
   - Dashboard: http://localhost:3000
   - Use demo credentials from above

## 🐳 Production Deployment

### **Vercel (Recommended)**
\`\`\`bash
# Deploy to Vercel
vercel --prod
\`\`\`

### **Docker**
\`\`\`bash
# Build and run with Docker
docker build -t proxpanel .
docker run -p 3000:3000 proxpanel
\`\`\`

### **Traditional Hosting**
\`\`\`bash
# Build for production
npm run build
npm start
\`\`\`

## 📋 Environment Variables

For production deployment with real Proxmox integration:

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

## 🧪 Demo vs Production

### 🎭 **Demo Mode (Current)**
- **Authentication:** Demo credentials only
- **Data:** Mock VPS and user data
- **APIs:** Simulated responses
- **Database:** Not required
- **Perfect for:** Testing, showcasing, development

### 🏭 **Production Mode**
- **Authentication:** Real user accounts with database
- **Data:** Live Proxmox VE integration
- **APIs:** Real Proxmox API calls
- **Database:** MySQL with full schema
- **Perfect for:** Live hosting environments

## 🔧 Development

### **Available Scripts**
\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm test             # Run tests
\`\`\`

### **Project Structure**
\`\`\`
proxpanel/
├── app/                    # Next.js app directory
│   ├── api/               # API routes with demo data
│   ├── dashboard/         # User dashboard
│   ├── admin/            # Admin panel
│   └── login/            # Authentication
├── components/            # React components
├── lib/                  # Utility libraries
├── database/             # Database schema (for production)
└── public/               # Static assets
\`\`\`

## 👨‍💻 About the Developer

**Aaron (turbskiiii)** is a passionate Full-Stack Developer and IT Systems Specialist from Ohio, with expertise in:

- **🖥️ Full-Stack Development** - JavaScript, TypeScript, Python, C++
- **🔧 IT Systems** - Linux, Docker, Nginx, Server Management
- **🎨 3D Modeling** - Blender, 3D Model Artist
- **☁️ Cloud & Virtualization** - Proxmox, VPS Management, Performance Optimization

*"Whether diving into virtual worlds, solving complex problems, or creating digital art - I bring a unique blend of technical expertise and creative vision to every project."*

### 🔗 **Connect with Aaron:**
- **GitHub:** [@turbskiiii](https://github.com/turbskiiii)
- **Portfolio:** [information.turbskiiii.com](https://information.turbskiiii.com)
- **Location:** Ohio, United States

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Workflow**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with demo credentials
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Live Demo:** [Try ProxPanel](https://v0-react-dashboard-design-henna.vercel.app)
- **Issues:** [GitHub Issues](https://github.com/turbskiiii/proxpanel/issues)
- **Discussions:** [GitHub Discussions](https://github.com/turbskiiii/proxpanel/discussions)
- **Developer:** [@turbskiiii](https://github.com/turbskiiii)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Proxmox VE](https://www.proxmox.com/) - Virtualization platform

---

<div align="center">

**ProxPanel** - Professional VPS Management Made Simple 🚀

*Created with ❤️ by [Aaron (turbskiiii)](https://github.com/turbskiiii)*

[![GitHub followers](https://img.shields.io/github/followers/turbskiiii?style=social)](https://github.com/turbskiiii)
[![GitHub stars](https://img.shields.io/github/stars/turbskiiii/proxpanel?style=social)](https://github.com/turbskiiii/proxpanel)

</div>

> **Note:** This is a demo version with mock data. For production use with real Proxmox integration, see the environment variables section above.
