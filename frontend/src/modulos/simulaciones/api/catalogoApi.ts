import axios from 'axios';

const catalogoApi = axios.create({ 
    baseURL: 'http://localhost:3001/api/catalogo' 
});

export default catalogoApi;