import express from 'express';
import type { Request, Response } from 'express';
import * as simulacionesServices from '../services/simulacionesServices.js';

const router = express.Router();

//Simulaciones

// GET http://localhost:3001/api/simulaciones
router.get('/', async (_req: Request, res: Response) => {
    const simulaciones = await simulacionesServices.obtieneSimulaciones();
    res.send(simulaciones);
});

// GET http://localhost:3001/api/simulaciones/1
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const simulacion = await simulacionesServices.encuentraSimulacion(Number(req.params.id));
        res.status(200).send(simulacion);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// GET http://localhost:3001/api/simulaciones/cliente/1
router.get('/cliente/:cliente_id', async (req: Request, res: Response) => {
    try {
        const simulaciones = await simulacionesServices.obtieneSimulacionesPorCliente(Number(req.params.cliente_id));
        res.status(200).send(simulaciones);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// POST http://localhost:3001/api/simulaciones
router.post('/', async (req: Request, res: Response) => {
    try {
        const { cliente_id, usuario_id, nombre_proyecto, descripcion, estado } = req.body;
        const nueva = await simulacionesServices.agregarSimulacion({
            cliente_id, usuario_id, nombre_proyecto, descripcion, estado
        });
        res.status(201).send(nueva);
    } catch (err) {
        res.status(500).json({ mensaje: 'No se pudo agregar la simulación' });
    }
});

// PUT http://localhost:3001/api/simulaciones
router.put('/', async (req: Request, res: Response) => {
    try {
        const { id, cliente_id, usuario_id, nombre_proyecto, descripcion, estado } = req.body;
        const modificada = await simulacionesServices.modificarSimulacion({
            id, cliente_id, usuario_id, nombre_proyecto, descripcion, estado
        });
        res.status(200).send(modificada);
    } catch (err) {
        res.status(500).json({ mensaje: 'No se pudo modificar la simulación' });
    }
});

// DELETE http://localhost:3001/api/simulaciones
router.delete('/', async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        const eliminada = await simulacionesServices.borrarSimulacion(Number(id));
        res.status(200).send(eliminada);
    } catch (err) {
        res.status(500).json({ mensaje: 'No se pudo borrar la simulación' });
    }
});

//Datos Techo

// GET http://localhost:3001/api/simulaciones/techo/1
router.get('/techo/:simulacion_id', async (req: Request, res: Response) => {
    try {
        const datos = await simulacionesServices.obtieneDatosTecho(Number(req.params.simulacion_id));
        res.status(200).send(datos);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// POST http://localhost:3001/api/simulaciones/techo
router.post('/techo', async (req: Request, res: Response) => {
    try {
        const datos = await simulacionesServices.agregaDatosTecho(req.body);
        res.status(201).send(datos);
    } catch (err) {
        res.status(500).json({ mensaje: 'No se pudieron guardar los datos del techo' });
    }
});

// PUT http://localhost:3001/api/simulaciones/techo
router.put('/techo', async (req: Request, res: Response) => {
    try {
        const datos = await simulacionesServices.modificaDatosTecho(req.body);
        res.status(200).send(datos);
    } catch (err) {
        res.status(500).json({ mensaje: 'No se pudieron modificar los datos del techo' });
    }
});

//Datos Geográficos

// GET http://localhost:3001/api/simulaciones/geograficos/1
router.get('/geograficos/:simulacion_id', async (req: Request, res: Response) => {
    try {
        const datos = await simulacionesServices.obtieneDatosGeograficos(Number(req.params.simulacion_id));
        res.status(200).send(datos);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// POST http://localhost:3001/api/simulaciones/geograficos
router.post('/geograficos', async (req: Request, res: Response) => {
    try {
        const datos = await simulacionesServices.agregaDatosGeograficos(req.body);
        res.status(201).send(datos);
    } catch (err) {
        res.status(500).json({ mensaje: 'No se pudieron guardar los datos geográficos' });
    }
});

//Consumo Eléctrico

// GET http://localhost:3001/api/simulaciones/consumo/1
router.get('/consumo/:simulacion_id', async (req: Request, res: Response) => {
    try {
        const datos = await simulacionesServices.obtieneConsumoElectrico(Number(req.params.simulacion_id));
        res.status(200).send(datos);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// POST http://localhost:3001/api/simulaciones/consumo
router.post('/consumo', async (req: Request, res: Response) => {
    try {
        const datos = await simulacionesServices.agregaConsumoElectrico(req.body);
        res.status(201).send(datos);
    } catch (err) {
        res.status(500).json({ mensaje: 'No se pudo guardar el consumo eléctrico' });
    }
});

// PUT http://localhost:3001/api/simulaciones/consumo
router.put('/consumo', async (req: Request, res: Response) => {
    try {
        const datos = await simulacionesServices.modificaConsumoElectrico(req.body);
        res.status(200).send(datos);
    } catch (err) {
        res.status(500).json({ mensaje: 'No se pudo modificar el consumo eléctrico' });
    }
});

//Configuración Sistema Solar

// GET http://localhost:3001/api/simulaciones/sistema/1
router.get('/sistema/:simulacion_id', async (req: Request, res: Response) => {
    try {
        const datos = await simulacionesServices.obtieneConfiguracionSistema(Number(req.params.simulacion_id));
        res.status(200).send(datos);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// POST http://localhost:3001/api/simulaciones/sistema
router.post('/sistema', async (req: Request, res: Response) => {
    try {
        const datos = await simulacionesServices.agregaConfiguracionSistema(req.body);
        res.status(201).send(datos);
    } catch (err) {
        res.status(500).json({ mensaje: 'No se pudo guardar la configuración del sistema' });
    }
});

// PUT http://localhost:3001/api/simulaciones/sistema
router.put('/sistema', async (req: Request, res: Response) => {
    try {
        const datos = await simulacionesServices.modificaConfiguracionSistema(req.body);
        res.status(200).send(datos);
    } catch (err) {
        res.status(500).json({ mensaje: 'No se pudo modificar la configuración del sistema' });
    }
});

//Resultados

// GET http://localhost:3001/api/simulaciones/resultados/1
router.get('/resultados/:simulacion_id', async (req: Request, res: Response) => {
    try {
        const datos = await simulacionesServices.obtieneResultadosCalculo(Number(req.params.simulacion_id));
        res.status(200).send(datos);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

// POST http://localhost:3001/api/simulaciones/resultados
router.post('/resultados', async (req: Request, res: Response) => {
    try {
        const datos = await simulacionesServices.agregaResultadosCalculo(req.body);
        res.status(201).send(datos);
    } catch (err) {
        res.status(500).json({ mensaje: 'No se pudieron guardar los resultados' });
    }
});

export default router;