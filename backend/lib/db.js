import pkg from 'pg';
const { Pool } = pkg;

let pool;

export const getPool = () => {
  if (!pool) {
    try {
      pool = new Pool({
        host: process.env.PG_HOST || process.env.DB_HOST,
        user: process.env.PG_USER || process.env.DB_USER,
        password: process.env.PG_PASS || process.env.DB_PASS,
        database: process.env.PG_NAME || process.env.DB_NAME,
        port: process.env.PG_PORT || 5432,
        max: 10, // connection pool size
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
    } catch (error) {
      console.error("Failed to create database pool:", error);
      throw error;
    }
  }
  return pool;
};

export const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log("Database pool closed");
  }
};
