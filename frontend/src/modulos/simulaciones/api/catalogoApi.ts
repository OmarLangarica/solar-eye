import axios from 'axios';

const catalogoApi = axios.create({ 
    baseURL: 'https://solar-eye-backend.onrender.com/api/catalogo' 
});

export default catalogoApi;
