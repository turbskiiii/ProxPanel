# 🚀 ProxPanel Production Deployment Checklist

## ⚠️ CRITICAL - Must Complete Before Production

### 🔐 Security Requirements
- [ ] **Change Default Passwords** - Remove all demo credentials
- [ ] **Generate Strong JWT Secret** - Minimum 64 characters, cryptographically secure
- [ ] **Configure SSL Certificates** - Valid SSL certificates for HTTPS
- [ ] **Set up Firewall Rules** - Restrict access to necessary ports only
- [ ] **Enable Rate Limiting** - Configure production rate limits
- [ ] **Audit Security Headers** - Verify all OWASP security headers

### 🗄️ Database Requirements  
- [ ] **Production Database Setup** - MySQL 8.0+ with proper configuration
- [ ] **Run Database Migrations** - Execute all schema creation scripts
- [ ] **Configure Connection Pooling** - Set appropriate pool sizes
- [ ] **Set up Database Backups** - Automated daily backups
- [ ] **Database User Permissions** - Least privilege access
- [ ] **Performance Tuning** - Optimize queries and indexes

### 🖥️ Proxmox Integration
- [ ] **Proxmox API Access** - Configure API tokens or user credentials
- [ ] **Network Connectivity** - Ensure ProxPanel can reach Proxmox servers
- [ ] **Test VM Operations** - Verify create, start, stop, delete operations
- [ ] **Resource Limits** - Configure user resource quotas
- [ ] **Template Management** - Set up OS templates and configurations

### 🌐 Infrastructure Requirements
- [ ] **Production Server** - Minimum 4GB RAM, 2 CPU cores, 50GB storage
- [ ] **Domain Configuration** - Set up DNS records for your domain
- [ ] **Load Balancer** - Configure Nginx or similar for production traffic
- [ ] **Monitoring Setup** - Application and infrastructure monitoring
- [ ] **Log Management** - Centralized logging and log rotation
- [ ] **Backup Strategy** - Complete backup and disaster recovery plan

### 📧 Email Configuration (Optional)
- [ ] **SMTP Server** - Configure email server for notifications
- [ ] **Email Templates** - Set up user notification templates
- [ ] **Email Verification** - Implement email verification for new users

## 🔧 Configuration Steps

### 1. Environment Variables
\`\`\`bash
# Required Production Variables
DB_HOST=your-mysql-server
DB_PORT=3306
DB_USER=proxpanel_user
DB_PASSWORD=secure_database_password
DB_NAME=proxpanel_production
JWT_SECRET=your_64_character_cryptographically_secure_secret
PROXMOX_HOST=your-proxmox-server.com
PROXMOX_PORT=8006
PROXMOX_USERNAME=proxpanel@pve
PROXMOX_PASSWORD=secure_proxmox_password
PROXMOX_REALM=pve

# Optional Production Variables
NODE_ENV=production
APP_URL=https://your-domain.com
LOG_LEVEL=info
SMTP_HOST=smtp.your-domain.com
SMTP_PORT=587
SMTP_USER=noreply@your-domain.com
SMTP_PASSWORD=smtp_password
\`\`\`

### 2. Database Setup
\`\`\`bash
# Create production database
mysql -u root -p -e "CREATE DATABASE proxpanel_production;"
mysql -u root -p -e "CREATE USER 'proxpanel_user'@'%' IDENTIFIED BY 'secure_password';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON proxpanel_production.* TO 'proxpanel_user'@'%';"

# Run migrations
mysql -u proxpanel_user -p proxpanel_production < database/schema.sql
\`\`\`

### 3. Proxmox API Setup
\`\`\`bash
# Create API user in Proxmox
pveum user add proxpanel@pve --password secure_password
pveum aclmod / --users proxpanel@pve --roles Administrator

# Or create API token (recommended)
pveum user token add proxpanel@pve proxpanel-token --privsep=0
\`\`\`

## 🚨 Security Hardening

### Remove Demo Data
- [ ] Delete all demo users from database
- [ ] Remove demo credentials from code
- [ ] Clear any test data

### Production Security
- [ ] Enable HTTPS only (no HTTP)
- [ ] Configure Content Security Policy
- [ ] Set up intrusion detection
- [ ] Enable audit logging
- [ ] Configure session timeouts

## 📊 Monitoring & Maintenance

### Health Monitoring
- [ ] Set up uptime monitoring
- [ ] Configure performance alerts
- [ ] Monitor database performance
- [ ] Track error rates

### Maintenance Tasks
- [ ] Schedule regular backups
- [ ] Plan security updates
- [ ] Monitor disk space
- [ ] Review audit logs

## ✅ Pre-Launch Testing

### Functionality Testing
- [ ] User registration and login
- [ ] VPS creation and management
- [ ] Admin panel operations
- [ ] Payment processing (if applicable)
- [ ] Email notifications

### Performance Testing
- [ ] Load testing with expected user count
- [ ] Database performance under load
- [ ] API response times
- [ ] Memory and CPU usage

### Security Testing
- [ ] Penetration testing
- [ ] SQL injection testing
- [ ] XSS vulnerability testing
- [ ] Authentication bypass testing

## 🎯 Go-Live Checklist

- [ ] All above items completed
- [ ] Backup strategy tested
- [ ] Monitoring alerts configured
- [ ] Support documentation ready
- [ ] Team trained on production procedures
- [ ] Rollback plan prepared

---

**⚠️ WARNING: Do not deploy to production until ALL items are completed!**
