<template>
    <div class="dashboard-container">
        <div class="encabezado">
            <div>
                <h1>Dashboard</h1>
                <p>Resumen general de clientes y simulaciones</p>
            </div>
            <div class="acciones-header">
                <button class="btn-principal" @click="router.push('/clientes')">Gestionar clientes</button>
                <button class="btn-secundario" @click="router.push('/clientes/agregar')">+ Nuevo cliente</button>
            </div>
        </div>

        <div class="mensaje error-msg" v-if="error">{{ error }}</div>

        <div v-if="cargando" class="estado-carga">Cargando dashboard...</div>

        <template v-else>
            <section class="kpis">
                <article class="kpi-card clients">
                    <h2>Clientes</h2>
                    <p class="kpi-valor">{{ resumen.totalClientes }}</p>
                    <p class="kpi-detalle">Activos en tu cuenta</p>
                </article>

                <article class="kpi-card sims">
                    <h2>Simulaciones</h2>
                    <p class="kpi-valor">{{ resumen.totalSimulaciones }}</p>
                    <p class="kpi-detalle">Registradas en total</p>
                </article>

                <article class="kpi-card completed">
                    <h2>Completadas</h2>
                    <p class="kpi-valor">{{ resumen.simulacionesCompletadas }}</p>
                    <p class="kpi-detalle">Con resultados listos</p>
                </article>

                <article class="kpi-card draft">
                    <h2>Borrador</h2>
                    <p class="kpi-valor">{{ resumen.simulacionesBorrador }}</p>
                    <p class="kpi-detalle">Pendientes de terminar</p>
                </article>

                <article class="kpi-card quote">
                    <h2>Cotizadas</h2>
                    <p class="kpi-valor">{{ resumen.simulacionesCotizadas }}</p>
                    <p class="kpi-detalle">Listas para propuesta</p>
                </article>

                <article class="kpi-card average">
                    <h2>Promedio / cliente</h2>
                    <p class="kpi-valor">{{ promedioSimulaciones }}</p>
                    <p class="kpi-detalle">Simulaciones por cliente</p>
                </article>
            </section>

            <section class="paneles-info">
                <article class="panel card-resumen">
                    <h3>Distribucion de estados</h3>
                    <div class="barra-grupo">
                        <div class="barra-item">
                            <span>Completadas</span>
                            <strong>{{ porcentaje('completada') }}%</strong>
                        </div>
                        <div class="barra-track">
                            <div class="barra-fill completada" :style="{ width: `${porcentaje('completada')}%` }"></div>
                        </div>
                    </div>

                    <div class="barra-grupo">
                        <div class="barra-item">
                            <span>Borrador</span>
                            <strong>{{ porcentaje('borrador') }}%</strong>
                        </div>
                        <div class="barra-track">
                            <div class="barra-fill borrador" :style="{ width: `${porcentaje('borrador')}%` }"></div>
                        </div>
                    </div>

                    <div class="barra-grupo">
                        <div class="barra-item">
                            <span>Cotizadas</span>
                            <strong>{{ porcentaje('cotizada') }}%</strong>
                        </div>
                        <div class="barra-track">
                            <div class="barra-fill cotizada" :style="{ width: `${porcentaje('cotizada')}%` }"></div>
                        </div>
                    </div>
                </article>

                <article class="panel card-top-clientes">
                    <h3>Clientes con mas simulaciones</h3>
                    <ul v-if="topClientes.length > 0">
                        <li v-for="cliente in topClientes" :key="cliente.id">
                            <div>
                                <p class="nombre-cliente">{{ cliente.nombreCompleto }}</p>
                                <p class="subtexto">{{ cliente.ciudad || 'Sin ciudad registrada' }}</p>
                            </div>
                            <span class="badge">{{ cliente.totalSimulaciones }}</span>
                        </li>
                    </ul>
                    <p v-else class="sin-datos">Todavia no hay simulaciones para mostrar ranking.</p>
                </article>
            </section>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import clientesApi from '../../clientes/api/clientesApi';
import simulacionesApi from '../../simulaciones/api/simulacionesApi';
import { useAuthStore } from '../../../stores/authStore';
import type { Cliente } from '../../clientes/interfaces/clientes-interface';
import type { Simulacion } from '../../simulaciones/interfaces/simulaciones-interface';

type EstadoSimulacion = Simulacion['estado'];

interface ClienteConTotal {
    id: number;
    nombreCompleto: string;
    ciudad: string | null;
    totalSimulaciones: number;
}

const router = useRouter();
const authStore = useAuthStore();

const cargando = ref(false);
const error = ref<string | null>(null);
const resumen = ref({
    totalClientes: 0,
    totalSimulaciones: 0,
    simulacionesCompletadas: 0,
    simulacionesBorrador: 0,
    simulacionesCotizadas: 0
});
const clientesConConteo = ref<ClienteConTotal[]>([]);

const promedioSimulaciones = computed(() => {
    if (resumen.value.totalClientes === 0) return '0.0';
    return (resumen.value.totalSimulaciones / resumen.value.totalClientes).toFixed(1);
});

const topClientes = computed(() => {
    return [...clientesConConteo.value]
        .sort((a, b) => b.totalSimulaciones - a.totalSimulaciones)
        .slice(0, 5);
});

const porcentaje = (estado: EstadoSimulacion) => {
    if (resumen.value.totalSimulaciones === 0) return 0;

    const contadorPorEstado: Record<EstadoSimulacion, number> = {
        completada: resumen.value.simulacionesCompletadas,
        borrador: resumen.value.simulacionesBorrador,
        cotizada: resumen.value.simulacionesCotizadas
    };

    return Math.round((contadorPorEstado[estado] / resumen.value.totalSimulaciones) * 100);
};

const traeDashboard = async () => {
    const usuario_id = authStore.usuario?.id;
    if (!usuario_id) {
        error.value = 'No se encontro el usuario autenticado.';
        return;
    }

    try {
        cargando.value = true;
        error.value = null;

        const respuestaClientes = await clientesApi.get<Cliente[]>(`/usuario/${usuario_id}`);
        const clientes = respuestaClientes.data;

        if (clientes.length === 0) {
            resumen.value = {
                totalClientes: 0,
                totalSimulaciones: 0,
                simulacionesCompletadas: 0,
                simulacionesBorrador: 0,
                simulacionesCotizadas: 0
            };
            clientesConConteo.value = [];
            return;
        }

        const simulacionesPorCliente = await Promise.all(
            clientes.map(async (cliente) => {
                const respuesta = await simulacionesApi.get<Simulacion[]>(`/cliente/${cliente.id}`);
                return {
                    cliente,
                    simulaciones: respuesta.data
                };
            })
        );

        let totalSimulaciones = 0;
        let simulacionesCompletadas = 0;
        let simulacionesBorrador = 0;
        let simulacionesCotizadas = 0;

        const conteoClientes = simulacionesPorCliente.map(({ cliente, simulaciones }) => {
            totalSimulaciones += simulaciones.length;
            simulacionesCompletadas += simulaciones.filter((sim) => sim.estado === 'completada').length;
            simulacionesBorrador += simulaciones.filter((sim) => sim.estado === 'borrador').length;
            simulacionesCotizadas += simulaciones.filter((sim) => sim.estado === 'cotizada').length;

            return {
                id: cliente.id,
                nombreCompleto: `${cliente.nombre} ${cliente.apellido}`,
                ciudad: cliente.ciudad,
                totalSimulaciones: simulaciones.length
            };
        });

        resumen.value = {
            totalClientes: clientes.length,
            totalSimulaciones,
            simulacionesCompletadas,
            simulacionesBorrador,
            simulacionesCotizadas
        };
        clientesConConteo.value = conteoClientes;
    } catch (err) {
        error.value = 'No se pudo cargar la informacion del dashboard.';
    } finally {
        cargando.value = false;
    }
};

onMounted(() => {
    void traeDashboard();
});
</script>

<style scoped>
.dashboard-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.encabezado {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.encabezado h1 {
    margin: 0;
    color: #1f2937;
    font-size: 1.9rem;
}

.encabezado p {
    margin: 0.25rem 0 0;
    color: #6b7280;
}

.acciones-header {
    display: flex;
    gap: 0.75rem;
}

.btn-principal,
.btn-secundario {
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    padding: 0.6rem 1rem;
}

.btn-principal {
    background: #ff7043;
    color: #fff;
}

.btn-principal:hover {
    background: #f4511e;
}

.btn-secundario {
    border: 1px solid #d1d5db;
    background: #fff;
    color: #374151;
}

.btn-secundario:hover {
    background: #f9fafb;
}

.mensaje.error-msg {
    border-radius: 8px;
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
    background: #fef2f2;
    color: #dc2626;
}

.estado-carga {
    text-align: center;
    color: #6b7280;
    padding: 2.5rem;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.kpis {
    display: grid;
    grid-template-columns: repeat(3, minmax(220px, 1fr));
    gap: 1rem;
}

.kpi-card {
    background: #fff;
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    border-top: 4px solid transparent;
}

.kpi-card.clients { border-top-color: #2563eb; }
.kpi-card.sims { border-top-color: #06b6d4; }
.kpi-card.completed { border-top-color: #16a34a; }
.kpi-card.draft { border-top-color: #f59e0b; }
.kpi-card.quote { border-top-color: #8b5cf6; }
.kpi-card.average { border-top-color: #ef4444; }

.kpi-card h2 {
    margin: 0;
    color: #6b7280;
    font-size: 0.9rem;
    font-weight: 600;
}

.kpi-valor {
    margin: 0.45rem 0;
    color: #111827;
    font-size: 2rem;
    font-weight: 700;
}

.kpi-detalle {
    margin: 0;
    color: #6b7280;
    font-size: 0.85rem;
}

.paneles-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-top: 1rem;
}

.panel {
    background: #fff;
    border-radius: 12px;
    padding: 1.2rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.panel h3 {
    margin: 0 0 1rem;
    color: #1f2937;
    font-size: 1.05rem;
}

.barra-grupo + .barra-grupo {
    margin-top: 1rem;
}

.barra-item {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    color: #374151;
    margin-bottom: 0.4rem;
}

.barra-track {
    width: 100%;
    height: 8px;
    background: #e5e7eb;
    border-radius: 999px;
    overflow: hidden;
}

.barra-fill {
    height: 100%;
    border-radius: 999px;
}

.barra-fill.completada { background: #16a34a; }
.barra-fill.borrador { background: #f59e0b; }
.barra-fill.cotizada { background: #3b82f6; }

.card-top-clientes ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.card-top-clientes li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 0;
    border-bottom: 1px solid #f1f5f9;
}

.card-top-clientes li:last-child {
    border-bottom: none;
    padding-bottom: 0;
}

.nombre-cliente {
    margin: 0;
    color: #111827;
    font-weight: 600;
}

.subtexto {
    margin: 0.2rem 0 0;
    color: #6b7280;
    font-size: 0.85rem;
}

.badge {
    background: #fff7ed;
    color: #c2410c;
    border-radius: 999px;
    padding: 0.2rem 0.7rem;
    font-weight: 700;
}

.sin-datos {
    color: #6b7280;
    font-size: 0.9rem;
}

@media (max-width: 960px) {
    .kpis {
        grid-template-columns: repeat(2, minmax(180px, 1fr));
    }

    .paneles-info {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 640px) {
    .dashboard-container {
        padding: 1rem;
    }

    .encabezado {
        flex-direction: column;
        align-items: flex-start;
    }

    .acciones-header {
        width: 100%;
    }

    .btn-principal,
    .btn-secundario {
        width: 100%;
    }

    .kpis {
        grid-template-columns: 1fr;
    }
}
</style>
