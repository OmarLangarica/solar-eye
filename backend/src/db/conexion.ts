import mysql from 'mysql2/promise';

const conexion = mysql.createPool({
    host: process.env.DATABASE_HOST || "localhost",
    user: process.env.DATABASE_USER || "administrador",
    password: process.env.DATABASE_PASSWORD || "admin123456",
    database: process.env.DATABASE_NAME || "solar_eye",
    port: 3306,
    multipleStatements: false
});

export default conexion;