import axios from 'axios';

const citasApi = axios.create({
    baseURL: 'https://solar-eye-backend.onrender.com/api/citas'
});

export default citasApi;

