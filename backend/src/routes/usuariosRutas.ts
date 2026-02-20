import express from 'express';
import type { Request, Response } from 'express';
import * as usuariosServices from '../services/usuariosServices.js';

const router = express.Router();

// GET http://localhost:3001/api/usuarios
router.get('/', async (_req: Request, res: Response) => {
    const usuarios = await usuariosServices.obtieneUsuarios();
    res.send(usuarios);
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