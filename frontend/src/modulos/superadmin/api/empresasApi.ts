import axios from 'axios';

const empresasApi = axios.create({ baseURL: 'https://solar-eye-backend.onrender.com/api/empresas' });
export default empresasApi;


