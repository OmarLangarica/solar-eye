<template>
    <div class="contenedor">
        <div class="encabezado">
            <div>
                <h1>Simulaciones</h1>
                <p>Cliente: <strong>{{ route.query.nombre }}</strong></p>
            </div>
            <div class="acciones-header">
                <button class="btn-agregar" @click="nuevaSimulacion">+ Nueva simulación</button>
                <button class="btn-volver" @click="router.push('/clientes')">← Volver</button>
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
                            <button class="btn-ver" @click="verResultados(sim.id)">Ver resultados</button>
                            <button class="btn-eliminar" @click="confirmarEliminar(sim)">Eliminar</button>
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

const router = useRouter();
const route = useRoute();
const { simulaciones, cargando, error, mensaje, traeSimulacionesPorCliente, borrarSimulacion } = useSimulaciones();

const cliente_id = Number(route.params.cliente_id);
const modalEliminarVisible = ref(false);
const simAEliminar = ref<Simulacion | null>(null);

const nuevaSimulacion = () => {
    router.push({
        path: `/simulaciones/nueva/${cliente_id}`,
        query: { nombre: route.query.nombre }
    });
};

const verResultados = (simulacion_id: number) => {
    router.push({
        path: `/simulaciones/resultados/${simulacion_id}`,
        query: { nombre: route.query.nombre }
    });
};

const confirmarEliminar = (sim: Simulacion) => {
    simAEliminar.value = sim;
    modalEliminarVisible.value = true;
};

const ejecutarEliminar = async () => {
    if (simAEliminar.value) {
        await borrarSimulacion(simAEliminar.value.id);
        modalEliminarVisible.value = false;
        simAEliminar.value = null;
        await traeSimulacionesPorCliente(cliente_id);
    }
};

onMounted(() => traeSimulacionesPorCliente(cliente_id));
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