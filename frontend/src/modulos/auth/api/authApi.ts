import axios from 'axios';

const authApi = axios.create({
    baseURL: 'https://solar-eye-backend.onrender.com/api/usuarios'
});

export default authApi;


