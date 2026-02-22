import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Parse DATABASE_URL if provided, otherwise use individual env vars
let poolConfig: any = {
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Z', // Required for Better Auth
};

if (process.env.DATABASE_URL) {
  // Parse mysql://user:password@host:port/database
  const url = new URL(process.env.DATABASE_URL.replace('mysql://', 'http://'));
  poolConfig = {
    ...poolConfig,
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
  };
} else {
  poolConfig = {
    ...poolConfig,
    host: process.env.DB_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'social_media',
  };
}

const pool = createPool(poolConfig);

export default pool;
