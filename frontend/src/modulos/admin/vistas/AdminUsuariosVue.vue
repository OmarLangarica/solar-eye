<template>
    <div class="contenedor">
        <div class="encabezado">
            <div>
                <h1>Gestión de usuarios</h1>
                <p>Administra los trabajadores del sistema</p>
            </div>
            <div class="acciones-header">
                <button class="btn-secundario" @click="cambiarEmpresa">Cambiar de empresa</button>
                <button class="btn-principal" @click="router.push('/admin/usuarios/agregar')">+ Nuevo trabajador</button>
                <button class="btn-secundario" @click="router.push('/admin/dashboard')">← Volver</button>
            </div>
        </div>

        <div class="mensaje exito" v-if="mensaje">{{ mensaje }}</div>
        <div class="mensaje error-msg" v-if="error">{{ error }}</div>

        <div class="tabla-container">
            <div v-if="cargando" class="sin-datos">Cargando usuarios...</div>

            <table v-else-if="usuarios.length > 0">
                <thead>
                    <tr>
                        <th>NOMBRE</th>
                        <th>EMAIL</th>
                        <th>TELÉFONO</th>
                        <th>ROL</th>
                        <th>ESTADO</th>
                        <th>ACCIONES</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="u in usuarios" :key="u.id">
                        <td>{{ u.nombre }} {{ u.apellido }}</td>
                        <td>{{ u.email }}</td>
                        <td>{{ u.telefono ?? '—' }}</td>
                        <td>
                            <span class="badge" :class="u.rol_empresa">{{ u.rol_empresa }}</span>
                        </td>
                        <td>
                            <span class="badge" :class="u.activo ? 'activo' : 'inactivo'">
                                {{ u.activo ? 'Activo' : 'Inactivo' }}
                            </span>
                        </td>
                        <td class="acciones">
                            <button
                                class="btn-eliminar"
                                @click="confirmarEliminar(u)"
                                :disabled="u.id === authStore.usuario?.id"
                            >
                                Expulsar
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div v-else class="sin-datos">No hay usuarios registrados.</div>
        </div>

        <!-- Modal eliminar -->
        <div v-if="modalEliminarVisible" class="overlay" @click.self="modalEliminarVisible = false">
            <div class="modal-eliminar">
                <h2>¿Quitar usuario de la empresa?</h2>
                <p>¿Estás seguro de quitar a <strong>{{ usuarioAEliminar?.nombre }} {{ usuarioAEliminar?.apellido }}</strong> de esta empresa? El usuario seguirá existiendo en el sistema.</p>
                <div class="modal-botones">
                    <button class="btn-cancelar" @click="modalEliminarVisible = false">Cancelar</button>
                    <button class="btn-confirmar-eliminar" @click="ejecutarEliminar" :disabled="cargandoEliminar">
                        {{ cargandoEliminar ? 'Quitando...' : 'Sí, quitar' }}
                    </button>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import adminApi from '../api/adminApi';
import { useAuthStore } from '../../../stores/authStore';

const router = useRouter();
const authStore = useAuthStore();
const empresaId = computed(() => authStore.usuario?.empresa_id ?? null);

const usuarios = ref<any[]>([]);
const cargando = ref(false);
const error = ref('');
const mensaje = ref('');
const cargandoEliminar = ref(false);
const modalEliminarVisible = ref(false);
const usuarioAEliminar = ref<any>(null);

const cambiarEmpresa = () => {
    router.push('/seleccionar-empresa');
};

const mostrarMensaje = (msg: string) => {
    mensaje.value = msg;
    setTimeout(() => mensaje.value = '', 3000);
};

const traeUsuarios = async () => {
    if (!empresaId.value) {
        error.value = 'No hay empresa activa seleccionada';
        usuarios.value = [];
        return;
    }

    try {
        cargando.value = true;
        const resp = await adminApi.get(`/empresa/${empresaId.value}/usuarios`);
        usuarios.value = resp.data;
    } catch (err) {
        error.value = 'No se pudieron cargar los usuarios';
    } finally {
        cargando.value = false;
    }
};

const confirmarEliminar = (u: any) => {
    usuarioAEliminar.value = u;
    modalEliminarVisible.value = true;
};

const ejecutarEliminar = async () => {
    if (!usuarioAEliminar.value || !empresaId.value) return;
    try {
        cargandoEliminar.value = true;
        await adminApi.delete(`/empresa/${empresaId.value}/usuarios/${usuarioAEliminar.value.id}`);
        modalEliminarVisible.value = false;
        usuarioAEliminar.value = null;
        mostrarMensaje('Usuario quitado de la empresa correctamente');
        await traeUsuarios();
    } catch (err) {
        error.value = 'No se pudo quitar el usuario de la empresa';
    } finally {
        cargandoEliminar.value = false;
    }
};

onMounted(() => traeUsuarios());
</script>

<style scoped>
.contenedor { padding: 2rem; max-width: 1200px; margin: 0 auto; }

.encabezado {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.encabezado h1 { font-size: 1.8rem; color: #333; margin: 0; }
.encabezado p { color: #666; font-size: 0.9rem; margin: 0.25rem 0 0; }

.acciones-header { display: flex; gap: 1rem; flex-wrap: wrap; }

.btn-principal {
    padding: 0.6rem 1.2rem;
    background-color: #FF7043;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
.btn-principal:hover { background-color: #F4511E; }

.btn-secundario {
    padding: 0.6rem 1.2rem;
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
.btn-secundario:hover { background-color: #e0e0e0; }

.mensaje { padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.9rem; }
.mensaje.exito { background: #f0fdf4; color: #16a34a; }
.mensaje.error-msg { background: #fef2f2; color: #ef4444; }

.tabla-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    overflow: hidden;
}

table { width: 100%; border-collapse: collapse; }
thead { background-color: #f5f5f5; }
th { padding: 1rem; text-align: left; font-size: 0.85rem; color: #666; font-weight: 600; }
td { padding: 1rem; border-top: 1px solid #f0f0f0; font-size: 0.95rem; color: #333; }
tr:hover td { background-color: #fafafa; }

.badge {
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: capitalize;
}
.badge.admin { background: #ede9fe; color: #6d28d9; }
.badge.trabajador { background: #dbeafe; color: #1e40af; }
.badge.activo { background: #dcfce7; color: #166534; }
.badge.inactivo { background: #fee2e2; color: #991b1b; }

.acciones { display: flex; gap: 0.5rem; flex-wrap: wrap; }

.btn-eliminar {
    padding: 0.4rem 0.8rem;
    background-color: #ef4444;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
}
.btn-eliminar:hover { background-color: #dc2626; }
.btn-eliminar:disabled { opacity: 0.3; cursor: not-allowed; }

.sin-datos { text-align: center; padding: 3rem; color: #999; }

/* Modal */
.overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.modal-eliminar {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.modal-eliminar h2 { margin: 0 0 1rem; color: #333; font-size: 1.3rem; }
.modal-eliminar p { color: #666; margin-bottom: 1.5rem; line-height: 1.5; }

.modal-botones { display: flex; justify-content: flex-end; gap: 0.75rem; }

.btn-cancelar {
    padding: 0.6rem 1.2rem;
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
.btn-cancelar:hover { background-color: #e0e0e0; }

.btn-confirmar-eliminar {
    padding: 0.6rem 1.2rem;
    background-color: #ef4444;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
.btn-confirmar-eliminar:hover { background-color: #dc2626; }
.btn-confirmar-eliminar:disabled { opacity: 0.6; cursor: not-allowed; }

@media (max-width: 768px) {
    .contenedor { padding: 1rem; }
    .encabezado { flex-direction: column; align-items: flex-start; }
    .acciones-header { width: 100%; }
    .btn-principal, .btn-secundario { flex: 1; text-align: center; }
    th:nth-child(3), td:nth-child(3) { display: none; }
}
</style>