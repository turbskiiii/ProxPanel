import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

function createPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      acquireTimeout: 60000,
      timeout: 60000,
    });
  }
  return pool;
}

export async function query(sql: string, params: any[] = []): Promise<any> {
  try {
    const pool = createPool();
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query failed:', error);
    throw new Error(`Database error: ${error.message}`);
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    await query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}
