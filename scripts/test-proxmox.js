#!/usr/bin/env node

const { ProxmoxAPI } = require('../lib/proxmox-api');

async function testProxmoxIntegration() {
  console.log('🔍 Testing Proxmox VE Integration\n');

  // Load environment variables
  require('dotenv').config({ path: '.env.local' });

  const config = {
    host: process.env.PROXMOX_HOST || 'localhost',
    port: parseInt(process.env.PROXMOX_PORT || '8006'),
    username: process.env.PROXMOX_USERNAME || 'root',
    password: process.env.PROXMOX_PASSWORD || 'demo123',
    realm: process.env.PROXMOX_REALM || 'pam',
  };

  console.log('📋 Configuration:');
  console.log(`   Host: ${config.host}:${config.port}`);
  console.log(`   Username: ${config.username}@${config.realm}`);
  console.log(`   Password: ${config.password ? '***' : 'NOT SET'}\n`);

  if (!process.env.PROXMOX_PASSWORD) {
    console.log('❌ PROXMOX_PASSWORD not set in .env.local');
    console.log('   Run: npm run setup-proxmox');
    process.exit(1);
  }

  try {
    const proxmox = new ProxmoxAPI(config);

    // Test authentication
    console.log('🔐 Testing authentication...');
    const authenticated = await proxmox.authenticate();
    if (!authenticated) {
      throw new Error('Authentication failed');
    }
    console.log('✅ Authentication successful\n');

    // Test cluster status
    console.log('🏢 Testing cluster status...');
    const clusterStatus = await proxmox.getClusterStatus();
    if (clusterStatus) {
      const nodes = clusterStatus.filter((item) => item.type === 'node');
      console.log(`✅ Found ${nodes.length} cluster nodes`);
      nodes.forEach((node) => {
        console.log(`   - ${node.name}: ${node.online ? '🟢 Online' : '🔴 Offline'}`);
      });
    } else {
      console.log('⚠️  No cluster status available (single node setup)');
    }
    console.log('');

    // Test VM listing
    console.log('🖥️  Testing VM listing...');
    const vms = await proxmox.getVMs();
    console.log(`✅ Found ${vms.length} VMs`);
    vms.forEach((vm) => {
      console.log(`   - VM ${vm.vmid}: ${vm.name} (${vm.status}) on ${vm.node}`);
    });
    console.log('');

    // Test node stats (if VMs exist)
    if (vms.length > 0) {
      const firstVM = vms[0];
      console.log(`📊 Testing node stats for ${firstVM.node}...`);
      const nodeStats = await proxmox.getNodeStats(firstVM.node);
      if (nodeStats) {
        console.log('✅ Node stats retrieved successfully');
        console.log(`   CPU: ${nodeStats.cpuinfo?.model || 'Unknown'}`);
        console.log(`   Memory: ${Math.round((nodeStats.memory?.total || 0) / 1024 / 1024 / 1024)} GB`);
        console.log(`   Uptime: ${Math.floor((nodeStats.uptime || 0) / 3600)} hours`);
      } else {
        console.log('⚠️  Node stats not available');
      }
      console.log('');

      // Test VM details
      console.log(`🔍 Testing VM details for VM ${firstVM.vmid}...`);
      const vmDetails = await proxmox.getVMDetails(firstVM.node, firstVM.vmid);
      if (vmDetails) {
        console.log('✅ VM details retrieved successfully');
        console.log(`   Status: ${vmDetails.status}`);
        console.log(`   CPU: ${vmDetails.cpu || 0}%`);
        console.log(`   Memory: ${Math.round((vmDetails.mem || 0) / 1024 / 1024)} MB`);
        console.log(`   Uptime: ${vmDetails.uptime || 0} seconds`);
      } else {
        console.log('⚠️  VM details not available');
      }
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('✅ Proxmox integration is working correctly');
    console.log('\n📖 Next steps:');
    console.log('   1. Start the development server: npm run dev');
    console.log('   2. Access the dashboard: http://localhost:3000');
    console.log('   3. Your real Proxmox VMs will be displayed');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check your Proxmox server is running');
    console.log('   2. Verify network connectivity');
    console.log('   3. Check credentials in .env.local');
    console.log('   4. Ensure API access is enabled');
    console.log('   5. Run: npm run setup-proxmox');
    process.exit(1);
  }
}

testProxmoxIntegration(); 