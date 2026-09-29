import axios from 'axios';

const inventarioApi = axios.create({ baseURL: 'https://solar-eye-backend.onrender.com/api/inventario' });
export default inventarioApi;


