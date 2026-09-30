<template>
    <div class="dashboard-container">
      <nav class="navbar">
    <div class="navbar-brand">
        <img class="navbar-logo" :src="logoSolarEye" alt="Solar Eye" />
    </div>

    <button
        type="button"
        class="navbar-toggle"
        :aria-expanded="menuAbierto"
        aria-controls="navbar-panel"
        :aria-label="menuAbierto ? 'Cerrar menú' : 'Abrir menú'"
        @click="menuAbierto = !menuAbierto"
    >
        <i class="bi" :class="menuAbierto ? 'bi-x-lg' : 'bi-list'" aria-hidden="true"></i>
    </button>

    <div id="navbar-panel" class="navbar-panel" :class="{ 'navbar-panel--abierto': menuAbierto }">
        <div class="navbar-links">
            <button class="nav-link" @click="ir('/dashboard')">Dashboard Personal</button>
            <button class="nav-link" @click="ir('/clientes')">Clientes</button>
            <button class="nav-link" @click="ir('/admin/usuarios')">Empleados</button>
            <button class="nav-link" @click="ir('/inventario')">Inventario</button>
            <button class="nav-link" @click="ir('/admin/catalogo')">Componentes</button>
            <button class="nav-link" @click="ir('/citas')">Citas</button>
            <button class="nav-link" @click="ir('/admin/perfil')">Perfil</button>
        </div>

        <div class="navbar-user">
            <span class="navbar-user-name">{{ authStore.usuario?.nombre }} {{ authStore.usuario?.apellido }}</span>
            <button class="nav-link" @click="cambiarEmpresa" aria-label="Cambiar de Empresa" title="Cambiar de Empresa"><i class="bi bi-building-down"></i></button>
            <button class="nav-link nav-link--logout" @click="cerrarSesion" aria-label="Cerrar sesión" title="Cerrar sesión">
                <i class="bi bi-box-arrow-right" aria-hidden="true"></i>
            </button>
        </div>
    </div>
</nav>

        <div class="mensaje error-msg" v-if="error">{{ error }}</div>
        <div v-if="cargando" class="estado-carga">Cargando dashboard...</div>

        <template v-else>

            <section class="kpi-groups">
                <div class="kpi-group">
                    <div class="section-kicker">Impacto del negocio</div>
                    <div class="kpis">
                        <article class="kpi-card"><h2>Clientes totales</h2><p class="kpi-valor">{{ stats.totalClientes }}</p><p class="kpi-detalle">En todo el sistema</p></article>
                        <article class="kpi-card"><h2>Ahorro total generado</h2><p class="kpi-valor">${{ formatearNumero(stats.ahorroTotal) }}</p><p class="kpi-detalle">MXN en vida útil</p></article>
                        <article class="kpi-card"><h2>Producción proyectada</h2><p class="kpi-valor">{{ formatearNumero(stats.produccionTotal) }}</p><p class="kpi-detalle">kWh anuales totales</p></article>
                    </div>
                </div>
                <div class="kpi-group">
                    <div class="section-kicker">Operación</div>
                    <div class="kpis">
                        <article class="kpi-card"><h2>Trabajadores activos</h2><p class="kpi-valor">{{ stats.totalTrabajadores }}</p><p class="kpi-detalle">Usuarios activos</p></article>
                        <article class="kpi-card"><h2>Simulaciones</h2><p class="kpi-valor">{{ stats.totalSimulaciones }}</p><p class="kpi-detalle">Registradas en total</p></article>
                        <article class="kpi-card"><h2>Borradores</h2><p class="kpi-valor">{{ simulacionesPorEstado('borrador') }}</p><p class="kpi-detalle">Pendientes de terminar</p></article>
                    </div>
                </div>
            </section>

            <section class="paneles-info">

                <!-- Distribución de estados -->
                <article class="panel card-resumen">
                    <h3>Distribución de estados</h3>
                    <div class="donut-layout">
                        <div class="donut" :style="{ background: gradienteEstados }" aria-label="Distribución porcentual de estados"><span>{{ stats.totalSimulaciones }}</span><small>total</small></div>
                        <div class="donut-legend">
                            <div><i class="legend-dot completada"></i><span>Completadas</span><strong>{{ porcentaje('completada') }}%</strong></div>
                            <div><i class="legend-dot borrador"></i><span>Borradores</span><strong>{{ porcentaje('borrador') }}%</strong></div>
                            <div><i class="legend-dot cotizada"></i><span>Cotizadas</span><strong>{{ porcentaje('cotizada') }}%</strong></div>
                        </div>
                    </div>
                </article>

                <!-- Simulaciones por mes -->
                <article class="panel card-meses">
                    <h3>Simulaciones últimos 6 meses</h3>
                    <div class="grafica-area" v-if="stats.simulacionesPorMes.length">
                        <svg viewBox="0 0 600 180" role="img" aria-label="Tendencia de simulaciones mensuales" preserveAspectRatio="none"><path class="area-fill" :d="areaPath" /><polyline class="area-line" :points="linePoints" /><circle v-for="punto in puntosGrafica" :key="punto.mes" class="area-point" :cx="punto.x" :cy="punto.y" r="4" /></svg>
                        <div class="area-labels"><span v-for="mes in stats.simulacionesPorMes" :key="mes.mes">{{ formatearMes(mes.mes) }} <strong>{{ mes.total }}</strong></span></div>
                    </div>
                    <p v-else class="sin-datos">Sin simulaciones mensuales todavía.</p>
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
                                <td><div class="simulaciones-cell"><span class="mini-bar"><i :style="{ width: `${anchoBarraTrabajador(t.total_simulaciones)}%` }"></i></span><span class="badge-blue">{{ t.total_simulaciones }}</span></div></td>
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
                            <span class="count-badge"><strong>{{ cliente.total_simulaciones }}</strong><small>simulaciones</small></span>
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
import logoSolarEye from '../../../assets/images/LogoSolarEye.png';

const router = useRouter();
const { cerrarSesion } = useAuth();
const authStore = useAuthStore();

const cargando = ref(false);
const menuAbierto = ref(false);
const ir = (ruta: string) => {
    menuAbierto.value = false;
    router.push(ruta);
};
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

const gradienteEstados = computed(() => {
    const completadas = porcentaje('completada');
    const borradores = completadas + porcentaje('borrador');
    return `conic-gradient(#16a34a 0 ${completadas}%, #f59e0b ${completadas}% ${borradores}%, #3b82f6 ${borradores}% 100%)`;
});

const puntosGrafica = computed(() => {
    const meses = stats.value.simulacionesPorMes;
    const maximo = Math.max(...meses.map(mes => mes.total), 1);
    return meses.map((mes, indice) => ({
        mes: mes.mes,
        x: meses.length === 1 ? 300 : (indice / (meses.length - 1)) * 560 + 20,
        y: 150 - (mes.total / maximo) * 120
    }));
});

const linePoints = computed(() => puntosGrafica.value.map(punto => `${punto.x},${punto.y}`).join(' '));
const areaPath = computed(() => {
    if (!puntosGrafica.value.length) return '';
    const primero = puntosGrafica.value[0]!;
    const ultimo = puntosGrafica.value[puntosGrafica.value.length - 1]!;
    return `M ${primero.x} 150 L ${puntosGrafica.value.map(punto => `${punto.x} ${punto.y}`).join(' L ')} L ${ultimo.x} 150 Z`;
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

const anchoBarraTrabajador = (total: number) => {
    const maximo = Math.max(...stats.value.clientesPorTrabajador.map(trabajador => trabajador.total_simulaciones), 1);
    return (total / maximo) * 100;
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
    padding: 0 0 2rem;
}

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
.navbar-panel {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
}

.navbar-toggle {
    display: none;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    font-size: 1.5rem;
    color: #fff;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 10px;
    cursor: pointer;
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
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
}

.kpi-groups { display: grid; gap: 1.35rem; margin-bottom: 1.5rem; }
.section-kicker { margin: 0 0 0.55rem 0.15rem; color: #31527e; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }

.kpi-card {
    background: #fff;
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    border: 1px solid #e2e8f0;
    border-left: 3px solid #123b6d;
}

.kpi-card h2 { margin: 0; color: #6b7280; font-size: 0.9rem; font-weight: 600; }
.kpi-valor { margin: 0.45rem 0; color: #111827; font-size: 1.8rem; font-weight: 700; }
.kpi-detalle { margin: 0; color: #6b7280; font-size: 0.85rem; }

.paneles-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.35rem;
}

.panel {
    background: #fff;
    border-radius: 12px;
    padding: 1.2rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

.panel h3 { margin: 0 0 1rem; color: #1f2937; font-size: 1.05rem; }

.donut-layout { display: flex; align-items: center; gap: 1.5rem; min-height: 150px; }
.donut { width: 132px; height: 132px; flex: 0 0 auto; display: grid; place-content: center; text-align: center; border-radius: 50%; position: relative; }
.donut::after { content: ''; position: absolute; inset: 18px; background: #fff; border-radius: 50%; }
.donut span, .donut small { position: relative; z-index: 1; }
.donut span { color: #082951; font-size: 1.35rem; font-weight: 800; }
.donut small { color: #64748b; font-size: 0.72rem; }
.donut-legend { display: grid; gap: 0.75rem; width: 100%; }
.donut-legend div { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 0.5rem; color: #475569; font-size: 0.85rem; }
.donut-legend strong { color: #0f2747; }
.legend-dot { width: 9px; height: 9px; border-radius: 50%; }
.legend-dot.completada { background: #16a34a; }
.legend-dot.borrador { background: #f59e0b; }
.legend-dot.cotizada { background: #3b82f6; }

.grafica-area { height: 165px; }
.grafica-area svg { width: 100%; height: 132px; overflow: visible; }
.area-fill { fill: rgba(37, 99, 235, 0.12); }
.area-line { fill: none; stroke: #1d5fa7; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
.area-point { fill: #fff; stroke: #1d5fa7; stroke-width: 3; }
.area-labels { display: flex; justify-content: space-between; color: #64748b; font-size: 0.72rem; }
.area-labels strong { display: block; color: #0f2747; font-size: 0.75rem; text-align: center; }

/* Tabla trabajadores */
.tabla-trabajadores { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.tabla-trabajadores th { text-align: left; padding: 0.5rem 0.75rem; color: #6b7280; font-size: 0.8rem; border-bottom: 1px solid #f0f0f0; }
.tabla-trabajadores td { padding: 0.6rem 0.75rem; border-bottom: 1px solid #f9fafb; color: #333; }
.tabla-trabajadores tr:last-child td { border-bottom: none; }

.badge-blue { background: #dbeafe; color: #1e40af; border-radius: 999px; padding: 0.2rem 0.7rem; font-weight: 700; font-size: 0.85rem; }
.badge-orange { background: #fff7ed; color: #c2410c; border-radius: 999px; padding: 0.2rem 0.7rem; font-weight: 700; font-size: 0.85rem; }
.simulaciones-cell { display: flex; align-items: center; gap: 0.5rem; min-width: 130px; }
.mini-bar { height: 6px; width: 70px; background: #e5edf7; border-radius: 999px; overflow: hidden; }
.mini-bar i { display: block; height: 100%; background: #1d5fa7; border-radius: inherit; }

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
.badge { background: #e0e7ff; color: #3730a3; border-radius: 999px; padding: 0.2rem 0.7rem; font-weight: 700; }
.count-badge { display: grid; justify-items: center; min-width: 66px; padding: 0.3rem 0.5rem; border-radius: 10px; background: #edf4fb; color: #123b6d; }
.count-badge strong { font-size: 1rem; line-height: 1; }
.count-badge small { margin-top: 0.15rem; font-size: 0.62rem; }
.sin-datos { color: #6b7280; font-size: 0.9rem; }

@media (max-width: 1100px) {
    .kpis { grid-template-columns: repeat(3, 1fr); }
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
    .kpis { grid-template-columns: 1fr; }
    .donut-layout { gap: 1rem; }
}
@media (max-width: 1024px) {
    .navbar-toggle {
        display: inline-flex;
        margin-left: auto;
    }

    .navbar-panel {
        display: none;
        flex-basis: 100%;
        flex-direction: column;
        align-items: stretch;
        gap: 0;
        padding-top: 0.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.15);
    }

    .navbar-panel--abierto {
        display: flex;
    }

    .navbar-links {
        flex-direction: column;
        align-items: stretch;
        gap: 0;
    }

    .navbar-links .nav-link {
        text-align: left;
        padding: 0.9rem 0;
        font-size: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .navbar-user {
        flex-wrap: nowrap;
        margin-left: 0;
        padding-top: 0.75rem;
        gap: 0.5rem;
    }

    .navbar-user-name {
        margin-right: auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .navbar-user .nav-link {
        padding: 0.5rem;
        font-size: 1.25rem;
    }
}
</style>