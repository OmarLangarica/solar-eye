import axios from 'axios';

const simulacionesApi = axios.create({
    baseURL: 'https://solar-eye-backend.onrender.com/api/simulaciones'
});

export const nasaApi = axios.create({
    baseURL: 'https://solar-eye-backend.onrender.com/api/nasa'
});

export default simulacionesApi;

const iaApi = axios.create({
    baseURL: 'https://solar-eye-backend.onrender.com/api/ia'
});

export const analizarReciboConIA = async (imagenBase64: string) => {
    try {
        const { data } = await iaApi.post('/analizar-recibo', { imagen: imagenBase64 });
        return data;
    } catch (error) {
        console.error("Error al conectar con el servicio de visión:", error);
        throw error;
    }
};
