import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { UsuarioAuth } from '../modulos/auth/interfaces/auth-interface';

export const useAuthStore = defineStore('auth', () => {
    const usuario = ref<UsuarioAuth | null>(null);
    const token = ref<string | null>(null);

    const setUsuario = (u: UsuarioAuth) => {
        usuario.value = u;
    };

    const setEmpresaActiva = (empresa: {
        empresa_id: number;
        empresa_nombre: string;
        empresa_color_primario: string;
        empresa_color_secundario: string;
        rol_empresa: 'admin' | 'trabajador';
    }) => {
        if (usuario.value) {
            usuario.value.empresa_id = empresa.empresa_id;
            usuario.value.empresa_nombre = empresa.empresa_nombre;
            usuario.value.empresa_color_primario = empresa.empresa_color_primario;
            usuario.value.empresa_color_secundario = empresa.empresa_color_secundario;
            usuario.value.rol_empresa = empresa.rol_empresa;
        }
    };

    const cerrarSesion = () => {
        usuario.value = null;
        token.value = null;
    };

    const estaAutenticado = () => usuario.value !== null;
    const esSuperAdmin = () => usuario.value?.rol === 'superadmin';
    const esAdmin = () => usuario.value?.rol_empresa === 'admin';
    const esTrabajador = () => usuario.value?.rol_empresa === 'trabajador';
    const tieneEmpresa = () => usuario.value?.empresa_id != null;

    return {
        usuario,
        token,
        setUsuario,
        setEmpresaActiva,
        cerrarSesion,
        estaAutenticado,
        esSuperAdmin,
        esAdmin,
        esTrabajador,
        tieneEmpresa
    };
}, { persist: true } as any);