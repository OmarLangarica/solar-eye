import axios from 'axios';

const adminApi = axios.create({ baseURL: 'https://solar-eye-backend.onrender.com/api/usuarios' });

export default adminApi;


