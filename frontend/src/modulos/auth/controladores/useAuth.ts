import { ref } from 'vue';
import { useRouter } from 'vue-router';
import authApi from '../api/authApi';
import usuariosApi from '../api/authApi';
import { useAuthStore } from '../../../stores/authStore';

export const useAuth = () => {
    const authStore = useAuthStore();
    const router = useRouter();
    const error = ref('');
    const cargando = ref(false);

    const login = async (credenciales: { email: string; password: string }) => {
        try {
            cargando.value = true;
            error.value = '';

            const respuesta = await authApi.post('/login', { email: credenciales.email });
            const usuarios = respuesta.data;
            const usuario = Array.isArray(usuarios) ? usuarios[0] : usuarios;

            if (!usuario || !usuario.id) {
                error.value = 'Usuario no encontrado';
                return false;
            }

            if (usuario.password_hash !== credenciales.password) {
                error.value = 'Contraseña incorrecta';
                return false;
            }

            if (!usuario.activo) {
                error.value = 'Tu cuenta está desactivada';
                return false;
            }

            authStore.setUsuario({
                id: usuario.id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                telefono: usuario.telefono,
                rol: usuario.rol,
                activo: usuario.activo,
                empresa_id: null,
                empresa_nombre: null,
                empresa_color_primario: null,
                empresa_color_secundario: null,
                rol_empresa: null
            });

            return true;

        } catch (err) {
            error.value = 'Error al iniciar sesión';
            return false;
        } finally {
            cargando.value = false;
        }
    };

    const registrar = async (datos: {
        nombre: string;
        apellido: string;
        email: string;
        password_hash: string;
        telefono?: string | null;
    }) => {
        try {
            cargando.value = true;
            error.value = '';

            await authApi.post('/', {
                ...datos,
                rol: 'usuario',
                activo: true
            });

            return true;
        } catch (err) {
            error.value = 'Error al registrar usuario';
            return false;
        } finally {
            cargando.value = false;
        }
    };

    const limpiarError = () => { error.value = ''; };

    const cerrarSesion = () => {
        authStore.cerrarSesion();
        router.push('/login');
    };

    return { error, cargando, login, registrar, limpiarError, cerrarSesion };
};