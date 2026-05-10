import express from 'express';
import type { Request, Response } from 'express';
import * as inventarioServices from '../services/inventarioServices.js';

const router = express.Router();

// ─── Categorías ───────────────────────────────────────────────
router.get('/categorias/:empresa_id', async (req: Request, res: Response) => {
    try {
        const resultado = await inventarioServices.obtieneCategorias(Number(req.params.empresa_id));
        res.status(200).send(resultado);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno' });
    }
});

router.post('/categorias', async (req: Request, res: Response) => {
    try {
        const resultado = await inventarioServices.agregaCategoria(req.body);
        res.status(201).send(resultado);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno' });
    }
});

router.put('/categorias', async (req: Request, res: Response) => {
    try {
        const resultado = await inventarioServices.modificaCategoria(req.body);
        res.status(200).send(resultado);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno' });
    }
});

router.delete('/categorias', async (req: Request, res: Response) => {
    try {
        const { id, empresa_id } = req.body;
        const resultado = await inventarioServices.borraCategoria(Number(id), Number(empresa_id));
        res.status(200).send(resultado);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno' });
    }
});

// ─── Productos ────────────────────────────────────────────────
router.get('/productos/:empresa_id', async (req: Request, res: Response) => {
    try {
        const resultado = await inventarioServices.obtieneProductos(Number(req.params.empresa_id));
        res.status(200).send(resultado);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno' });
    }
});

router.get('/productos/:empresa_id/bajo-stock', async (req: Request, res: Response) => {
    try {
        const resultado = await inventarioServices.obtieneProductosBajoStock(Number(req.params.empresa_id));
        res.status(200).send(resultado);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno' });
    }
});

router.get('/producto/:id/:empresa_id', async (req: Request, res: Response) => {
    try {
        const resultado = await inventarioServices.obtieneProducto(
            Number(req.params.id), Number(req.params.empresa_id)
        );
        res.status(200).send(resultado);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno' });
    }
});

router.post('/productos', async (req: Request, res: Response) => {
    try {
        const resultado = await inventarioServices.agregaProducto(req.body);
        res.status(201).send(resultado);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno' });
    }
});

router.put('/productos', async (req: Request, res: Response) => {
    try {
        const resultado = await inventarioServices.modificaProducto(req.body);
        res.status(200).send(resultado);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno' });
    }
});

router.delete('/productos', async (req: Request, res: Response) => {
    try {
        const { id, empresa_id } = req.body;
        const resultado = await inventarioServices.borraProducto(Number(id), Number(empresa_id));
        res.status(200).send(resultado);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno' });
    }
});

// ─── Movimientos ──────────────────────────────────────────────
router.get('/movimientos/:empresa_id', async (req: Request, res: Response) => {
    try {
        const limite = Number(req.query.limite) || 50;
        const resultado = await inventarioServices.obtieneMovimientos(
            Number(req.params.empresa_id), limite
        );
        res.status(200).send(resultado);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno' });
    }
});

router.get('/movimientos/producto/:producto_id/:empresa_id', async (req: Request, res: Response) => {
    try {
        const resultado = await inventarioServices.obtieneMovimientosPorProducto(
            Number(req.params.producto_id), Number(req.params.empresa_id)
        );
        res.status(200).send(resultado);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno' });
    }
});

router.post('/movimientos', async (req: Request, res: Response) => {
    try {
        const resultado = await inventarioServices.registraMovimiento(req.body);
        res.status(201).send(resultado);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno' });
    }
});

router.post('/reservar', async (req: Request, res: Response) => {
    try {
        const { simulacion_id, cliente_id, empresa_id, usuario_id, materiales } = req.body;
        const resultado = await inventarioServices.reservaMaterialesSimulacion(
            simulacion_id, cliente_id, empresa_id, usuario_id, materiales
        );
        res.status(200).send(resultado);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno' });
    }
});

// ─── Estadísticas ─────────────────────────────────────────────
router.get('/estadisticas/:empresa_id', async (req: Request, res: Response) => {
    try {
        const resultado = await inventarioServices.obtieneEstadisticasInventario(
            Number(req.params.empresa_id)
        );
        res.status(200).send(resultado);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno' });
    }
});

export default router;