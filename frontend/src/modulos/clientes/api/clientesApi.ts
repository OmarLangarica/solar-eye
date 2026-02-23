import axios from 'axios';

const clientesApi = axios.create({
    baseURL: 'http://localhost:3000/api/clientes'
});

export default clientesApi;