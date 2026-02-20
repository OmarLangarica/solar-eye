import conexion from '../db/conexion.js';
import { usuarioSchema, usuarioActualizarSchema } from '../schema/usuariosSchema.js';
export const obtieneUsuarios = async () => {
    try {
        const [results] = await conexion.query('SELECT id, nombre, apellido, email, telefono, rol, activo FROM usuarios');
        return results;
    }
    catch (err) {
        console.error('Error MySQL:', err);
        return { error: 'No se pudieron obtener los usuarios' };
    }
};
export const encuentraUsuario = async (id) => {
    try {
        const [results] = await conexion.query('SELECT id, nombre, apellido, email, telefono, rol, activo FROM usuarios WHERE id = ? LIMIT 1', [id]);
        return results;
    }
    catch (err) {
        return { error: 'No se pudo encontrar el usuario' };
    }
};
export const agregarUsuario = async (nuevo) => {
    try {
        const validacion = usuarioSchema.safeParse(nuevo);
        if (!validacion.success)
            return { error: validacion.error };
        const [results] = await conexion.query('INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, rol, activo) VALUES (?,?,?,?,?,?,?)', [nuevo.nombre, nuevo.apellido, nuevo.email, nuevo.password_hash, nuevo.telefono, nuevo.rol, nuevo.activo]);
        return results;
    }
    catch (err) {
        return { error: 'No se pudo agregar el usuario' };
    }
};
export const modificarUsuario = async (modificado) => {
    try {
        const validacion = usuarioActualizarSchema.safeParse(modificado);
        if (!validacion.success)
            return { error: validacion.error };
        const [results] = await conexion.query('UPDATE usuarios SET nombre = ?, apellido = ?, email = ?, telefono = ?, rol = ?, activo = ? WHERE id = ?', [modificado.nombre, modificado.apellido, modificado.email, modificado.telefono, modificado.rol, modificado.activo, modificado.id]);
        return results;
    }
    catch (err) {
        return { error: 'No se pudo modificar el usuario' };
    }
};
export const borrarUsuario = async (id) => {
    try {
        const [results] = await conexion.query('DELETE FROM usuarios WHERE id = ?', [id]);
        return results;
    }
    catch (err) {
        return { error: 'No se pudo borrar el usuario' };
    }
};
