# ProxPanel

**ProxPanel** is a modern, production-ready VPS management dashboard for Proxmox VE. Built with Next.js, TypeScript, and Tailwind CSS, it provides a secure, multi-tenant, and internationalized platform for managing virtual servers, users, billing, and more.

---

## 🚀 Features
- Real Proxmox VE API integration (no demo data)
- Secure JWT authentication (no localStorage)
- Multi-tenant user and admin dashboards
- Real-time monitoring and metrics
- User, server, and billing management
- Multi-language support (i18n with next-intl)
- Responsive, modern UI (Tailwind CSS)
- Docker & Nginx production ready

---

## 🛠️ Tech Stack
- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes, Proxmox API, MySQL/MariaDB
- **Auth:** JWT (httpOnly cookies), bcrypt
- **i18n:** next-intl, JSON translation files
- **Deployment:** Docker, Nginx, systemd

---

## ⚡ Installation & Setup

1. **Clone the repo:**
   ```sh
   git clone https://github.com/turbskiiii/proxpanel.git
   cd proxpanel
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Configure environment:**
   - Copy `.env.example` to `.env.local` and fill in your Proxmox, database, and JWT secrets.
4. **Database setup:**
   - Import `database/schema.sql` into your MySQL/MariaDB instance.
   - (Optional) Seed with `database/seed.sql` for test data.
5. **Run locally:**
   ```sh
   npm run dev
   # Visit http://localhost:3000
   ```

---

## ⚙️ Configuration
- **Proxmox API:** Set `PROXMOX_HOST`, `PROXMOX_USER`, `PROXMOX_PASS`, `PROXMOX_REALM` in `.env.local`.
- **Database:** Set `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
- **JWT:** Set `JWT_SECRET` for authentication.
- **i18n:** Default and supported languages in `i18n/request.ts` and `messages/`.

---

## 🖥️ Usage
- **Admin Dashboard:** `/admin` — manage users, servers, billing, audit logs
- **User Dashboard:** `/dashboard` — manage your VPS, monitor stats, billing
- **Login/Signup:** `/login`, `/signup`
- **Language Switcher:** Top right of every page

---

# 📝 Release Notes

- **v1.0.0**
  - Initial production release
  - Real Proxmox integration, no demo data
  - Secure JWT authentication
  - Multi-language support
  - Docker & Nginx deployment

---

# 🔒 Security
- All passwords hashed with bcrypt
- JWT tokens stored in httpOnly cookies
- Rate limiting on sensitive API routes
- CORS and CSRF protection
- Audit logs for all admin/user actions
- Security best practices in deployment (see `nginx.conf`)

---

# 🚀 Quick VPS Setup
1. **Provision a VPS with Ubuntu 22.04+**
2. **Install Docker & Docker Compose:**
   ```sh
   apt update && apt install -y docker.io docker-compose
   ```
3. **Clone and configure ProxPanel:**
   ```sh
   git clone https://github.com/turbskiiii/proxpanel.git
   cd proxpanel
   cp env.example .env.local
   # Edit .env.local with your secrets
   ```
4. **Start with Docker Compose:**
   ```sh
   docker-compose -f docker-compose.prod.yml up -d
   ```
5. **Configure Nginx (optional, for SSL/proxy):**
   - Use `nginx.conf` as a template
6. **Access the dashboard:**
   - Visit `http://your-vps-ip` in your browser

---

For more details, see the codebase and comments. If you have questions or need help, open an issue or contact the maintainer. 
