import axios from 'axios';

const clientesApi = axios.create({
    baseURL: 'https://solar-eye-backend.onrender.com/api/clientes'
});

export default clientesApi;
