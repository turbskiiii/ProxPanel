import mysql from "mysql2/promise"

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "vps_manager",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
})

export async function query(sql: string, params?: any[]): Promise<any[]> {
  try {
    const [rows] = await pool.execute(sql, params)
    return rows as any[]
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

export async function transaction(queries: Array<{ sql: string; params?: any[] }>) {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const results = []
    for (const { sql, params } of queries) {
      const [result] = await connection.execute(sql, params)
      results.push(result)
    }

    await connection.commit()
    return results
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await query("SELECT 1")
    return true
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}
