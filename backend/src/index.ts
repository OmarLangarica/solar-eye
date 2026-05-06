import express from 'express';
import cors from 'cors';

import usuariosRutas from './routes/usuariosRutas.js';
import clientesRutas from './routes/clientesRutas.js';
import simulacionesRutas from './routes/simulacionesRutas.js';
import reportesRutas from './routes/reportesRutas.js';
import nasaRutas from './routes/nasaRutas.js';
import IaRutas from './routes/IaRutas.js'; 
import empresasRutas from './routes/empresasRutas.js';

const app = express();
app.use(cors());

// --- AJUSTE CRÍTICO PARA SOLAREYE ---
// Aumentamos el límite a 10MB para soportar las fotos de los recibos
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rutas de la IA (Chat y Visión)
app.use('/api/ia', IaRutas);

const PUERTO = 3001;

// Resto de tus rutas
app.use('/api/usuarios', usuariosRutas);
app.use('/api/clientes', clientesRutas);
app.use('/api/simulaciones', simulacionesRutas);
app.use('/api/reportes', reportesRutas);
app.use('/api/nasa', nasaRutas);
app.use('/api/empresas', empresasRutas);

app.listen(PUERTO, () => {
    console.log(`Servidor en ejecución en el puerto ${PUERTO}`);
});

export default app;