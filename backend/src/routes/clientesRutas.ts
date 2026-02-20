import express from 'express';
import type { Request, Response } from 'express';
import * as clientesServices from '../services/clientesServices.js';

const router = express.Router();

// GET http://localhost:3001/api/clientes
router.get('/', async (_req: Request, res: Response) => {
    const clientes = await clientesServices.obtieneClientes();
    res.send(clientes);
});

// GET http://localhost:3001/api/clientes/1
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const cliente = await clientesServices.encuentraCliente(Number(req.params.id));
        res.status(200).send(cliente);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// GET http://localhost:3001/api/clientes/usuario/1  → clientes de un trabajador
router.get('/usuario/:usuario_id', async (req: Request, res: Response) => {
    try {
        const clientes = await clientesServices.obtieneClientesPorUsuario(Number(req.params.usuario_id));
        res.status(200).send(clientes);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// POST http://localhost:3001/api/clientes
router.post('/', async (req: Request, res: Response) => {
    try {
        const { usuario_id, nombre, apellido, email, telefono, direccion, ciudad, estado, codigo_postal, notas } = req.body;
        const nuevo = await clientesServices.agregarCliente({
            usuario_id, nombre, apellido, email, telefono, direccion, ciudad, estado, codigo_postal, notas
        });
        res.status(201).send(nuevo);
    } catch (err) {
        res.status(500).json({ mensaje: 'No se pudo agregar el cliente' });
    }
});

// PUT http://localhost:3001/api/clientes
router.put('/', async (req: Request, res: Response) => {
    try {
        const { id, usuario_id, nombre, apellido, email, telefono, direccion, ciudad, estado, codigo_postal, notas } = req.body;
        const modificado = await clientesServices.modificarCliente({
            id, usuario_id, nombre, apellido, email, telefono, direccion, ciudad, estado, codigo_postal, notas
        });
        res.status(200).send(modificado);
    } catch (err) {
        res.status(500).json({ mensaje: 'No se pudo modificar el cliente' });
    }
});

// DELETE http://localhost:3001/api/clientes
router.delete('/', async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        const eliminado = await clientesServices.borrarCliente(Number(id));
        res.status(200).send(eliminado);
    } catch (err) {
        res.status(500).json({ mensaje: 'No se pudo borrar el cliente' });
    }
});

export default router;