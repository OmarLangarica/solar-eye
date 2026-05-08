import express from 'express';
import type { Request, Response } from 'express';
import * as citasServices from '../services/citasServices.js';

const router = express.Router();

// GET http://localhost:3001/api/citas
router.get('/', async (_req: Request, res: Response) => {
    try {
        // opcional: devolver todas las citas (paginación omitida)
        const citas = await citasServices.obtieneCitasPorEmpresa(Number(_req.query.empresa_id) || 0);
        res.status(200).send(citas);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// GET por id
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const cita = await citasServices.obtieneCita(Number(req.params.id));
        res.status(200).send(cita);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// GET por cliente
router.get('/cliente/:cliente_id', async (req: Request, res: Response) => {
    try {
        const citas = await citasServices.obtieneCitasPorCliente(Number(req.params.cliente_id));
        res.status(200).send(citas);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// GET por simulacion
router.get('/simulacion/:simulacion_id', async (req: Request, res: Response) => {
    try {
        const citas = await citasServices.obtieneCitasPorSimulacion(Number(req.params.simulacion_id));
        res.status(200).send(citas);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// POST crear cita
router.post('/', async (req: Request, res: Response) => {
    try {
        const nueva = await citasServices.agregarCita(req.body);
        res.status(201).send(nueva);
    } catch (err) {
        res.status(500).json({ mensaje: 'No se pudo crear la cita' });
    }
});

// PUT modificar cita
router.put('/', async (req: Request, res: Response) => {
    try {
        const modificada = await citasServices.modificaCita(req.body);
        res.status(200).send(modificada);
    } catch (err) {
        res.status(500).json({ mensaje: 'No se pudo modificar la cita' });
    }
});

// DELETE cita
router.delete('/', async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        const eliminada = await citasServices.borrarCita(Number(id));
        res.status(200).send(eliminada);
    } catch (err) {
        res.status(500).json({ mensaje: 'No se pudo borrar la cita' });
    }
});

export default router;
