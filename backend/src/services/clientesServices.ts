import conexion from '../db/conexion.js';
import type { Cliente, ClienteNuevo } from '../types/typesClientes.js';
import { clienteSchema, clienteActualizarSchema } from '../schema/clientesSchema.js';

export const obtieneClientes = async () => {
    try {
        const [results] = await conexion.query('SELECT * FROM clientes');
        return results;
    } catch (err) {
        return { error: 'No se pudieron obtener los clientes' };
    }
};

export const obtieneClientesPorUsuario = async (usuario_id: number) => {
    try {
        const [results] = await conexion.query(
            'SELECT * FROM clientes WHERE usuario_id = ?',
            [usuario_id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudieron obtener los clientes del usuario' };
    }
};

export const encuentraCliente = async (id: number) => {
    try {
        const [results] = await conexion.query(
            'SELECT * FROM clientes WHERE id = ? LIMIT 1',
            [id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo encontrar el cliente' };
    }
};

export const agregarCliente = async (nuevo: ClienteNuevo) => {
    try {
        const validacion = clienteSchema.safeParse(nuevo);
        if (!validacion.success) return { error: validacion.error };

        const [results] = await conexion.query(
            `INSERT INTO clientes 
            (usuario_id, nombre, apellido, email, telefono, direccion, ciudad, estado, codigo_postal, notas) 
            VALUES (?,?,?,?,?,?,?,?,?,?)`,
            [nuevo.usuario_id, nuevo.nombre, nuevo.apellido, nuevo.email, nuevo.telefono,
             nuevo.direccion, nuevo.ciudad, nuevo.estado, nuevo.codigo_postal, nuevo.notas]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo agregar el cliente' };
    }
};

export const modificarCliente = async (modificado: Cliente) => {
    try {
        const validacion = clienteActualizarSchema.safeParse(modificado);
        if (!validacion.success) return { error: validacion.error };

        const [results] = await conexion.query(
            `UPDATE clientes SET 
            nombre = ?, apellido = ?, email = ?, telefono = ?, 
            direccion = ?, ciudad = ?, estado = ?, codigo_postal = ?, notas = ? 
            WHERE id = ?`,
            [modificado.nombre, modificado.apellido, modificado.email, modificado.telefono,
             modificado.direccion, modificado.ciudad, modificado.estado, modificado.codigo_postal,
             modificado.notas, modificado.id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo modificar el cliente' };
    }
};

export const borrarCliente = async (id: number) => {
    try {
        const [results] = await conexion.query(
            'DELETE FROM clientes WHERE id = ?',
            [id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo borrar el cliente' };
    }
};