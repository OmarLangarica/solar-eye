import express from 'express';
import type { Request, Response } from 'express';
import * as reportesServices from '../services/reportesServices.js';

const router = express.Router();

// GET http://localhost:3001/api/reportes
router.get('/', async (_req: Request, res: Response) => {
    const reportes = await reportesServices.obtieneReportes();
    res.send(reportes);
});

// GET http://localhost:3001/api/reportes/1
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const reporte = await reportesServices.encuentraReporte(Number(req.params.id));
        res.status(200).send(reporte);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// GET http://localhost:3001/api/reportes/simulacion/1
router.get('/simulacion/:simulacion_id', async (req: Request, res: Response) => {
    try {
        const reportes = await reportesServices.obtieneReportesPorSimulacion(Number(req.params.simulacion_id));
        res.status(200).send(reportes);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// GET http://localhost:3001/api/reportes/usuario/1
router.get('/usuario/:usuario_id', async (req: Request, res: Response) => {
    try {
        const reportes = await reportesServices.obtieneReportesPorUsuario(Number(req.params.usuario_id));
        res.status(200).send(reportes);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// POST http://localhost:3001/api/reportes
router.post('/', async (req: Request, res: Response) => {
    try {
        const { simulacion_id, usuario_id, nombre_archivo, ruta_archivo } = req.body;
        const nuevo = await reportesServices.agregaReporte({
            simulacion_id, usuario_id, nombre_archivo, ruta_archivo
        });
        res.status(201).send(nuevo);
    } catch (err) {
        res.status(500).json({ mensaje: 'No se pudo registrar el reporte' });
    }
});

// DELETE http://localhost:3001/api/reportes
router.delete('/', async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        const eliminado = await reportesServices.borraReporte(Number(id));
        res.status(200).send(eliminado);
    } catch (err) {
        res.status(500).json({ mensaje: 'No se pudo borrar el reporte' });
    }
});

export default router;