#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 ProxPanel Proxmox VE Setup\n');
console.log('This script will help you configure your Proxmox VE connection.\n');

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function testProxmoxConnection(config) {
  console.log('\n🔍 Testing Proxmox connection...');
  
  try {
    const { ProxmoxAPI } = require('../lib/proxmox-api');
    const proxmox = new ProxmoxAPI(config);
    
    const authenticated = await proxmox.authenticate();
    if (!authenticated) {
      throw new Error('Authentication failed');
    }
    
    const vms = await proxmox.getVMs();
    const clusterStatus = await proxmox.getClusterStatus();
    
    console.log('✅ Connection successful!');
    console.log(`📊 Found ${vms.length} VMs`);
    console.log(`🏢 Found ${clusterStatus?.length || 0} cluster nodes`);
    
    return true;
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    return false;
  }
}

async function main() {
  try {
    // Get Proxmox configuration
    const host = await askQuestion('Proxmox host (default: localhost): ') || 'localhost';
    const port = await askQuestion('Proxmox port (default: 8006): ') || '8006';
    const username = await askQuestion('Proxmox username (default: root): ') || 'root';
    const password = await askQuestion('Proxmox password: ');
    const realm = await askQuestion('Proxmox realm (default: pam): ') || 'pam';
    
    if (!password) {
      console.log('❌ Password is required');
      process.exit(1);
    }
    
    const config = {
      host,
      port: parseInt(port),
      username,
      password,
      realm
    };
    
    // Test connection
    const success = await testProxmoxConnection(config);
    
    if (success) {
      // Update .env.local file
      const envPath = path.join(__dirname, '..', '.env.local');
      let envContent = '';
      
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }
      
      // Update or add Proxmox variables
      const lines = envContent.split('\n');
      const proxmoxVars = [
        `PROXMOX_HOST="${host}"`,
        `PROXMOX_PORT="${port}"`,
        `PROXMOX_USERNAME="${username}"`,
        `PROXMOX_PASSWORD="${password}"`,
        `PROXMOX_REALM="${realm}"`
      ];
      
      // Remove existing Proxmox variables
      const filteredLines = lines.filter(line => 
        !line.startsWith('PROXMOX_') && line.trim() !== ''
      );
      
      // Add new Proxmox variables
      const newContent = [...filteredLines, '', '# Proxmox VE API Configuration', ...proxmoxVars].join('\n');
      
      fs.writeFileSync(envPath, newContent);
      
      console.log('\n✅ Configuration saved to .env.local');
      console.log('\n🎉 Setup complete! You can now run:');
      console.log('   npm run dev');
      console.log('\n📖 For more information, see the README.md file');
    } else {
      console.log('\n❌ Setup failed. Please check your Proxmox configuration and try again.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Setup error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main(); 