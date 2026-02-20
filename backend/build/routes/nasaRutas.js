import express from 'express';
import { consultaNasaPower } from '../services/nasaServices.js';
const router = express.Router();
// POST http://localhost:3001/api/nasa
// Body: { latitud: 20.6597, longitud: -103.3496 }
router.post('/', async (req, res) => {
    try {
        const { latitud, longitud } = req.body;
        if (!latitud || !longitud) {
            res.status(400).json({ mensaje: 'Se requieren latitud y longitud' });
            return;
        }
        const datos = await consultaNasaPower({ latitud, longitud });
        res.status(200).send(datos);
    }
    catch (err) {
        res.status(500).json({ mensaje: 'Error al consultar NASA POWER' });
    }
});
export default router;
