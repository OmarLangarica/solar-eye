import {Router} from 'express'
import type {Request, Response } from 'express';
import {
    obtienePaneles,
    encuentraPanel,
    obtieneInversores,
    encuentraInversor,
    sugiereInversores,
    obtieneComponentesEmpresa,
    agregaComponenteEmpresa,
    actualizaComponenteEmpresa,
    eliminaComponenteEmpresa
} from '../services/catalogoServices.js';

const router = Router();

router.get('/paneles', async (_req: Request, res: Response) => {
    try {
        const resultado = await obtienePaneles();
        res.status(200).send(resultado);
    } catch {
        res.status(500).json({ mensaje: 'Error interno' });
    }
});

router.get('/paneles/:id', async (req: Request, res: Response) => {
    try {
        const resultado = await encuentraPanel(Number(req.params.id));
        res.status(200).send(resultado);
    } catch {
        res.status(500).json({ mensaje: 'Error interno' });
    }
});

router.get('/inversores', async (_req: Request, res: Response) => {
    try {
        const resultado = await obtieneInversores();
        res.status(200).send(resultado);
    } catch {
        res.status(500).json({ mensaje: 'Error interno' });
    }
});

router.get('/inversores/:id', async (req: Request, res: Response) => {
    try {
        const resultado = await encuentraInversor(Number(req.params.id));
        res.status(200).send(resultado);
    } catch {
        res.status(500).json({ mensaje: 'Error interno' });
    }
});

router.get('/sugerir-inversor', async (req: Request, res: Response) => {
    try {
        const potenciaKwp = Number(req.query.potencia_kwp);
        if (!potenciaKwp || potenciaKwp <= 0) {
            return res.status(400).json({ mensaje: 'potencia_kwp requerido y debe ser mayor a 0' });
        }
        const resultado = await sugiereInversores(potenciaKwp);
        return res.status(200).send(resultado);
    } catch {
        return res.status(500).json({ mensaje: 'Error interno' });
    }
});

// ─── Componentes por empresa ─────────────────────────────────

router.get('/empresa/:empresa_id/componentes', async (req: Request, res: Response) => {
    try {
        const empresa_id = Number(req.params.empresa_id);
        const tipo = req.query.tipo as string | undefined;
        const resultado = await obtieneComponentesEmpresa(empresa_id, tipo);
        return res.status(200).send(resultado);
    } catch {
        return res.status(500).json({ mensaje: 'Error interno' });
    }
});

router.post('/empresa/componentes', async (req: Request, res: Response) => {
    try {
        const resultado = await agregaComponenteEmpresa(req.body);
        return res.status(201).send(resultado);
    } catch {
        return res.status(500).json({ mensaje: 'Error interno' });
    }
});

router.put('/empresa/componentes', async (req: Request, res: Response) => {
    try {
        const resultado = await actualizaComponenteEmpresa(req.body);
        return res.status(200).send(resultado);
    } catch {
        return res.status(500).json({ mensaje: 'Error interno' });
    }
});

router.delete('/empresa/componentes/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const empresa_id = Number(req.query.empresa_id);
        const resultado = await eliminaComponenteEmpresa(id, empresa_id);
        return res.status(200).send(resultado);
    } catch {
        return res.status(500).json({ mensaje: 'Error interno' });
    }
});

export default router;