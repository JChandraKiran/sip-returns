import mysql from "mysql2/promise";

let pool;

export const getPool = () => {
  if (!pool) {
    try {
      pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
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
