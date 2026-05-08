import conexion from '../db/conexion.js';
import type { CitaNueva } from '../types/typesCitas.js';
import { citaSchema, citaActualizarSchema } from '../schema/citasSchema.js';

const normalizaFechaMySQL = (valor?: string | null) => {
    if (!valor) return null;

    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return valor;

    const pad = (n: number) => String(n).padStart(2, '0');
    const anio = fecha.getFullYear();
    const mes = pad(fecha.getMonth() + 1);
    const dia = pad(fecha.getDate());
    const horas = pad(fecha.getHours());
    const minutos = pad(fecha.getMinutes());
    const segundos = pad(fecha.getSeconds());

    return `${anio}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
};

export const agregarCita = async (nuevo: CitaNueva) => {
    try {
        const validacion = citaSchema.safeParse(nuevo);
        if (!validacion.success) return { error: validacion.error };

        const [results] = await conexion.query(
            `INSERT INTO citas (empresa_id, cliente_id, simulacion_id, usuario_id, tipo, fecha_inicio, fecha_fin, estado, notas)
            VALUES (?,?,?,?,?,?,?,?,?)`,
            [nuevo.empresa_id ?? null, nuevo.cliente_id, nuevo.simulacion_id ?? null, nuevo.usuario_id ?? null,
               nuevo.tipo ?? 'visita_tecnica', normalizaFechaMySQL(nuevo.fecha_inicio), normalizaFechaMySQL(nuevo.fecha_fin ?? null), nuevo.estado ?? 'pendiente', nuevo.notas ?? null]
        );
        return results;
    } catch (err) {
        console.error('Error MySQL citas.agregarCita:', err);
        return { error: 'No se pudo agregar la cita' };
    }
};

export const obtieneCitasPorCliente = async (cliente_id: number) => {
    try {
        const [results] = await conexion.query('SELECT * FROM citas WHERE cliente_id = ?', [cliente_id]);
        return results;
    } catch (err) {
        return { error: 'No se pudieron obtener las citas del cliente' };
    }
};

export const obtieneCitasPorSimulacion = async (simulacion_id: number) => {
    try {
        const [results] = await conexion.query('SELECT * FROM citas WHERE simulacion_id = ?', [simulacion_id]);
        return results;
    } catch (err) {
        return { error: 'No se pudieron obtener las citas de la simulación' };
    }
};

export const obtieneCitasPorEmpresa = async (empresa_id: number) => {
    try {
        const [results] = await conexion.query('SELECT * FROM citas WHERE empresa_id = ?', [empresa_id]);
        return results;
    } catch (err) {
        return { error: 'No se pudieron obtener las citas de la empresa' };
    }
};

export const obtieneCita = async (id: number) => {
    try {
        const [results] = await conexion.query('SELECT * FROM citas WHERE id = ? LIMIT 1', [id]);
        return results;
    } catch (err) {
        return { error: 'No se pudo obtener la cita' };
    }
};

export const modificaCita = async (modificada: any) => {
    try {
        const validacion = citaActualizarSchema.safeParse(modificada);
        if (!validacion.success) return { error: validacion.error };

        const [results] = await conexion.query(
            `UPDATE citas SET empresa_id = ?, cliente_id = ?, simulacion_id = ?, usuario_id = ?, tipo = ?, fecha_inicio = ?, fecha_fin = ?, estado = ?, notas = ? WHERE id = ?`,
            [modificada.empresa_id ?? null, modificada.cliente_id, modificada.simulacion_id ?? null, modificada.usuario_id ?? null,
               modificada.tipo ?? 'visita_tecnica', normalizaFechaMySQL(modificada.fecha_inicio), normalizaFechaMySQL(modificada.fecha_fin ?? null), modificada.estado ?? 'pendiente', modificada.notas ?? null, modificada.id]
        );
        return results;
    } catch (err) {
        console.error('Error MySQL citas.modificaCita:', err);
        return { error: 'No se pudo modificar la cita' };
    }
};

export const borrarCita = async (id: number) => {
    try {
        const [results] = await conexion.query('DELETE FROM citas WHERE id = ?', [id]);
        return results;
    } catch (err) {
        return { error: 'No se pudo borrar la cita' };
    }
};
