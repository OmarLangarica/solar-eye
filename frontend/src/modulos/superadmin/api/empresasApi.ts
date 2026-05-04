import axios from 'axios';

const empresasApi = axios.create({ baseURL: 'http://localhost:3001/api/empresas' });
export default empresasApi;