import conexion from '../db/conexion.js';
import type {UsuarioNuevo, UsuarioActualizar } from '../types/typesUsuarios.js';
import { usuarioSchema, usuarioActualizarSchema } from '../schema/usuariosSchema.js';

export const obtieneUsuarios = async () => {
    try {
        const [results] = await conexion.query(
            'SELECT id, nombre, apellido, email, telefono, rol, activo FROM usuarios'
        );
        return results;
    } catch (err) {
        console.error('Error MySQL:', err);
        return { error: 'No se pudieron obtener los usuarios' };
    }
};

export const encuentraUsuario = async (id: number) => {
    try {
        const [results] = await conexion.query(
            'SELECT id, nombre, apellido, email, telefono, rol, activo FROM usuarios WHERE id = ? LIMIT 1',
            [id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo encontrar el usuario' };
    }
};

export const agregarUsuario = async (nuevo: UsuarioNuevo) => {
    try {
        const validacion = usuarioSchema.safeParse(nuevo);
        if (!validacion.success) return { error: validacion.error };

        const [results] = await conexion.query(
            'INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, rol, activo) VALUES (?,?,?,?,?,?,?)',
            [nuevo.nombre, nuevo.apellido, nuevo.email, nuevo.password_hash, nuevo.telefono, nuevo.rol, nuevo.activo]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo agregar el usuario' };
    }
};

export const modificarUsuario = async (modificado: UsuarioActualizar) => {
    try {
        const validacion = usuarioActualizarSchema.safeParse(modificado);
        if (!validacion.success) return { error: validacion.error };

        const [results] = await conexion.query(
            'UPDATE usuarios SET nombre = ?, apellido = ?, email = ?, telefono = ?, rol = ?, activo = ? WHERE id = ?',
            [modificado.nombre, modificado.apellido, modificado.email, modificado.telefono, modificado.rol, modificado.activo, modificado.id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo modificar el usuario' };
    }
};

export const borrarUsuario = async (id: number) => {
    try {
        const [results] = await conexion.query(
            'DELETE FROM usuarios WHERE id = ?',
            [id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo borrar el usuario' };
    }
};

export const encuentraUsuarioPorEmail = async (email: string) => {
    try {
        const [results] = await conexion.query(
            'SELECT id, nombre, apellido, email, password_hash, telefono, rol, activo FROM usuarios WHERE email = ? LIMIT 1',
            [email]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo encontrar el usuario' };
    }
};

export const obtieneEstadisticasGlobales = async () => {
    try {
        const [totalClientes] = await conexion.query(
            'SELECT COUNT(*) as total FROM clientes'
        );
        const [totalSimulaciones] = await conexion.query(
            'SELECT COUNT(*) as total FROM simulaciones'
        );
        const [simulacionesPorEstado] = await conexion.query(
            'SELECT estado, COUNT(*) as total FROM simulaciones GROUP BY estado'
        );
        const [totalUsuarios] = await conexion.query(
            'SELECT COUNT(*) as total FROM usuarios WHERE rol = "trabajador"'
        );
        const [simulacionesPorMes] = await conexion.query(
            `SELECT DATE_FORMAT(created_at, '%Y-%m') as mes, COUNT(*) as total 
            FROM simulaciones 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY mes ORDER BY mes ASC`
        );
        const [ahorroTotal] = await conexion.query(
            'SELECT SUM(ahorro_vida_util_mxn) as total FROM resultados_calculo'
        );
        const [produccionTotal] = await conexion.query(
            'SELECT SUM(produccion_anual_kwh) as total FROM resultados_calculo'
        );
        const [clientesPorTrabajador] = await conexion.query(
            `SELECT u.id, u.nombre, u.apellido, u.rol,
            COUNT(DISTINCT c.id) as total_clientes,
            COUNT(DISTINCT s.id) as total_simulaciones
            FROM usuarios u
            LEFT JOIN clientes c ON c.usuario_id = u.id
            LEFT JOIN simulaciones s ON s.usuario_id = u.id
            GROUP BY u.id, u.nombre, u.apellido, u.rol`
        );

        return {
            totalClientes: (totalClientes as any[])[0].total,
            totalSimulaciones: (totalSimulaciones as any[])[0].total,
            totalTrabajadores: (totalUsuarios as any[])[0].total,
            simulacionesPorEstado,
            simulacionesPorMes,
            ahorroTotal: (ahorroTotal as any[])[0].total ?? 0,
            produccionTotal: (produccionTotal as any[])[0].total ?? 0,
            clientesPorTrabajador
        };
    } catch (err) {
        console.error('Error en obtieneEstadisticasGlobales:', err); // ← agrega esto
        return { error: 'No se pudieron obtener las estadísticas' };
    }
};

export const obtieneClientesGlobales = async () => {
    try {
        const [results] = await conexion.query(
            `SELECT c.*, u.nombre as trabajador_nombre, u.apellido as trabajador_apellido
             FROM clientes c
             LEFT JOIN usuarios u ON c.usuario_id = u.id
             ORDER BY c.id DESC`
        );
        return results;
    } catch (err) {
        return { error: 'No se pudieron obtener los clientes' };
    }
};

export const obtieneSimulacionesPorCliente = async (cliente_id: number) => {
    try {
        const [results] = await conexion.query(
            'SELECT COUNT(*) as total FROM simulaciones WHERE cliente_id = ?',
            [cliente_id]
        );
        return (results as any[])[0];
    } catch (err) {
        return { error: 'No se pudo obtener el conteo' };
    }
};