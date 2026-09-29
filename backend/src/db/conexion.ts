import 'dotenv/config';
import mysql, { type PoolOptions } from 'mysql2/promise';

const poolConfig: PoolOptions = {
  host: process.env.DATABASE_HOST || 'localhost',
  user: process.env.DATABASE_USER || 'administrador',
  password: process.env.DATABASE_PASSWORD || 'admin123456',
  database: process.env.DATABASE_NAME || 'solar_eye',
  port: Number(process.env.DATABASE_PORT) || 3306,
  multipleStatements: false
};

if (process.env.DATABASE_SSL === 'true') {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const conexion = mysql.createPool(poolConfig);

export default conexion;