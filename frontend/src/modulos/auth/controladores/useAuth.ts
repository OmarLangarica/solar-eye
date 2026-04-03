import { ref } from 'vue';
import { useRouter } from 'vue-router';
import authApi from '../api/authApi';
import { useAuthStore } from '../../../stores/authStore';
import type { LoginCredenciales } from '../interfaces/auth-interface';

export const useAuth = () => {
    const router = useRouter();
    const authStore = useAuthStore();
    const error = ref<string | null>(null);
    const cargando = ref(false);

    const limpiarError = () => {
        error.value = null;
    };

    const login = async (credenciales: LoginCredenciales) => {
        try {
            cargando.value = true;
            error.value = null;

            const respuesta = await authApi.post('/login', { email: credenciales.email });
            const usuarios = respuesta.data as any[];

            if (!usuarios || (Array.isArray(usuarios) && usuarios.length === 0)) {
                error.value = 'Usuario no encontrado';
                return false; // Retornamos false para indicar fallo
            }

            const usuario = Array.isArray(usuarios) ? usuarios[0] : usuarios;

            if (usuario.password_hash !== credenciales.password) {
                error.value = 'Contraseña incorrecta';
                return false;
            }

            if (!usuario.activo) {
                error.value = 'Usuario inactivo, contacta al administrador';
                return false;
            }

            authStore.setUsuario({
                id: usuario.id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                rol: usuario.rol,
                activo: usuario.activo
            });

            // Tras autenticarse, el primer destino es el dashboard
            router.push('/dashboard');
            return true;

        } catch (err) {
            error.value = 'Error al conectar con el servidor';
            return false;
        } finally {
            cargando.value = false;
        }
    };

    const registrar = async (datos: any) => {
        try {
            cargando.value = true;
            error.value = null;
            await authApi.post('/', datos);
            return true;
        } catch (err) {
            error.value = 'Error al registrar, intenta de nuevo';
            return false;
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
        cerrarSesion,
        limpiarError
    };
};