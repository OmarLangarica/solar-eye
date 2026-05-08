import { Router } from 'express';
import { consultarIA, analizarReciboIA } from '../services/IaServices.js';

const router = Router();

// Endpoint para el chat de SolarEye
router.post('/chat', async (req, res) => {
    try {
        const { mensaje } = req.body;
        if (!mensaje) return res.status(400).json({ respuesta: 'Mensaje requerido' });

        const respuesta = await consultarIA(mensaje);
        return res.json({ respuesta });
    } catch (error: any) {
        console.error('ERROR CHAT:', error?.message ?? error);
        const mensajeError = (error?.message || '').toLowerCase();

        if (mensajeError.includes('429')) {
            return res.status(429).json({ respuesta: 'Demasiadas peticiones, espera un momento e intenta de nuevo.' });
        }
        if (mensajeError.includes('apikey') || mensajeError.includes('autenticación') || mensajeError.includes('unauthorized')) {
            return res.status(500).json({ respuesta: 'Error de configuración IA: revisa GEMINI_API_KEY en el backend.' });
        }
        return res.status(500).json({ respuesta: 'Error al consultar la IA.' });
    }
});

// NUEVO: Endpoint para analizar la imagen del recibo (Paso 3)
router.post('/analizar-recibo', async (req, res) => {
    try {
        const imagen = req.body?.imagen;
        if (!imagen) return res.status(400).json({ respuesta: 'Imagen requerida o cuerpo inválido' });

        console.log('Iniciando extracción de datos con visión...');
        const datos = await analizarReciboIA(imagen);
        
        return res.json(datos);
    } catch (error: any) {
        console.error('ERROR VISIÓN:', error);
        if (error instanceof Error) {
            console.error(error.stack);
        }
        return res.status(500).json({ 
            respuesta: 'No se pudo leer el recibo. Intenta con una foto más clara.',
            detalle: error?.message || 'Error interno en el servidor'
        });
    }
});

export default router;