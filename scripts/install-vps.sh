#!/bin/bash

# ProxPanel VPS Installation Script
# Run this script on your VPS to install ProxPanel

set -e

echo "🚀 Starting ProxPanel VPS Installation..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install dependencies
echo "🔧 Installing dependencies..."
sudo apt install -y curl wget git unzip software-properties-common

# Install Node.js 18.x
echo "📦 Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
echo "🗄️ Installing MySQL..."
sudo apt install -y mysql-server

# Install Nginx
echo "🌐 Installing Nginx..."
sudo apt install -y nginx

# Install PM2
echo "⚡ Installing PM2..."
sudo npm install -g pm2

# Install Certbot
echo "🔒 Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Create app directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/proxpanel
sudo chown $USER:$USER /opt/proxpanel

# Clone repository
echo "📥 Cloning ProxPanel..."
cd /opt/proxpanel
git clone https://github.com/turbskiiii/proxpanel.git .
git checkout main

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Build application
echo "🔨 Building application..."
npm run build

# Create environment file
echo "⚙️ Creating environment configuration..."
cat > .env.local << 'EOF'
# Database Configuration
DATABASE_URL="mysql://proxpanel:$(openssl rand -base64 32)@localhost:3306/proxpanel"

# JWT Configuration
JWT_SECRET="$(openssl rand -base64 64)"
JWT_EXPIRES_IN="7d"

# Next.js Configuration
NEXTAUTH_SECRET="$(openssl rand -base64 64)"
NEXTAUTH_URL="https://your-domain.com"

# Application Configuration
NODE_ENV=production
APP_URL="https://your-domain.com"

# Proxmox VE API Configuration
PROXMOX_HOST="your-proxmox-server.com"
PROXMOX_PORT="8006"
PROXMOX_USERNAME="proxpanel"
PROXMOX_PASSWORD="your-proxmox-password"
PROXMOX_REALM="pam"

# Security Configuration
BCRYPT_ROUNDS="12"
RATE_LIMIT_WINDOW="15m"
RATE_LIMIT_MAX_REQUESTS="100"

# Monitoring Configuration
MONITORING_ENABLED="true"
BACKUP_ENABLED="true"
DNS_ENABLED="true"
EOF

# Setup MySQL
echo "🗄️ Setting up MySQL database..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS proxpanel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'proxpanel'@'localhost' IDENTIFIED BY '$(openssl rand -base64 32)';"
sudo mysql -e "GRANT ALL PRIVILEGES ON proxpanel.* TO 'proxpanel'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Create log directory
sudo mkdir -p /var/log/proxpanel
sudo chown $USER:$USER /var/log/proxpanel

# Create PM2 config
echo "⚡ Creating PM2 configuration..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'proxpanel',
    script: 'npm',
    args: 'start',
    cwd: '/opt/proxpanel',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/proxpanel/err.log',
    out_file: '/var/log/proxpanel/out.log',
    log_file: '/var/log/proxpanel/combined.log',
    time: true,
    max_memory_restart: '1G'
  }]
}
EOF

# Start application
echo "🚀 Starting ProxPanel..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Configure Nginx
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/proxpanel << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/proxpanel /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo "✅ ProxPanel VPS installation completed!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env.local with your actual domain and Proxmox details"
echo "2. Configure SSL: sudo certbot --nginx -d your-domain.com"
echo "3. Access your app at: https://your-domain.com"
echo "4. Default admin: admin@proxpanel.com / ProxPanelAdmin2024!"
echo ""
echo "🔧 Useful commands:"
echo "- Check status: pm2 status"
echo "- View logs: pm2 logs proxpanel"
echo "- Restart app: pm2 restart proxpanel"
echo "- Update app: git pull && npm install && npm run build && pm2 restart proxpanel" 