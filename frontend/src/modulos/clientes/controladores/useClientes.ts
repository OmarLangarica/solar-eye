import { ref } from 'vue';
import clientesApi from '../api/clientesApi';
import { useAuthStore } from '../../../stores/authStore';
import type { Cliente, ClienteNuevo } from '../interfaces/clientes-interface';

export const useClientes = () => {
    const authStore = useAuthStore();
    const clientes = ref<Cliente[]>([]);
    const clienteSeleccionado = ref<Cliente | null>(null);
    const cargando = ref(false);
    const error = ref<string | null>(null);
    const mensaje = ref<string | null>(null);

    const traeClientes = async () => {
        try {
            cargando.value = true;
            const usuario_id = authStore.usuario?.id;
            const respuesta = await clientesApi.get<Cliente[]>(`/usuario/${usuario_id}`);
            clientes.value = respuesta.data;
        } catch (err) {
            error.value = 'No se pudieron obtener los clientes';
        } finally {
            cargando.value = false;
        }
    };

    const traeClienteId = async (id: number) => {
    try {
        cargando.value = true;
        const respuesta = await clientesApi.get<Cliente[]>(`/${id}`);
        const data = respuesta.data;
        clienteSeleccionado.value = Array.isArray(data) ? (data[0] ?? null) : data;
    } catch (err) {
        error.value = 'No se pudo obtener el cliente';
    } finally {
        cargando.value = false;
    }
    };

    const agregarCliente = async (cliente: ClienteNuevo) => {
        try {
            cargando.value = true;
            mensaje.value = null;
            const respuesta = await clientesApi.post('/', {
                ...cliente,
                usuario_id: authStore.usuario?.id
            });
            if (respuesta.data.affectedRows >= 1) {
                mensaje.value = 'Cliente agregado correctamente';
                await traeClientes();
            }
        } catch (err) {
            error.value = 'No se pudo agregar el cliente';
        } finally {
            cargando.value = false;
        }
    };

    const actualizarCliente = async (cliente: Cliente) => {
        try {
            cargando.value = true;
            mensaje.value = null;
            const respuesta = await clientesApi.put('/', cliente);
            if (respuesta.data.affectedRows >= 1) {
                mensaje.value = 'Cliente actualizado correctamente';
                await traeClientes();
            }
        } catch (err) {
            error.value = 'No se pudo actualizar el cliente';
        } finally {
            cargando.value = false;
        }
    };

    const borrarCliente = async (id: number) => {
    try {
        cargando.value = true;
        console.log('borrando id:', id);
        const respuesta = await clientesApi.delete('/', { data: { id } });
        console.log('respuesta borrar:', respuesta.data);
        if (respuesta.data.affectedRows >= 1) {
            mensaje.value = 'Cliente eliminado correctamente';
            await traeClientes();
        }
    } catch (err) {
        console.error('error borrar:', err);
        error.value = 'No se pudo eliminar el cliente';
    } finally {
        cargando.value = false;
    }
};

    return {
        clientes,
        clienteSeleccionado,
        cargando,
        error,
        mensaje,
        traeClientes,
        traeClienteId,
        agregarCliente,
        actualizarCliente,
        borrarCliente
    };
};