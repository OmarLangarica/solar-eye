import express from 'express';
//import type { Request, Response } from 'express';
import * as empresasServices from '../services/empresasServices.js';

const router = express.Router();

router.get('/', async (_req, res) => {
    const empresas = await empresasServices.obtieneEmpresas();
    res.send(empresas);
});

router.get('/:id', async (req, res) => {
    const empresa = await empresasServices.encuentraEmpresa(Number(req.params.id));
    res.send(empresa);
});

router.get('/:id/usuarios', async (req, res) => {
    const usuarios = await empresasServices.obtieneUsuariosPorEmpresa(Number(req.params.id));
    res.send(usuarios);
});

router.get('/:id/estadisticas', async (req, res) => {
    const stats = await empresasServices.obtieneEstadisticasEmpresa(Number(req.params.id));
    res.send(stats);
});

router.post('/', async (req, res) => {
    try {
        const resultado = await empresasServices.agregarEmpresa(req.body);
        res.status(201).send(resultado);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error al crear empresa' });
    }
});

router.put('/', async (req, res) => {
    try {
        const resultado = await empresasServices.modificarEmpresa(req.body);
        res.status(200).send(resultado);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error al modificar empresa' });
    }
});

router.delete('/', async (req, res) => {
    try {
        const { id } = req.body;
        const resultado = await empresasServices.borrarEmpresa(Number(id));
        res.status(200).send(resultado);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error al borrar empresa' });
    }
});

export default router;