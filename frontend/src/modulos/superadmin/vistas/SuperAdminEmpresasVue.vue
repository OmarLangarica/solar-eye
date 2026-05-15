<template>
    <div class="contenedor">
        <nav class="navbar">
            <div class="navbar-brand">
                <img class="navbar-logo" :src="logoSolarEye" alt="Solar Eye" />
            </div>

            <div class="navbar-links">
                <button class="nav-link" @click="router.push('/superadmin/empresas/agregar')">+ Nueva empresa</button>
            </div>

            <div class="navbar-user">
                <span class="navbar-user-name">{{ authStore.usuario?.nombre }} {{ authStore.usuario?.apellido }}</span>
                <button class="nav-link nav-link--logout" @click="cerrarSesionHandler" aria-label="Cerrar sesión" title="Cerrar sesión">
                    <i class="bi bi-box-arrow-right" aria-hidden="true"></i>
                </button>
            </div>
        </nav>

        <div class="mensaje exito" v-if="mensaje">{{ mensaje }}</div>
        <div class="mensaje error-msg" v-if="error">{{ error }}</div>

        <div class="stats-grid">
            <div class="stat-card">
                <h3>Total empresas</h3>
                <p class="stat-valor">{{ empresas.length }}</p>
            </div>
            <div class="stat-card">
                <h3>Empresas activas</h3>
                <p class="stat-valor">{{ empresas.filter(e => e.activo).length }}</p>
            </div>
            <div class="stat-card">
                <h3>Plan básico</h3>
                <p class="stat-valor">{{ empresas.filter(e => e.plan === 'basico').length }}</p>
            </div>
            <div class="stat-card">
                <h3>Plan profesional</h3>
                <p class="stat-valor">{{ empresas.filter(e => e.plan === 'profesional').length }}</p>
            </div>
        </div>

        <div class="tabla-container">
            <div v-if="cargando" class="sin-datos">Cargando empresas...</div>

            <table v-else-if="empresas.length > 0">
                <thead>
                    <tr>
                        <th>EMPRESA</th>
                        <th>PLAN</th>
                        <th>ESTADO</th>
                        <th>CREADA</th>
                        <th>ACCIONES</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="e in empresas" :key="e.id">
                        <td>
                            <div class="empresa-info">
                                <div class="empresa-color" :style="{ backgroundColor: e.color_primario }"></div>
                                <span>{{ e.nombre }}</span>
                            </div>
                        </td>
                        <td>
                            <span class="badge" :class="e.plan">{{ e.plan }}</span>
                        </td>
                        <td>
                            <span class="badge" :class="e.activo ? 'activo' : 'inactivo'">
                                {{ e.activo ? 'Activa' : 'Inactiva' }}
                            </span>
                        </td>
                        <td>{{ formatearFecha(e.created_at) }}</td>
                        <td class="acciones">
                            <button class="btn-editar" @click="router.push(`/superadmin/empresas/editar/${e.id}`)">Editar</button>
                            <button
                                class="btn-toggle"
                                :class="e.activo ? 'desactivar' : 'activar'"
                                @click="toggleActivo(e)"
                            >
                                {{ e.activo ? 'Desactivar' : 'Activar' }}
                            </button>
                            <button class="btn-eliminar" @click="confirmarEliminar(e)">Eliminar</button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div v-else class="sin-datos">No hay empresas registradas.</div>
        </div>

        <!-- Modal eliminar -->
        <div v-if="modalEliminarVisible" class="overlay" @click.self="modalEliminarVisible = false">
            <div class="modal-eliminar">
                <h2>¿Eliminar empresa?</h2>
                <p>¿Estás seguro de eliminar <strong>{{ empresaAEliminar?.nombre }}</strong>? Se eliminarán todos sus usuarios, clientes y simulaciones. Esta acción no se puede deshacer.</p>
                <div class="modal-botones">
                    <button class="btn-cancelar" @click="modalEliminarVisible = false">Cancelar</button>
                    <button class="btn-confirmar-eliminar" @click="ejecutarEliminar" :disabled="cargandoEliminar">
                        {{ cargandoEliminar ? 'Eliminando...' : 'Sí, eliminar' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/authStore';
import empresasApi from '../api/empresasApi';
import logoSolarEye from '../../../assets/images/LogoSolarEye.png';

const router = useRouter();
const authStore = useAuthStore();

const empresas = ref<any[]>([]);
const cargando = ref(false);
const error = ref('');
const mensaje = ref('');
const modalEliminarVisible = ref(false);
const empresaAEliminar = ref<any>(null);
const cargandoEliminar = ref(false);

const mostrarMensaje = (msg: string) => {
    mensaje.value = msg;
    setTimeout(() => mensaje.value = '', 3000);
};

const formatearFecha = (fecha: string) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-MX', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
};

const traeEmpresas = async () => {
    try {
        cargando.value = true;
        const resp = await empresasApi.get('/');
        empresas.value = resp.data;
    } catch {
        error.value = 'No se pudieron cargar las empresas';
    } finally {
        cargando.value = false;
    }
};

const toggleActivo = async (e: any) => {
    try {
        await empresasApi.put('/', { ...e, activo: !e.activo });
        mostrarMensaje(`Empresa ${!e.activo ? 'activada' : 'desactivada'} correctamente`);
        await traeEmpresas();
    } catch {
        error.value = 'No se pudo cambiar el estado de la empresa';
    }
};

const confirmarEliminar = (e: any) => {
    empresaAEliminar.value = e;
    modalEliminarVisible.value = true;
};

const ejecutarEliminar = async () => {
    if (!empresaAEliminar.value) return;
    try {
        cargandoEliminar.value = true;
        await empresasApi.delete('/', { data: { id: empresaAEliminar.value.id } });
        modalEliminarVisible.value = false;
        empresaAEliminar.value = null;
        mostrarMensaje('Empresa eliminada correctamente');
        await traeEmpresas();
    } catch {
        error.value = 'No se pudo eliminar la empresa';
    } finally {
        cargandoEliminar.value = false;
    }
};

const cerrarSesionHandler = () => {
    authStore.cerrarSesion();
    router.push('/login');
};

onMounted(() => traeEmpresas());
</script>

<style scoped>
.contenedor { padding: 0 0 2rem; max-width: 1200px; margin: 0 auto; }

.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0.9rem 1.25rem;
    margin: 0 calc(50% - 50vw) 1.75rem;
    width: 100vw;
    background: #04142c;
    border-radius: 0;
    box-shadow: 0 10px 24px rgba(15, 47, 99, 0.18);
    flex-wrap: wrap;
}

.navbar-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 0 0 auto;
}

.navbar-logo {
    display: block;
    height: 36px;
    width: auto;
    object-fit: contain;
}

.navbar-links,
.navbar-user {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}

.navbar-user {
    margin-left: auto;
    justify-content: flex-end;
}

.navbar-user-name {
    color: white;
    font-weight: 600;
    white-space: nowrap;
}

.nav-link {
    padding: 0;
    background: transparent;
    color: white;
    border: none;
    outline: none;
    cursor: pointer;
    font-weight: 600;
    text-decoration: none;
    line-height: 1.2;
    transition: opacity 0.2s ease;
}

.nav-link:hover { opacity: 0.8; }

.nav-link--logout {
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1.15rem;
}

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

.btn-agregar {
    padding: 0.6rem 1.2rem;
    background-color: #FF7043;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
.btn-agregar:hover { background-color: #F4511E; }

.btn-cerrar-sesion {
    padding: 0.6rem 1.2rem;
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
.btn-cerrar-sesion:hover { background-color: #e0e0e0; }

.mensaje { padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.9rem; }
.mensaje.exito { background: #f0fdf4; color: #16a34a; }
.mensaje.error-msg { background: #fef2f2; color: #ef4444; }

.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.stat-card {
    background: white;
    border-radius: 8px;
    padding: 1.25rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    border-top: 4px solid #FF7043;
}

.stat-card h3 { margin: 0; color: #666; font-size: 0.85rem; font-weight: 600; }
.stat-valor { margin: 0.5rem 0 0; font-size: 2rem; font-weight: 700; color: #333; }

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

.empresa-info { display: flex; align-items: center; gap: 0.75rem; }
.empresa-color { width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0; }

.badge {
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: capitalize;
}
.badge.basico { background: #dbeafe; color: #1e40af; }
.badge.profesional { background: #ede9fe; color: #6d28d9; }
.badge.enterprise { background: #fef9c3; color: #854d0e; }
.badge.activo { background: #dcfce7; color: #166534; }
.badge.inactivo { background: #fee2e2; color: #991b1b; }

.acciones { display: flex; gap: 0.5rem; flex-wrap: wrap; }

.btn-editar {
    padding: 0.4rem 0.8rem;
    background-color: #f59e0b;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
}
.btn-editar:hover { background-color: #d97706; }

.btn-toggle {
    padding: 0.4rem 0.8rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
}
.btn-toggle.desactivar { background-color: #e5e7eb; color: #374151; }
.btn-toggle.desactivar:hover { background-color: #d1d5db; }
.btn-toggle.activar { background-color: #22c55e; color: white; }
.btn-toggle.activar:hover { background-color: #16a34a; }

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

.sin-datos { text-align: center; padding: 3rem; color: #999; }

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
    max-width: 450px;
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

@media (max-width: 960px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
    .contenedor { padding: 1rem; }
    .encabezado { flex-direction: column; align-items: flex-start; }
    .acciones-header { width: 100%; }
    .btn-agregar, .btn-cerrar-sesion { flex: 1; text-align: center; }
    .stats-grid { grid-template-columns: 1fr 1fr; }
}
</style>