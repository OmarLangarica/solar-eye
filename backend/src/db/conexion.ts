import mysql from 'mysql2/promise';

const conexion = mysql.createPool({
    host: 'localhost',
    user: 'administrador',
    password: 'admin123456',
    database: 'solar_eye'
});

export default conexion;