import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config(); // Esto carga las variables de tu archivo .env
const conexion = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'solar_eye'
});
export default conexion;
