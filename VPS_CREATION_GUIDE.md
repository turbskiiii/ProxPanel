# 🚀 VPS Creation Guide - ProxPanel

## Complete Step-by-Step Guide to Create Your First Real VPS

### 📋 Prerequisites Checklist

Before creating your first VPS, ensure you have:

- ✅ **Proxmox Server Running** - Your Proxmox VE server is accessible
- ✅ **ProxPanel Deployed** - Application is running and connected to database
- ✅ **Environment Variables Set** - All Proxmox credentials configured
- ✅ **Templates Available** - OS templates uploaded to Proxmox storage
- ✅ **Network Configured** - Bridge network (vmbr0) set up in Proxmox
- ✅ **Storage Available** - Sufficient storage space on Proxmox nodes

### 🔧 Environment Setup

\`\`\`bash
# 1. Verify your .env file has all required variables
cat .env

# Required variables:
PROXMOX_HOST=your-proxmox-server.com
PROXMOX_PORT=8006
PROXMOX_USERNAME=root
PROXMOX_PASSWORD=your-password
PROXMOX_REALM=pam
PROXMOX_DEFAULT_NODE=pve

# Database connection
DATABASE_URL=mysql://user:password@localhost:3306/proxpanel

# JWT secret for authentication
JWT_SECRET=your-super-secret-key
\`\`\`

### 🎯 Step 1: Access VPS Creation

1. **Login to ProxPanel**
   - Navigate to your ProxPanel URL
   - Login with your credentials
   - Go to Dashboard → VPS Management

2. **Start VPS Creation**
   - Click "Create New VPS" button
   - Or navigate to `/dashboard/vps/create`

### 🖥️ Step 2: Choose Template & Name

**VPS Details:**
- **Name**: Use descriptive names like `web-server-01`, `database-prod`, `dev-environment`
- **Template**: Choose from available OS templates:
  - **Ubuntu 22.04 LTS** ⭐ (Recommended for beginners)
  - **Debian 12** ⭐ (Stable and secure)
  - **CentOS Stream 9** (Enterprise)
  - **Rocky Linux 9** (RHEL-compatible)
  - **Alpine Linux** (Lightweight)

**Naming Best Practices:**
\`\`\`bash
# Good examples:
web-server-01
database-mysql-prod
dev-nodejs-staging
mail-server-primary

# Avoid:
my server
test123
server
\`\`\`

### ⚙️ Step 3: Configure Resources

**CPU Allocation:**
- **1 Core**: Basic websites, development
- **2 Cores**: Small applications, WordPress
- **4+ Cores**: High-traffic sites, databases

**Memory (RAM):**
- **1GB**: Basic Linux server, static websites
- **2GB**: WordPress, small applications
- **4GB**: Medium applications, databases
- **8GB+**: High-performance applications

**Storage:**
- **20GB**: Basic server setup
- **40GB**: Standard web applications
- **100GB+**: Databases, file storage

**Cost Calculation:**
\`\`\`
Monthly Cost = (CPU × $5) + (RAM_GB × $8) + (Storage_GB × $0.50)

Example: 2 CPU + 4GB RAM + 40GB Storage
= (2 × $5) + (4 × $8) + (40 × $0.50)
= $10 + $32 + $20 = $62/month
\`\`\`

### 🌍 Step 4: Select Location

Choose the datacenter closest to your users:

- **New York, USA** - East Coast US, Europe
- **Los Angeles, USA** - West Coast US, Asia-Pacific
- **Frankfurt, Germany** - Europe, Middle East, Africa

**Node Health Indicators:**
- **CPU Usage**: < 70% is optimal
- **Memory Usage**: < 80% is optimal  
- **Storage Usage**: < 90% is optimal

### ✅ Step 5: Review & Create

**Final Review Checklist:**
- ✅ VPS name is descriptive and unique
- ✅ OS template matches your needs
- ✅ Resources are appropriate for workload
- ✅ Location is optimal for users
- ✅ Monthly cost fits budget

**Click "Create VPS"** - The process takes 2-5 minutes.

### 🔍 Step 6: Monitor Creation Process

**What Happens During Creation:**
1. **VM ID Assignment** - Proxmox assigns unique VM ID
2. **Resource Allocation** - CPU, RAM, disk allocated
3. **Template Deployment** - OS template cloned to new VM
4. **Network Configuration** - IP address assigned
5. **Password Generation** - Secure root password created
6. **Database Update** - VPS record stored in ProxPanel

**Creation Status:**
- ⏳ **Creating** - VM being set up
- ✅ **Stopped** - Ready to start
- 🔴 **Failed** - Check logs for errors

### 🎉 Step 7: First VPS Access

**After Creation Success:**

1. **Note Your Credentials:**
   \`\`\`
   VPS Name: web-server-01
   VM ID: 100
   Node: pve-ny-01
   IP Address: 192.168.1.100
   Root Password: [Generated Password]
   \`\`\`

2. **Start Your VPS:**
   - Click "Start VPS" button
   - Wait for status to change to "Running"

3. **SSH Access:**
   \`\`\`bash
   ssh root@192.168.1.100
   # Enter the generated password when prompted
   \`\`\`

### 🛠️ Step 8: Initial Server Setup

**Secure Your New VPS:**

\`\`\`bash
# 1. Update system packages
apt update && apt upgrade -y

# 2. Change root password
passwd

# 3. Create non-root user
adduser yourusername
usermod -aG sudo yourusername

# 4. Configure SSH key authentication
mkdir -p /home/yourusername/.ssh
# Copy your public key to authorized_keys

# 5. Configure firewall
ufw allow ssh
ufw enable

# 6. Install essential packages
apt install -y curl wget git htop nano
\`\`\`

### 🔧 Troubleshooting Common Issues

**VPS Creation Failed:**
\`\`\`bash
# Check Proxmox connection
curl -k https://your-proxmox-server:8006/api2/json/version

# Verify credentials
# Check ProxPanel logs
docker logs proxpanel-app

# Common fixes:
1. Verify Proxmox credentials in .env
2. Check network connectivity to Proxmox
3. Ensure sufficient resources on target node
4. Verify OS template exists in storage
\`\`\`

**VPS Won't Start:**
\`\`\`bash
# Check VM status in Proxmox
qm status 100

# Check VM configuration
qm config 100

# Common fixes:
1. Verify storage is accessible
2. Check if VM has valid configuration
3. Ensure node has sufficient resources
4. Check Proxmox logs: /var/log/pve/
\`\`\`

**Can't Connect via SSH:**
\`\`\`bash
# Check if VPS is running
ping 192.168.1.100

# Check SSH service
nmap -p 22 192.168.1.100

# Common fixes:
1. Verify VPS is running
2. Check firewall rules
3. Verify SSH service is enabled
4. Check network configuration
\`\`\`

### 📊 Monitoring Your VPS

**ProxPanel Dashboard:**
- Real-time CPU, memory, disk usage
- Network traffic monitoring
- Uptime tracking
- Performance metrics

**Command Line Monitoring:**
\`\`\`bash
# System resources
htop
df -h
free -h

# Network usage
iftop
nethogs

# System logs
journalctl -f
tail -f /var/log/syslog
\`\`\`

### 🎯 Next Steps

After creating your first VPS:

1. **Install Web Server** (nginx, Apache)
2. **Set Up Database** (MySQL, PostgreSQL)
3. **Configure Domain** (DNS, SSL certificates)
4. **Set Up Backups** (automated snapshots)
5. **Monitor Performance** (alerts, logging)

### 📞 Support

If you encounter issues:

1. **Check Documentation** - Review this guide
2. **Check Logs** - ProxPanel and Proxmox logs
3. **Community Support** - GitHub issues
4. **Professional Support** - Contact your hosting provider

---

**🎉 Congratulations! You've successfully created your first VPS with ProxPanel!**

Your VPS is now ready for deployment of applications, websites, or any other services you need.
