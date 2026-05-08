import conexion from '../db/conexion.js';
import type { UsuarioNuevo, UsuarioActualizar } from '../types/typesUsuarios.js';
import { usuarioSchema} from '../schema/usuariosSchema.js';

export const obtieneUsuarios = async () => {
    try {
        const [results] = await conexion.query(
            'SELECT id, nombre, apellido, email, telefono, rol, activo FROM usuarios'
        );
        return results;
    } catch (err) {
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
            [nuevo.nombre, nuevo.apellido, nuevo.email, nuevo.password_hash,
             nuevo.telefono, nuevo.rol, nuevo.activo]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo agregar el usuario' };
    }
};

export const modificarUsuario = async (modificado: UsuarioActualizar) => {
    try {
        const [results] = await conexion.query(
            'UPDATE usuarios SET nombre = ?, apellido = ?, email = ?, telefono = ?, activo = ? WHERE id = ?',
            [modificado.nombre, modificado.apellido, modificado.email,
             modificado.telefono, modificado.activo, modificado.id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo modificar el usuario' };
    }
};

export const borrarUsuario = async (id: number) => {
    try {
        const [results] = await conexion.query(
            'DELETE FROM usuarios WHERE id = ?', [id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo borrar el usuario' };
    }
};

export const quitarUsuarioDeEmpresa = async (usuario_id: number, empresa_id: number) => {
    try {
        const [results] = await conexion.query(
            'DELETE FROM usuarios_empresas WHERE usuario_id = ? AND empresa_id = ?',
            [usuario_id, empresa_id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo quitar el usuario de la empresa' };
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

// ─── Empresas del usuario ─────────────────────────────────────
export const obtieneEmpresasDeUsuario = async (usuario_id: number) => {
    try {
        const [results] = await conexion.query(
            `SELECT e.*, ue.rol as rol_empresa, ue.activo as activo_empresa
             FROM empresas e
             INNER JOIN usuarios_empresas ue ON e.id = ue.empresa_id
             WHERE ue.usuario_id = ? AND ue.activo = TRUE AND e.activo = TRUE`,
            [usuario_id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudieron obtener las empresas del usuario' };
    }
};

// ─── Unirse a empresa ─────────────────────────────────────────
export const unirseAEmpresa = async (usuario_id: number, empresa_id: number, rol: string = 'trabajador') => {
    try {
        const [results] = await conexion.query(
            `INSERT INTO usuarios_empresas (usuario_id, empresa_id, rol, activo)
             VALUES (?, ?, ?, TRUE)
             ON DUPLICATE KEY UPDATE activo = TRUE, rol = ?`,
            [usuario_id, empresa_id, rol, rol]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo unir al usuario a la empresa' };
    }
};

// ─── Obtiene usuarios de una empresa ─────────────────────────
export const obtieneUsuariosPorEmpresa = async (empresa_id: number) => {
    try {
        const [results] = await conexion.query(
            `SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, u.activo,
             ue.rol as rol_empresa, ue.activo as activo_empresa
             FROM usuarios u
             INNER JOIN usuarios_empresas ue ON u.id = ue.usuario_id
             WHERE ue.empresa_id = ?`,
            [empresa_id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudieron obtener los usuarios de la empresa' };
    }
};

// ─── Estadísticas globales (superadmin) ──────────────────────
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
            `SELECT COUNT(*) as total FROM usuarios WHERE rol = 'usuario'`
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
            `SELECT u.id, u.nombre, u.apellido, ue.rol as rol,
             COUNT(DISTINCT c.id) as total_clientes,
             COUNT(DISTINCT s.id) as total_simulaciones
             FROM usuarios u
             INNER JOIN usuarios_empresas ue ON u.id = ue.usuario_id
             LEFT JOIN clientes c ON c.usuario_id = u.id
             LEFT JOIN simulaciones s ON s.usuario_id = u.id
             GROUP BY u.id, u.nombre, u.apellido, ue.rol`
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
        console.error('Error en obtieneEstadisticasGlobales:', err);
        return { error: 'No se pudieron obtener las estadísticas' };
    }
};

// ─── Estadísticas por empresa (admin) ────────────────────────
export const obtieneEstadisticasEmpresa = async (empresa_id: number) => {
    try {
        const [totalClientes] = await conexion.query(
            'SELECT COUNT(*) as total FROM clientes WHERE empresa_id = ?',
            [empresa_id]
        );
        const [totalUsuarios] = await conexion.query(
            `SELECT COUNT(*) as total FROM usuarios_empresas
             WHERE empresa_id = ? AND activo = TRUE`,
            [empresa_id]
        );
        const [totalSimulaciones] = await conexion.query(
            `SELECT COUNT(*) as total FROM simulaciones s
             INNER JOIN clientes c ON s.cliente_id = c.id
             WHERE c.empresa_id = ?`,
            [empresa_id]
        );
        const [simulacionesPorEstado] = await conexion.query(
            `SELECT s.estado, COUNT(*) as total FROM simulaciones s
             INNER JOIN clientes c ON s.cliente_id = c.id
             WHERE c.empresa_id = ? GROUP BY s.estado`,
            [empresa_id]
        );
        const [simulacionesPorMes] = await conexion.query(
            `SELECT DATE_FORMAT(s.created_at, '%Y-%m') as mes, COUNT(*) as total
             FROM simulaciones s
             INNER JOIN clientes c ON s.cliente_id = c.id
             WHERE c.empresa_id = ? AND s.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
             GROUP BY mes ORDER BY mes ASC`,
            [empresa_id]
        );
        const [clientesPorTrabajador] = await conexion.query(
            `SELECT u.id, u.nombre, u.apellido, ue.rol as rol,
             COUNT(DISTINCT c.id) as total_clientes,
             COUNT(DISTINCT s.id) as total_simulaciones
             FROM usuarios u
             INNER JOIN usuarios_empresas ue ON u.id = ue.usuario_id
             LEFT JOIN clientes c ON c.usuario_id = u.id AND c.empresa_id = ?
             LEFT JOIN simulaciones s ON s.usuario_id = u.id
             WHERE ue.empresa_id = ?
             GROUP BY u.id, u.nombre, u.apellido, ue.rol`,
            [empresa_id, empresa_id]
        );
        const [ahorroTotal] = await conexion.query(
            `SELECT SUM(rc.ahorro_vida_util_mxn) as total
             FROM resultados_calculo rc
             INNER JOIN simulaciones s ON rc.simulacion_id = s.id
             INNER JOIN clientes c ON s.cliente_id = c.id
             WHERE c.empresa_id = ?`,
            [empresa_id]
        );
        const [produccionTotal] = await conexion.query(
            `SELECT SUM(rc.produccion_anual_kwh) as total
             FROM resultados_calculo rc
             INNER JOIN simulaciones s ON rc.simulacion_id = s.id
             INNER JOIN clientes c ON s.cliente_id = c.id
             WHERE c.empresa_id = ?`,
            [empresa_id]
        );

        return {
            totalClientes: (totalClientes as any[])[0].total,
            totalTrabajadores: (totalUsuarios as any[])[0].total,
            totalSimulaciones: (totalSimulaciones as any[])[0].total,
            simulacionesPorEstado,
            simulacionesPorMes,
            clientesPorTrabajador,
            ahorroTotal: (ahorroTotal as any[])[0].total ?? 0,
            produccionTotal: (produccionTotal as any[])[0].total ?? 0,
        };
    } catch (err) {
        return { error: 'No se pudieron obtener las estadísticas de la empresa' };
    }
};

export const obtieneClientesGlobales = async () => {
    try {
        const [results] = await conexion.query(
            `SELECT c.*, u.nombre as trabajador_nombre, u.apellido as trabajador_apellido,
             e.nombre as empresa_nombre
             FROM clientes c
             LEFT JOIN usuarios u ON c.usuario_id = u.id
             LEFT JOIN empresas e ON c.empresa_id = e.id
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

export const actualizaEstadoSimulacion = async (id: number, estado: string) => {
    try {
        const [results] = await conexion.query(
            'UPDATE simulaciones SET estado = ? WHERE id = ?',
            [estado, id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo actualizar el estado' };
    }
};