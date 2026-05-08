<template>
    <div class="contenedor">
        <div class="encabezado">
            <div>
                <h1>Simulaciones</h1>
                <p>Cliente: <strong>{{ route.query.nombre }}</strong></p>
            </div>
            <div class="acciones-header">
                <button v-if="!soloConsulta" class="btn-secundario" @click="cambiarEmpresa">Cambiar de empresa</button>
                <button v-if="!soloConsulta" class="btn-agregar" @click="nuevaSimulacion">+ Nueva simulación</button>
                <button class="btn-volver" @click="volver">← Volver</button>
            </div>
        </div>

        <div class="mensaje exito" v-if="mensaje">{{ mensaje }}</div>
        <div class="mensaje error-msg" v-if="error">{{ error }}</div>

        <div class="tabla-container">
            <div v-if="cargando" class="sin-datos">Cargando simulaciones...</div>

            <table v-else-if="simulaciones.length > 0">
                <thead>
                    <tr>
                        <th>PROYECTO</th>
                        <th>DESCRIPCIÓN</th>
                        <th>ESTADO</th>
                        <th>ACCIONES</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="sim in simulaciones" :key="sim.id">
                        <td>{{ sim.nombre_proyecto ?? '—' }}</td>
                        <td>{{ sim.descripcion ?? '—' }}</td>
                        <td>
                            <span class="badge" :class="sim.estado">{{ sim.estado }}</span>
                        </td>
                        <td class="acciones">
                            <button
                                v-if="sim.estado === 'completada'"
                                class="btn-ver"
                                @click="verResultados(sim.id)"
                            >Ver resultados</button>
                            <template v-if="!soloConsulta">
                                <button
                                    v-if="sim.estado === 'borrador'"
                                    class="btn-continuar"
                                    @click="continuarSimulacion(sim.id)"
                                    :disabled="cargandoContinuar === sim.id"
                                >
                                    {{ cargandoContinuar === sim.id ? '...' : 'Continuar' }}
                                </button>
                                <button class="btn-eliminar" @click="confirmarEliminar(sim)">Eliminar</button>
                            </template>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div v-else class="sin-datos">Este cliente no tiene simulaciones aún.</div>
        </div>

        <Teleport to="body">
            <div v-if="modalEliminarVisible" class="overlay" @click.self="modalEliminarVisible = false">
                <div class="modal-eliminar">
                    <h2>¿Eliminar simulación?</h2>
                    <p>¿Estás seguro de eliminar <strong>{{ simAEliminar?.nombre_proyecto }}</strong>? Esta acción no se puede deshacer.</p>
                    <div class="modal-botones">
                        <button class="btn-cancelar" @click="modalEliminarVisible = false">Cancelar</button>
                        <button class="btn-confirmar-eliminar" @click="ejecutarEliminar" :disabled="cargando">
                            {{ cargando ? 'Eliminando...' : 'Sí, eliminar' }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useSimulaciones } from '../controladores/useSimulaciones';
import type { Simulacion } from '../interfaces/simulaciones-interface';
import clientesApi from '../../clientes/api/clientesApi';
import { useAuthStore } from '../../../stores/authStore';

const router = useRouter();
const route = useRoute();
const { simulaciones, cargando, error, mensaje, traeSimulacionesPorCliente, borrarSimulacion, detectaPasoActual } = useSimulaciones();
const authStore = useAuthStore();

const cliente_id = Number(route.params.cliente_id);
const soloConsulta = route.query.readonly === '1';
const modalEliminarVisible = ref(false);
const simAEliminar = ref<Simulacion | null>(null);
const cargandoContinuar = ref<number | null>(null);

const cambiarEmpresa = () => {
    router.push('/seleccionar-empresa');
};

const volver = () => {
    if (soloConsulta) {
        router.push('/admin/clientes');
        return;
    }

    router.push('/clientes');
};

const nuevaSimulacion = () => {
    router.push({
        path: `/simulaciones/nueva/${cliente_id}`,
        query: { nombre: route.query.nombre }
    });
};

const verResultados = (simulacion_id: number) => {
    const returnTo = soloConsulta
        ? `/simulaciones/${cliente_id}?nombre=${encodeURIComponent(String(route.query.nombre ?? ''))}&readonly=1`
        : `/simulaciones/${cliente_id}?nombre=${encodeURIComponent(String(route.query.nombre ?? ''))}`;

    router.push({
        path: `/simulaciones/resultados/${simulacion_id}`,
        query: {
            nombre: route.query.nombre,
            cliente_id,
            returnTo
        }
    });
};

const confirmarEliminar = (sim: Simulacion) => {
    simAEliminar.value = sim;
    modalEliminarVisible.value = true;
};

const ejecutarEliminar = async () => {
    if (soloConsulta) return;

    if (simAEliminar.value) {
        await borrarSimulacion(simAEliminar.value.id);
        modalEliminarVisible.value = false;
        simAEliminar.value = null;
        await traeSimulacionesPorCliente(cliente_id);
    }
};

const continuarSimulacion = async (simulacion_id: number) => {
    cargandoContinuar.value = simulacion_id;
    const paso = await detectaPasoActual(simulacion_id);
    cargandoContinuar.value = null;

    if (paso === 1) {
        router.push({
            path: `/simulaciones/nueva/${cliente_id}/${simulacion_id}`,
            query: { nombre: route.query.nombre }
        });
        return;
    }

    if (paso === 2) {
        router.push({
            path: `/simulaciones/nueva/${cliente_id}/paso2/${simulacion_id}`,
            query: { nombre: route.query.nombre }
        });
        return;
    }

    if (paso === 3) {
        router.push({
            path: `/simulaciones/nueva/${cliente_id}/paso3/${simulacion_id}`,
            query: { nombre: route.query.nombre }
        });
        return;
    }

    // paso 4 o 5 → ir a resultados
    router.push({
        path: `/simulaciones/resultados/${simulacion_id}`,
        query: { nombre: route.query.nombre, cliente_id }
    });
};

onMounted(async () => {
    
    const empresaId = authStore.usuario?.empresa_id;

    if (!empresaId) {
        error.value = 'No hay empresa activa seleccionada';
        router.push('/seleccionar-empresa');
        return;
    }

    try {
        const clienteResp = await clientesApi.get(`/${cliente_id}`);
        const cliente = Array.isArray(clienteResp.data) ? clienteResp.data[0] : clienteResp.data;

        if (!cliente || cliente.empresa_id !== empresaId) {
            error.value = 'No tienes acceso a este cliente';
            router.push('/clientes');
            return;
        }
    } catch (e) {
        error.value = 'No se pudo validar el cliente';
        router.push('/clientes');
        return;
    }

    await traeSimulacionesPorCliente(cliente_id);
});
</script>

<style scoped>
.contenedor { padding: 2rem; max-width: 1200px; margin: 0 auto; }

.encabezado {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.encabezado h1 { font-size: 1.8rem; color: #333; margin: 0; }
.encabezado p { color: #666; font-size: 0.9rem; margin: 0.25rem 0 0; }

.acciones-header { display: flex; gap: 1rem; }

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

.btn-secundario {
    padding: 0.6rem 1.2rem;
    background-color: white;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: background-color 0.2s;
}
.btn-secundario:hover { background-color: #f5f5f5; }

.btn-volver {
    padding: 0.6rem 1.2rem;
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
.btn-volver:hover { background-color: #e0e0e0; }

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
.badge.borrador { background: #fef9c3; color: #854d0e; }
.badge.completada { background: #dcfce7; color: #166534; }
.badge.cotizada { background: #dbeafe; color: #1e40af; }

.acciones { display: flex; gap: 0.5rem; }

.btn-ver {
    padding: 0.4rem 0.8rem;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
}
.btn-ver:hover { background-color: #2563eb; }

.btn-continuar {
    padding: 0.4rem 0.8rem;
    background-color: #22c55e;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: background-color 0.2s;
}
.btn-continuar:hover { background-color: #16a34a; }
.btn-continuar:disabled { opacity: 0.6; cursor: not-allowed; }

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
@media (max-width: 768px) {
    .contenedor { padding: 1rem; }

    .encabezado { flex-direction: column; align-items: flex-start; gap: 1rem; }
    .acciones-header { width: 100%; justify-content: space-between; }
    .btn-agregar, .btn-volver { flex: 1; padding: 0.5rem; text-align: center; }

    .tabla-container {
        box-shadow: none;
        background: transparent;
        overflow: visible !important;
    }

    table, tbody, tr, td { display: block; box-sizing: border-box; }
    table { width: 100% !important; min-width: 0 !important; }
    thead { display: none; }

    tr {
        display: grid;
        grid-template-columns: 1fr 110px;
        grid-template-rows: repeat(3, auto);
        gap: 5px;
        background: white;
        margin-bottom: 1rem;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    td { border: none; padding: 0; font-size: 0.9rem; word-break: break-word; }

    td:nth-child(1) { grid-column: 1; grid-row: 1; }
    td:nth-child(2) { grid-column: 1; grid-row: 2; }
    td:nth-child(3) { grid-column: 1; grid-row: 3; }

    td:nth-child(1)::before { content: "Proyecto: "; font-weight: 700; color: #666; }
    td:nth-child(2)::before { content: "Descripción: "; font-weight: 700; color: #666; }

    td.acciones {
        grid-column: 2;
        grid-row: 1 / 4;
        display: flex !important;
        flex-direction: column;
        justify-content: center;
        gap: 0.5rem;
        border-left: 1px solid #eee;
        padding-left: 10px;
    }

    .btn-ver { font-size: 0.75rem; padding: 0.4rem 0.3rem; }

    .acciones button { width: 100%; font-size: 0.8rem; padding: 0.5rem 0; margin: 0; }
}

@media (max-width: 480px) {
    .modal-eliminar { padding: 1.5rem; width: 95%; }
    .modal-botones { flex-direction: column; }
    .btn-cancelar, .btn-confirmar-eliminar { width: 100%; }
}
</style>

<style>
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
    position: relative;
    z-index: 10000;
}
.modal-eliminar h2 { margin: 0 0 1rem; color: #333; font-size: 1.3rem; }
.modal-eliminar p { color: #666; margin-bottom: 1.5rem; line-height: 1.5; }
.modal-botones { display: flex; justify-content: flex-end; gap: 0.75rem; }
.btn-cancelar { padding: 0.6rem 1.2rem; background-color: #f5f5f5; color: #333; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-cancelar:hover { background-color: #e0e0e0; }
.btn-confirmar-eliminar { padding: 0.6rem 1.2rem; background-color: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-confirmar-eliminar:hover { background-color: #dc2626; }
.btn-confirmar-eliminar:disabled { opacity: 0.6; cursor: not-allowed; }

</style>