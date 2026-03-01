import axios from 'axios';

const simulacionesApi = axios.create({
    baseURL: 'http://localhost:3001/api/simulaciones'
});

export const nasaApi = axios.create({
    baseURL: 'http://localhost:3001/api/nasa'
});

export default simulacionesApi;