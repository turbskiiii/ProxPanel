const mysql = require("mysql2/promise")
const bcrypt = require("bcryptjs")
require("dotenv").config()

async function seedDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number.parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "vps_manager",
  })

  try {
    console.log("🌱 Seeding database...")

    // Create admin user
    const adminEmail = "admin@devloo.com"
    const adminPassword = "DevlooAdmin2024!"
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    const [existingAdmin] = await connection.execute("SELECT id FROM users WHERE email = ?", [adminEmail])

    if (existingAdmin.length === 0) {
      await connection.execute("INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)", [
        adminEmail,
        hashedPassword,
        "Devloo Admin",
      ])
      console.log("✅ Created admin user:", adminEmail)
      console.log("🔑 Admin password:", adminPassword)
    } else {
      console.log("ℹ️ Admin user already exists")
    }

    // Create demo user
    const demoEmail = "demo@devloo.com"
    const demoPassword = "DemoUser2024!"
    const hashedDemoPassword = await bcrypt.hash(demoPassword, 12)

    const [existingDemo] = await connection.execute("SELECT id FROM users WHERE email = ?", [demoEmail])

    if (existingDemo.length === 0) {
      const [result] = await connection.execute("INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)", [
        demoEmail,
        hashedDemoPassword,
        "Demo User",
      ])

      const demoUserId = result.insertId

      // Create sample VPS instances for demo user
      const sampleVPS = [
        {
          id: "vm-100",
          name: "Production Web Server",
          vmid: 100,
          node: "devloo-ny-01",
          status: "running",
          ip_address: "192.168.1.100",
          ipv6_address: "2001:db8::100",
          cpu_cores: 4,
          memory_gb: 8,
          disk_gb: 100,
          os: "Ubuntu 22.04 LTS",
          ssh_port: 22,
          root_password: "DevlooSecure2024!",
        },
        {
          id: "vm-101",
          name: "Database Server",
          vmid: 101,
          node: "devloo-fra-01",
          status: "running",
          ip_address: "192.168.1.101",
          ipv6_address: "2001:db8::101",
          cpu_cores: 8,
          memory_gb: 16,
          disk_gb: 200,
          os: "CentOS Stream 9",
          ssh_port: 22,
          root_password: "DevlooSecure2024!",
        },
        {
          id: "vm-102",
          name: "Development Environment",
          vmid: 102,
          node: "devloo-lon-01",
          status: "stopped",
          ip_address: "192.168.1.102",
          cpu_cores: 2,
          memory_gb: 4,
          disk_gb: 50,
          os: "Debian 12",
          ssh_port: 22,
          root_password: "DevlooSecure2024!",
        },
      ]

      for (const vps of sampleVPS) {
        await connection.execute(
          `
          INSERT INTO vps_instances (
            id, user_id, name, vmid, node, status, ip_address, ipv6_address,
            cpu_cores, memory_gb, disk_gb, os, ssh_port, root_password
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            vps.id,
            demoUserId,
            vps.name,
            vps.vmid,
            vps.node,
            vps.status,
            vps.ip_address,
            vps.ipv6_address,
            vps.cpu_cores,
            vps.memory_gb,
            vps.disk_gb,
            vps.os,
            vps.ssh_port,
            vps.root_password,
          ],
        )

        // Add sample metrics for running VPS
        if (vps.status === "running") {
          for (let i = 0; i < 24; i++) {
            const timestamp = new Date(Date.now() - i * 60 * 60 * 1000)
            await connection.execute(
              `
              INSERT INTO vps_metrics (
                vps_id, cpu_usage, memory_used_gb, disk_used_gb,
                network_in_mb, network_out_mb, recorded_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
              [
                vps.id,
                Math.random() * 80 + 10, // CPU usage 10-90%
                Math.random() * (vps.memory_gb * 0.8) + vps.memory_gb * 0.1, // Memory usage
                Math.random() * (vps.disk_gb * 0.5) + vps.disk_gb * 0.1, // Disk usage
                Math.random() * 200 + 50, // Network in
                Math.random() * 150 + 30, // Network out
                timestamp,
              ],
            )
          }
        }
      }

      console.log("✅ Created demo user:", demoEmail)
      console.log("🔑 Demo password:", demoPassword)
      console.log("✅ Created sample VPS instances")
    } else {
      console.log("ℹ️ Demo user already exists")
    }

    console.log("🎉 Database seeding completed!")
  } catch (error) {
    console.error("❌ Seeding failed:", error)
    process.exit(1)
  } finally {
    await connection.end()
  }
}

seedDatabase()
