import { ref } from 'vue';
import { useRouter } from 'vue-router';
import authApi from '../api/authApi';
import { useAuthStore } from '../../../stores/authStore';
import type { LoginCredenciales, UsuarioAuth } from '../interfaces/auth-interface';

export const useAuth = () => {
    const router = useRouter();
    const authStore = useAuthStore();
    const error = ref<string | null>(null);
    const cargando = ref(false);

    const login = async (credenciales: LoginCredenciales) => {
    try {
        cargando.value = true;
        error.value = null;

        // Ahora buscamos solo el usuario por email con su password_hash
        const respuesta = await authApi.post('/login', { email: credenciales.email });
        const usuarios = respuesta.data as any[];

        if (!usuarios || (Array.isArray(usuarios) && usuarios.length === 0)) {
            error.value = 'Usuario no encontrado';
            return;
        }

        const usuario = Array.isArray(usuarios) ? usuarios[0] : usuarios;

        if (usuario.password_hash !== credenciales.password) {
            error.value = 'Contraseña incorrecta';
            return;
        }

        if (!usuario.activo) {
            error.value = 'Usuario inactivo, contacta al administrador';
            return;
        }

        authStore.setUsuario({
            id: usuario.id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            rol: usuario.rol,
            activo: usuario.activo
        });

        router.push('/clientes');

    } catch (err) {
        error.value = 'Error al conectar con el servidor';
    } finally {
        cargando.value = false;
    }
};

    const registrar = async (datos: {
        nombre: string;
        apellido: string;
        email: string;
        password_hash: string;
        telefono: string | null;
        rol: 'trabajador' | 'admin';
        activo: boolean;
    }) => {
        try {
            cargando.value = true;
            error.value = null;

            await authApi.post('/', datos);

        } catch (err) {
            error.value = 'Error al registrar, intenta de nuevo';
        } finally {
            cargando.value = false;
        }
    };

    const cerrarSesion = () => {
        authStore.cerrarSesion();
        router.push('/login');
    };

    return {
        error,
        cargando,
        login,
        registrar,
        cerrarSesion
    };
};