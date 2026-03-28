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
        console.error('ERROR REAL:', error?.message ?? error);

        const mensajeError = (error?.message || '').toLowerCase();

        if (mensajeError.includes('429')) {
            return res.status(429).json({ respuesta: 'Demasiadas peticiones, espera un momento e intenta de nuevo.' });
        }
        if (mensajeError.includes('gemini_apikey') || mensajeError.includes('apikey') || mensajeError.includes('autenticación') || mensajeError.includes('unauthorized')) {
            return res.status(500).json({ respuesta: 'Error de configuración IA: revisa GEMINI_API_KEY en el backend.', detalle: error?.message });
        }

        return res.status(500).json({ respuesta: 'Error al consultar la IA.', detalle: error?.message });
    }
});

export default router;