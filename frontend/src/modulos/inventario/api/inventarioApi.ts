import axios from 'axios';

const inventarioApi = axios.create({ baseURL: 'http://localhost:3001/api/inventario' });
export default inventarioApi;