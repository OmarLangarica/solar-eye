import conexion from '../db/conexion.js';
import type { EmpresaNueva } from '../types/typesEmpresas.js';

export const obtieneEmpresas = async () => {
    try {
        const [results] = await conexion.query('SELECT * FROM empresas');
        return results;
    } catch (err) {
        return { error: 'No se pudieron obtener las empresas' };
    }
};

export const encuentraEmpresa = async (id: number) => {
    try {
        const [results] = await conexion.query(
            'SELECT * FROM empresas WHERE id = ? LIMIT 1', [id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo encontrar la empresa' };
    }
};

export const agregarEmpresa = async (nueva: EmpresaNueva) => {
    try {
        const [results] = await conexion.query(
            `INSERT INTO empresas (nombre, logo_url, color_primario, color_secundario, plan, activo)
             VALUES (?,?,?,?,?,?)`,
            [nueva.nombre, nueva.logo_url ?? null, nueva.color_primario ?? '#FF7043',
             nueva.color_secundario ?? '#F4511E', nueva.plan, nueva.activo]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo agregar la empresa' };
    }
};

export const modificarEmpresa = async (modificada: any) => {
    try {
        const [results] = await conexion.query(
            `UPDATE empresas SET nombre = ?, logo_url = ?, color_primario = ?,
             color_secundario = ?, plan = ?, activo = ? WHERE id = ?`,
            [modificada.nombre, modificada.logo_url ?? null, modificada.color_primario,
             modificada.color_secundario, modificada.plan, modificada.activo, modificada.id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo modificar la empresa' };
    }
};

export const borrarEmpresa = async (id: number) => {
    try {
        const [results] = await conexion.query(
            'DELETE FROM empresas WHERE id = ?', [id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo borrar la empresa' };
    }
};

export const obtieneUsuariosPorEmpresa = async (empresa_id: number) => {
    try {
        const [results] = await conexion.query(
            `SELECT id, nombre, apellido, email, telefono, rol, activo 
             FROM usuarios WHERE empresa_id = ?`,
            [empresa_id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudieron obtener los usuarios de la empresa' };
    }
};

export const obtieneEstadisticasEmpresa = async (empresa_id: number) => {
    try {
        const [totalClientes] = await conexion.query(
            'SELECT COUNT(*) as total FROM clientes WHERE empresa_id = ?', [empresa_id]
        );
        const [totalUsuarios] = await conexion.query(
            `SELECT COUNT(*) as total FROM usuarios 
             WHERE empresa_id = ? AND rol = 'trabajador'`, [empresa_id]
        );
        const [totalSimulaciones] = await conexion.query(
            `SELECT COUNT(*) as total FROM simulaciones s
             INNER JOIN clientes c ON s.cliente_id = c.id
             WHERE c.empresa_id = ?`, [empresa_id]
        );
        return {
            totalClientes: (totalClientes as any[])[0].total,
            totalUsuarios: (totalUsuarios as any[])[0].total,
            totalSimulaciones: (totalSimulaciones as any[])[0].total,
        };
    } catch (err) {
        return { error: 'No se pudieron obtener las estadísticas' };
    }
};