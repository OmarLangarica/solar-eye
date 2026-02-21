import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { UsuarioAuth } from '../modulos/auth/interfaces/auth-interface';

export const useAuthStore = defineStore('auth', () => {
    const usuario = ref<UsuarioAuth | null>(null);
    const token = ref<string | null>(null);

    const setUsuario = (u: UsuarioAuth) => {
        usuario.value = u;
    };

    const cerrarSesion = () => {
        usuario.value = null;
        token.value = null;
    };

    const estaAutenticado = () => {
        return usuario.value !== null;
    };

    return {
        usuario,
        token,
        setUsuario,
        cerrarSesion,
        estaAutenticado
    };
});