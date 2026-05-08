import axios from 'axios';

const citasApi = axios.create({
    baseURL: 'http://localhost:3001/api/citas'
});

export default citasApi;
