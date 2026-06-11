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

// Obtiene solo empresas públicas para la landing
export const obtieneEmpresasPublicas = async () => {
    try {
        const [results] = await conexion.query(
            `SELECT id, nombre, descripcion, slogan, telefono, email_contacto,
             sitio_web, direccion, ciudad, estado_republica, facebook, instagram,
             whatsapp, imagen_portada, imagen_logo, color_primario, color_secundario, plan
             FROM empresas
             WHERE publica = TRUE AND activo = TRUE
             ORDER BY nombre ASC`
        );
        return results;
    } catch (err) {
        return { error: 'No se pudieron obtener las empresas' };
    }
};

// Obtiene una empresa pública por id
export const obtieneEmpresaPublica = async (id: number) => {
    try {
        const [results] = await conexion.query(
            `SELECT id, nombre, descripcion, slogan, telefono, email_contacto,
             sitio_web, direccion, ciudad, estado_republica, facebook, instagram,
             whatsapp, imagen_portada, imagen_logo, color_primario, color_secundario, plan
             FROM empresas
             WHERE id = ? AND publica = TRUE AND activo = TRUE LIMIT 1`,
            [id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo obtener la empresa' };
    }
};

// Actualiza perfil público de empresa
export const actualizaPerfilEmpresa = async (datos: any) => {
    try {
        const [results] = await conexion.query(
            `UPDATE empresas SET
             descripcion = ?, slogan = ?, telefono = ?, email_contacto = ?,
             sitio_web = ?, direccion = ?, ciudad = ?, estado_republica = ?,
             facebook = ?, instagram = ?, whatsapp = ?,
             imagen_portada = ?, imagen_logo = ?, publica = ?
             WHERE id = ?`,
            [datos.descripcion ?? null, datos.slogan ?? null, datos.telefono ?? null,
             datos.email_contacto ?? null, datos.sitio_web ?? null, datos.direccion ?? null,
             datos.ciudad ?? null, datos.estado_republica ?? null, datos.facebook ?? null,
             datos.instagram ?? null, datos.whatsapp ?? null, datos.imagen_portada ?? null,
             datos.imagen_logo ?? null, datos.publica ?? false, datos.id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo actualizar el perfil' };
    }
};