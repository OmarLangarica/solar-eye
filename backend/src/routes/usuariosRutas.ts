import express from 'express';
import type { Request, Response } from 'express';
import * as usuariosServices from '../services/usuariosServices.js';

const router = express.Router();

// ─── Rutas específicas ANTES de /:id ──────────────────────────

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const usuario = await usuariosServices.encuentraUsuarioPorEmail(email);
        res.status(200).send(usuario);
    } catch (err) {
        console.error(">>> ERROR EN LOGIN:", err);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

router.get('/estadisticas/globales', async (_req: Request, res: Response) => {
    try {
        const stats = await usuariosServices.obtieneEstadisticasGlobales();
        res.status(200).send(stats);
    } catch (err) {
        console.error(">>> ERROR EN ESTADISTICAS GLOBALES:", err);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

router.get('/clientes/globales', async (_req: Request, res: Response) => {
    try {
        const clientes = await usuariosServices.obtieneClientesGlobales();
        res.status(200).send(clientes);
    } catch (err) {
        console.error(">>> ERROR EN CLIENTES GLOBALES:", err);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

router.get('/simulaciones-por-cliente/:cliente_id', async (req: Request, res: Response) => {
    try {
        const resultado = await usuariosServices.obtieneSimulacionesPorCliente(Number(req.params.cliente_id));
        res.status(200).send(resultado);
    } catch (err) {
        console.error(">>> ERROR EN SIMULACIONES POR CLIENTE:", err);
        res.status(500).json({ mensaje: 'Error interno' });
    }
});

router.get('/empresas/:usuario_id', async (req: Request, res: Response) => {
    try {
        const empresas = await usuariosServices.obtieneEmpresasDeUsuario(Number(req.params.usuario_id));
        res.status(200).send(empresas);
    } catch (err) {
        console.error(">>> ERROR EN EMPRESAS DE USUARIO:", err);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

router.get('/empresa/:empresa_id/usuarios', async (req: Request, res: Response) => {
    try {
        const usuarios = await usuariosServices.obtieneUsuariosPorEmpresa(Number(req.params.empresa_id));
        res.status(200).send(usuarios);
    } catch (err) {
        console.error(">>> ERROR EN USUARIOS POR EMPRESA:", err);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

router.delete('/empresa/:empresa_id/usuarios/:usuario_id', async (req: Request, res: Response) => {
    try {
        const empresa_id = Number(req.params.empresa_id);
        const usuario_id = Number(req.params.usuario_id);

        const resultado = await usuariosServices.quitarUsuarioDeEmpresa(usuario_id, empresa_id);
        res.status(200).send(resultado);
    } catch (err) {
        console.error(">>> ERROR EN QUITAR USUARIO DE EMPRESA:", err);
        res.status(500).json({ mensaje: 'No se pudo quitar el usuario de la empresa' });
    }
});

router.get('/empresa/:empresa_id/estadisticas', async (req: Request, res: Response) => {
    try {
        const stats = await usuariosServices.obtieneEstadisticasEmpresa(Number(req.params.empresa_id));
        res.status(200).send(stats);
    } catch (err) {
        console.error(">>> ERROR EN ESTADISTICAS EMPRESA:", err);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

router.post('/unirse-empresa', async (req: Request, res: Response) => {
    try {
        const { usuario_id, empresa_id, rol } = req.body;
        const resultado = await usuariosServices.unirseAEmpresa(usuario_id, empresa_id, rol);
        res.status(200).send(resultado);
    } catch (err) {
        console.error(">>> ERROR EN UNIRSE A EMPRESA:", err);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

router.patch('/estado', async (req: Request, res: Response) => {
    try {
        const { id, estado } = req.body;
        const resultado = await usuariosServices.actualizaEstadoSimulacion(id, estado);
        res.status(200).send(resultado);
    } catch (err) {
        console.error(">>> ERROR EN ACTUALIZA ESTADO SIMULACION:", err);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// ─── CRUD básico ──────────────────────────────────────────────

router.get('/', async (_req: Request, res: Response) => {
    try {
        const usuarios = await usuariosServices.obtieneUsuarios();
        res.send(usuarios);
    } catch (err) {
        console.error(">>> ERROR EXACTO AL OBTENER USUARIOS:", err);
        res.status(500).json({ error: "No se pudieron obtener los usuarios" });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const usuario = await usuariosServices.encuentraUsuario(Number(req.params.id));
        res.status(200).send(usuario);
    } catch (err) {
        console.error(">>> ERROR EN OBTENER USUARIO POR ID:", err);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

router.post('/', async (req: Request, res: Response) => {
    try {
        const { nombre, apellido, email, password_hash, telefono, rol, activo } = req.body;
        const nuevo = await usuariosServices.agregarUsuario({
            nombre, apellido, email, password_hash, telefono, rol, activo
        });

        if (nuevo && typeof nuevo === 'object' && 'error' in nuevo) {
            res.status(400).json(nuevo);
            return;
        }

        res.status(201).send(nuevo);
    } catch (err) {
        console.error(">>> ERROR EN AGREGAR USUARIO:", err);
        res.status(500).json({ mensaje: 'No se pudo agregar el usuario' });
    }
});

router.put('/', async (req: Request, res: Response) => {
    try {
        const { id, nombre, apellido, email, telefono, activo } = req.body;
        const modificado = await usuariosServices.modificarUsuario({
            id, nombre, apellido, email, telefono, activo
        });
        res.status(200).send(modificado);
    } catch (err) {
        console.error(">>> ERROR EN MODIFICAR USUARIO:", err);
        res.status(500).json({ mensaje: 'No se pudo modificar el usuario' });
    }
});

router.delete('/', async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        const eliminado = await usuariosServices.borrarUsuario(Number(id));
        res.status(200).send(eliminado);
    } catch (err) {
        console.error(">>> ERROR EN BORRAR USUARIO:", err);
        res.status(500).json({ mensaje: 'No se pudo borrar el usuario' });
    }
});

export default router;