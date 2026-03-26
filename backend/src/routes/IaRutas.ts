import { Router } from 'express';
import { consultarIA } from '../services/IaServices.js';

const router = Router();

router.post('/chat', async (req, res) => {
    try {
        const { mensaje } = req.body;
        if (!mensaje) return res.status(400).json({ respuesta: 'Mensaje requerido' });
        const respuesta = await consultarIA(mensaje);
        return res.json({ respuesta });
    } catch (error: any) {
        if (error.message?.includes('429')) {
            return res.status(429).json({ respuesta: 'Demasiadas peticiones, espera un momento e intenta de nuevo.' });
        } else {
            return res.status(500).json({ respuesta: 'Error al consultar la IA.' });
        }
    }
});

export default router;