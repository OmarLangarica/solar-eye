import axios from 'axios';
import { defineStore } from 'pinia';
import { ref } from 'vue';

const iaApi = axios.create({
    baseURL: 'http://localhost:3001/api/ia'
});

export const useIaStore = defineStore('ia', () => {
    const disponible = ref(false);
    const cargado = ref(false);

    const cargarDisponibilidad = async () => {
        try {
            const { data } = await iaApi.get('/disponible');
            disponible.value = Boolean(data?.disponible);
        } catch {
            disponible.value = false;
        } finally {
            cargado.value = true;
        }
    };

    return {
        disponible,
        cargado,
        cargarDisponibilidad
    };
});