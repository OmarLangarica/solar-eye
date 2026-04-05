import axios from 'axios';

const adminApi = axios.create({ baseURL: 'http://localhost:3001/api/usuarios' });

export default adminApi;