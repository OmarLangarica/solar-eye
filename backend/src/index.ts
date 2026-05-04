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
app.use(express.json());
app.use('/api/ia', IaRutas);
const PUERTO = 3001;

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