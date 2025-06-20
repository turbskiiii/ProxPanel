const mysql = require("mysql2/promise")
require("dotenv").config()

async function runMigrations() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number.parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "vps_manager",
  })

  try {
    console.log("🔄 Running database migrations...")

    // Create migrations table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Migration 1: Add IPv6 support
    const migration1 = "add_ipv6_support"
    const [existing1] = await connection.execute("SELECT id FROM migrations WHERE name = ?", [migration1])

    if (existing1.length === 0) {
      await connection.execute(`
        ALTER TABLE vps_instances 
        ADD COLUMN ipv6_address VARCHAR(45) AFTER ip_address
      `)

      await connection.execute("INSERT INTO migrations (name) VALUES (?)", [migration1])
      console.log("✅ Migration 1: Added IPv6 support")
    }

    // Migration 2: Add backup settings
    const migration2 = "add_backup_settings"
    const [existing2] = await connection.execute("SELECT id FROM migrations WHERE name = ?", [migration2])

    if (existing2.length === 0) {
      await connection.execute(`
        ALTER TABLE vps_instances 
        ADD COLUMN backup_enabled BOOLEAN DEFAULT TRUE,
        ADD COLUMN backup_schedule VARCHAR(50) DEFAULT 'daily',
        ADD COLUMN backup_retention INT DEFAULT 30
      `)

      await connection.execute("INSERT INTO migrations (name) VALUES (?)", [migration2])
      console.log("✅ Migration 2: Added backup settings")
    }

    // Migration 3: Add monitoring settings
    const migration3 = "add_monitoring_settings"
    const [existing3] = await connection.execute("SELECT id FROM migrations WHERE name = ?", [migration3])

    if (existing3.length === 0) {
      await connection.execute(`
        ALTER TABLE vps_instances 
        ADD COLUMN monitoring_enabled BOOLEAN DEFAULT TRUE,
        ADD COLUMN alert_email VARCHAR(255),
        ADD COLUMN alert_threshold_cpu INT DEFAULT 80,
        ADD COLUMN alert_threshold_memory INT DEFAULT 85,
        ADD COLUMN alert_threshold_disk INT DEFAULT 90
      `)

      await connection.execute("INSERT INTO migrations (name) VALUES (?)", [migration3])
      console.log("✅ Migration 3: Added monitoring settings")
    }

    console.log("🎉 All migrations completed successfully!")
  } catch (error) {
    console.error("❌ Migration failed:", error)
    process.exit(1)
  } finally {
    await connection.end()
  }
}

runMigrations()
