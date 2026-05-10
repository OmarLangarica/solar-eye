<template>
    <div class="dashboard-container">
        <div class="encabezado">
            <div>
                <h1>Solar Eye</h1>
                <p>Panel de administración global</p>
            </div>
            <div class="acciones-header">
                <button class="btn-secundario" @click="cambiarEmpresa">Cambiar de empresa</button>
                <button class="btn-principal" @click="router.push('/admin/clientes')">Ver todos los clientes</button>
                <button class="btn-secundario" @click="router.push('/clientes')">Mis clientes</button>
                <button class="btn-principal" @click="router.push('/admin/usuarios')">Gestionar usuarios</button>
                <button class="btn-secundario" @click="router.push('/inventario')">Inventario</button>
                <button class="btn-secundario" @click="cerrarSesion">Cerrar sesión</button>
            </div>
        </div>

        <div class="mensaje error-msg" v-if="error">{{ error }}</div>
        <div v-if="cargando" class="estado-carga">Cargando dashboard...</div>

        <template v-else>

            <!-- KPIs globales -->
            <section class="kpis">
                <article class="kpi-card trabajadores">
                    <h2>Trabajadores</h2>
                    <p class="kpi-valor">{{ stats.totalTrabajadores }}</p>
                    <p class="kpi-detalle">Usuarios activos</p>
                </article>
                <article class="kpi-card clients">
                    <h2>Clientes totales</h2>
                    <p class="kpi-valor">{{ stats.totalClientes }}</p>
                    <p class="kpi-detalle">En todo el sistema</p>
                </article>
                <article class="kpi-card sims">
                    <h2>Simulaciones</h2>
                    <p class="kpi-valor">{{ stats.totalSimulaciones }}</p>
                    <p class="kpi-detalle">Registradas en total</p>
                </article>
                <article class="kpi-card completed">
                    <h2>Completadas</h2>
                    <p class="kpi-valor">{{ simulacionesPorEstado('completada') }}</p>
                    <p class="kpi-detalle">Con resultados listos</p>
                </article>
                <article class="kpi-card draft">
                    <h2>Borrador</h2>
                    <p class="kpi-valor">{{ simulacionesPorEstado('borrador') }}</p>
                    <p class="kpi-detalle">Pendientes de terminar</p>
                </article>
                <article class="kpi-card savings">
                    <h2>Ahorro total generado</h2>
                    <p class="kpi-valor">${{ formatearNumero(stats.ahorroTotal) }}</p>
                    <p class="kpi-detalle">MXN en vida útil</p>
                </article>
                <article class="kpi-card energy">
                    <h2>Producción proyectada</h2>
                    <p class="kpi-valor">{{ formatearNumero(stats.produccionTotal) }}</p>
                    <p class="kpi-detalle">kWh anuales totales</p>
                </article>
                <article class="kpi-card average">
                    <h2>Promedio / trabajador</h2>
                    <p class="kpi-valor">{{ promedioClientesPorTrabajador }}</p>
                    <p class="kpi-detalle">Clientes por trabajador</p>
                </article>
            </section>

            <section class="paneles-info">

                <!-- Distribución de estados -->
                <article class="panel card-resumen">
                    <h3>Distribución de estados</h3>
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

                <!-- Simulaciones por mes -->
                <article class="panel card-meses">
                    <h3>Simulaciones últimos 6 meses</h3>
                    <div class="grafica-barras">
                        <div
                            v-for="mes in stats.simulacionesPorMes"
                            :key="mes.mes"
                            class="barra-mes-grupo"
                        >
                            <div class="barra-mes-wrap">
                                <div
                                    class="barra-mes"
                                    :style="{ height: `${alturaBarra(mes.total)}%` }"
                                ></div>
                            </div>
                            <span class="barra-mes-label">{{ formatearMes(mes.mes) }}</span>
                            <span class="barra-mes-valor">{{ mes.total }}</span>
                        </div>
                    </div>
                </article>

                <!-- Rendimiento por trabajador -->
                <article class="panel card-trabajadores">
                    <h3>Rendimiento por trabajador</h3>
                    <table class="tabla-trabajadores">
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Rol</th>
                                <th>Clientes</th>
                                <th>Simulaciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="t in stats.clientesPorTrabajador" :key="t.id">
                                <td>{{ t.nombre }} {{ t.apellido }}</td>
                                <td>
                                    <span class="badge" :class="t.rol">{{ t.rol }}</span>
                                </td>
                                <td><span class="badge-blue">{{ t.total_clientes }}</span></td>
                                <td><span class="badge-orange">{{ t.total_simulaciones }}</span></td>
                            </tr>
                            <tr v-if="stats.clientesPorTrabajador.length === 0">
                                <td colspan="4" class="sin-datos">Sin usuarios registrados</td>
                            </tr>
                        </tbody>
                    </table>
                </article>

                <!-- Top clientes globales -->
                <article class="panel card-top-clientes">
                    <h3>Clientes con más simulaciones</h3>
                    <ul v-if="topClientes.length > 0">
                        <li v-for="cliente in topClientes" :key="cliente.id">
                            <div>
                                <p class="nombre-cliente">{{ cliente.nombre }} {{ cliente.apellido }}</p>
                                <p class="subtexto">{{ cliente.trabajador_nombre }} {{ cliente.trabajador_apellido }}</p>
                            </div>
                            <span class="badge">{{ cliente.total_simulaciones }}</span>
                        </li>
                    </ul>
                    <p v-else class="sin-datos">No hay clientes con simulaciones aún.</p>
                </article>

            </section>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../../auth/controladores/useAuth';
import adminApi from '../api/adminApi';
import { useAuthStore } from '../../../stores/authStore';

const router = useRouter();
const { cerrarSesion } = useAuth();
const authStore = useAuthStore();

const cargando = ref(false);
const error = ref('');

const stats = ref({
    totalClientes: 0,
    totalSimulaciones: 0,
    totalTrabajadores: 0,
    ahorroTotal: 0,
    produccionTotal: 0,
    simulacionesPorEstado: [] as { estado: string; total: number }[],
    simulacionesPorMes: [] as { mes: string; total: number }[],
    clientesPorTrabajador: [] as { id: number; nombre: string; apellido: string; rol: string; total_clientes: number; total_simulaciones: number }[]
});

const topClientes = ref<any[]>([]);

const simulacionesPorEstado = (estado: string) => {
    if (!stats.value.simulacionesPorEstado || !Array.isArray(stats.value.simulacionesPorEstado)) return 0;
    const encontrado = stats.value.simulacionesPorEstado.find(s => s.estado === estado);
    return encontrado ? Number(encontrado.total) : 0;
};

const porcentaje = (estado: string) => {
    if (stats.value.totalSimulaciones === 0) return 0;
    return Math.round((simulacionesPorEstado(estado) / stats.value.totalSimulaciones) * 100);
};

const promedioClientesPorTrabajador = computed(() => {
    if (stats.value.totalTrabajadores === 0) return '0.0';
    return (stats.value.totalClientes / stats.value.totalTrabajadores).toFixed(1);
});

const cambiarEmpresa = () => {
    router.push('/seleccionar-empresa');
};

const maxSimulacionesMes = computed(() => {
    if (!stats.value.simulacionesPorMes.length) return 1;
    return Math.max(...stats.value.simulacionesPorMes.map(m => m.total));
});

const alturaBarra = (total: number) => {
    if (maxSimulacionesMes.value === 0) return 0;
    return Math.round((total / maxSimulacionesMes.value) * 100);
};

const formatearMes = (mes: string) => {
    const partes = mes.split('-');
    const numero = partes[1];
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    if (!numero) return mes;
    return meses[parseInt(numero) - 1] ?? mes;
};

const formatearNumero = (num: number) => {
    if (!num) return '0';
    return Number(num).toLocaleString('es-MX', { maximumFractionDigits: 0 });
};

const traeEstadisticas = async () => {
    const empresaId = authStore.usuario?.empresa_id;
    if (!empresaId) {
        error.value = 'No hay empresa activa seleccionada';
        return;
    }

    try {
        cargando.value = true;
        error.value = '';

        const [respStats, respClientes] = await Promise.all([
            adminApi.get(`/empresa/${empresaId}/estadisticas`),
            adminApi.get('/clientes/globales')
        ]);

        stats.value = {
            totalClientes: respStats.data.totalClientes ?? 0,
            totalSimulaciones: respStats.data.totalSimulaciones ?? 0,
            totalTrabajadores: respStats.data.totalTrabajadores ?? 0,
            ahorroTotal: respStats.data.ahorroTotal ?? 0,
            produccionTotal: respStats.data.produccionTotal ?? 0,
            simulacionesPorEstado: respStats.data.simulacionesPorEstado ?? [],
            simulacionesPorMes: respStats.data.simulacionesPorMes ?? [],
            clientesPorTrabajador: respStats.data.clientesPorTrabajador ?? []
        };

        // Top 5 clientes con más simulaciones
        const clientes = (respClientes.data as any[]).filter((c: any) => c.empresa_id === empresaId);
        const conConteo = await Promise.all(
            clientes.map(async (c: any) => {
                try {
                    const resp = await adminApi.get(`/simulaciones-por-cliente/${c.id}`);
                    return { ...c, total_simulaciones: resp.data.total ?? 0 };
                } catch {
                    return { ...c, total_simulaciones: 0 };
                }
            })
        );

        topClientes.value = conConteo
            .sort((a, b) => b.total_simulaciones - a.total_simulaciones)
            .slice(0, 5);

    } catch (err) {
        error.value = 'No se pudieron cargar las estadísticas';
    } finally {
        cargando.value = false;
    }
};

onMounted(() => traeEstadisticas());
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
    flex-wrap: wrap;
}

.encabezado h1 { margin: 0; color: #1f2937; font-size: 1.9rem; }
.encabezado p { margin: 0.25rem 0 0; color: #6b7280; }

.acciones-header { display: flex; gap: 0.10rem; flex-wrap: wrap; }

.btn-principal, .btn-secundario {
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    padding: 0.6rem 1rem;
}
.btn-principal { background: #ff7043; color: #fff; }
.btn-principal:hover { background: #f4511e; }
.btn-secundario { border: 1px solid #d1d5db; background: #fff; color: #374151; }
.btn-secundario:hover { background: #f9fafb; }

.badge.admin { background: #ede9fe; color: #6d28d9; }
.badge.trabajador { background: #dbeafe; color: #1e40af; }
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
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.kpis {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 1rem;
}

.kpi-card {
    background: #fff;
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    border-top: 4px solid transparent;
}

.kpi-card.trabajadores { border-top-color: #8b5cf6; }
.kpi-card.clients { border-top-color: #2563eb; }
.kpi-card.sims { border-top-color: #06b6d4; }
.kpi-card.completed { border-top-color: #16a34a; }
.kpi-card.draft { border-top-color: #f59e0b; }
.kpi-card.savings { border-top-color: #FF7043; }
.kpi-card.energy { border-top-color: #10b981; }
.kpi-card.average { border-top-color: #ef4444; }

.kpi-card h2 { margin: 0; color: #6b7280; font-size: 0.9rem; font-weight: 600; }
.kpi-valor { margin: 0.45rem 0; color: #111827; font-size: 1.8rem; font-weight: 700; }
.kpi-detalle { margin: 0; color: #6b7280; font-size: 0.85rem; }

.paneles-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.panel {
    background: #fff;
    border-radius: 12px;
    padding: 1.2rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

.panel h3 { margin: 0 0 1rem; color: #1f2937; font-size: 1.05rem; }

.barra-grupo + .barra-grupo { margin-top: 1rem; }
.barra-item { display: flex; justify-content: space-between; font-size: 0.9rem; color: #374151; margin-bottom: 0.4rem; }
.barra-track { width: 100%; height: 8px; background: #e5e7eb; border-radius: 999px; overflow: hidden; }
.barra-fill { height: 100%; border-radius: 999px; }
.barra-fill.completada { background: #16a34a; }
.barra-fill.borrador { background: #f59e0b; }
.barra-fill.cotizada { background: #3b82f6; }

/* Gráfica de barras por mes */
.grafica-barras {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
    height: 140px;
    padding-top: 1rem;
}

.barra-mes-grupo {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    height: 100%;
}

.barra-mes-wrap {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: flex-end;
}

.barra-mes {
    width: 100%;
    background: #FF7043;
    border-radius: 4px 4px 0 0;
    min-height: 4px;
    transition: height 0.3s;
}

.barra-mes-label { font-size: 0.7rem; color: #6b7280; }
.barra-mes-valor { font-size: 0.75rem; font-weight: 700; color: #374151; }

/* Tabla trabajadores */
.tabla-trabajadores { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.tabla-trabajadores th { text-align: left; padding: 0.5rem 0.75rem; color: #6b7280; font-size: 0.8rem; border-bottom: 1px solid #f0f0f0; }
.tabla-trabajadores td { padding: 0.6rem 0.75rem; border-bottom: 1px solid #f9fafb; color: #333; }
.tabla-trabajadores tr:last-child td { border-bottom: none; }

.badge-blue { background: #dbeafe; color: #1e40af; border-radius: 999px; padding: 0.2rem 0.7rem; font-weight: 700; font-size: 0.85rem; }
.badge-orange { background: #fff7ed; color: #c2410c; border-radius: 999px; padding: 0.2rem 0.7rem; font-weight: 700; font-size: 0.85rem; }

/* Top clientes */
.card-top-clientes ul { list-style: none; padding: 0; margin: 0; }
.card-top-clientes li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 0;
    border-bottom: 1px solid #f1f5f9;
}
.card-top-clientes li:last-child { border-bottom: none; padding-bottom: 0; }
.nombre-cliente { margin: 0; color: #111827; font-weight: 600; }
.subtexto { margin: 0.2rem 0 0; color: #6b7280; font-size: 0.85rem; }
.badge { background: #fff7ed; color: #c2410c; border-radius: 999px; padding: 0.2rem 0.7rem; font-weight: 700; }
.sin-datos { color: #6b7280; font-size: 0.9rem; }

@media (max-width: 1100px) {
    .kpis { grid-template-columns: repeat(4, 1fr); }
}

@media (max-width: 960px) {
    .kpis { grid-template-columns: repeat(2, 1fr); }
    .paneles-info { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
    .dashboard-container { padding: 1rem; }
    .encabezado { flex-direction: column; align-items: flex-start; }
    .acciones-header { width: 100%; }
    .btn-principal, .btn-secundario { flex: 1; text-align: center; }
    .kpis { grid-template-columns: 1fr 1fr; }
}
</style>