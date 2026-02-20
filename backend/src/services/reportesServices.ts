import conexion from '../db/conexion.js';
import type { ReporteNuevo } from '../types/typesReportes.js';
import { reporteSchema } from '../schema/reportesSchema.js';

export const obtieneReportes = async () => {
    try {
        const [results] = await conexion.query('SELECT * FROM reportes');
        return results;
    } catch (err) {
        return { error: 'No se pudieron obtener los reportes' };
    }
};

// Todos los reportes de una simulación
export const obtieneReportesPorSimulacion = async (simulacion_id: number) => {
    try {
        const [results] = await conexion.query(
            'SELECT * FROM reportes WHERE simulacion_id = ?',
            [simulacion_id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudieron obtener los reportes de la simulación' };
    }
};

// Todos los reportes generados por un trabajador
export const obtieneReportesPorUsuario = async (usuario_id: number) => {
    try {
        const [results] = await conexion.query(
            'SELECT * FROM reportes WHERE usuario_id = ?',
            [usuario_id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudieron obtener los reportes del usuario' };
    }
};

export const encuentraReporte = async (id: number) => {
    try {
        const [results] = await conexion.query(
            'SELECT * FROM reportes WHERE id = ? LIMIT 1',
            [id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo encontrar el reporte' };
    }
};

export const agregaReporte = async (nuevo: ReporteNuevo) => {
    try {
        const validacion = reporteSchema.safeParse(nuevo);
        if (!validacion.success) return { error: validacion.error };

        const [results] = await conexion.query(
            `INSERT INTO reportes (simulacion_id, usuario_id, nombre_archivo, ruta_archivo) 
            VALUES (?,?,?,?)`,
            [nuevo.simulacion_id, nuevo.usuario_id, nuevo.nombre_archivo, nuevo.ruta_archivo]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo registrar el reporte' };
    }
};

export const borraReporte = async (id: number) => {
    try {
        const [results] = await conexion.query(
            'DELETE FROM reportes WHERE id = ?',
            [id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo borrar el reporte' };
    }
};