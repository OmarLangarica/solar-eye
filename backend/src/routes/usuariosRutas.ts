import express from 'express';
import type { Request, Response } from 'express';
import * as usuariosServices from '../services/usuariosServices.js';

const router = express.Router();

// GET http://localhost:3001/api/usuarios
router.get('/', async (_req: Request, res: Response) => {
    const usuarios = await usuariosServices.obtieneUsuarios();
    res.send(usuarios);
});

// GET estadísticas globales (solo admin)
router.get('/estadisticas/globales', async (_req: Request, res: Response) => {
    try {
        const stats = await usuariosServices.obtieneEstadisticasGlobales();
        res.status(200).send(stats);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// GET clientes globales (solo admin)
router.get('/clientes/globales', async (_req: Request, res: Response) => {
    try {
        const clientes = await usuariosServices.obtieneClientesGlobales();
        res.status(200).send(clientes);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

router.get('/simulaciones-por-cliente/:cliente_id', async (req: Request, res: Response) => {
    try {
        const resultado = await usuariosServices.obtieneSimulacionesPorCliente(Number(req.params.cliente_id));
        res.status(200).send(resultado);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno' });
    }
});

// POST http://localhost:3001/api/usuarios/login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const usuario = await usuariosServices.encuentraUsuarioPorEmail(email);
        res.status(200).send(usuario);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// GET http://localhost:3001/api/usuarios/1
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const usuario = await usuariosServices.encuentraUsuario(Number(req.params.id));
        res.status(200).send(usuario);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// POST http://localhost:3001/api/usuarios
router.post('/', async (req: Request, res: Response) => {
    try {
        const { nombre, apellido, email, password_hash, telefono, rol, activo } = req.body;
        const nuevo = await usuariosServices.agregarUsuario({
            nombre, apellido, email, password_hash, telefono, rol, activo
        });
        res.status(201).send(nuevo);
    } catch (err) {
        res.status(500).json({ mensaje: 'No se pudo agregar el usuario' });
    }
});

// PUT http://localhost:3001/api/usuarios
router.put('/', async (req: Request, res: Response) => {
    try {
        const { id, nombre, apellido, email, telefono, rol, activo } = req.body;
        const modificado = await usuariosServices.modificarUsuario({
            id, nombre, apellido, email, telefono, rol, activo
        });
        res.status(200).send(modificado);
    } catch (err) {
        res.status(500).json({ mensaje: 'No se pudo modificar el usuario' });
    }
});

// DELETE http://localhost:3001/api/usuarios
router.delete('/', async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        const eliminado = await usuariosServices.borrarUsuario(Number(id));
        res.status(200).send(eliminado);
    } catch (err) {
        res.status(500).json({ mensaje: 'No se pudo borrar el usuario' });
    }
});


export default router;

