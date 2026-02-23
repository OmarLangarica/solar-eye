import mysql from 'mysql2/promise';

const conexion = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'administrador',
  password: process.env.DB_PASSWORD || 'admin123456',
  database: process.env.DB_NAME || 'solar_eye',
  waitForConnections: true,
  connectionLimit: 10
});

export default conexion;