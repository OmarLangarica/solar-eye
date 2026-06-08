<template>
    <div class="contenedor">
        <nav class="navbar">
            <div class="navbar-brand">
                <img class="navbar-logo" :src="logoSolarEye" alt="Solar Eye" />
            </div>

            <div class="navbar-links">
                <button class="nav-link" @click="router.push('/inventario')">← Volver</button>
            </div>

            <div class="navbar-user">
                <span class="navbar-user-name">{{ authStore.usuario?.nombre }} {{ authStore.usuario?.apellido }}</span>
                <button class="nav-link" @click="cambiarEmpresa" aria-label="Cambiar de Empresa" title="Cambiar de Empresa"><i class="bi bi-building-down"></i></button>
                <button class="nav-link nav-link--logout" @click="cerrarSesion" aria-label="Cerrar sesión" title="Cerrar sesión">
                    <i class="bi bi-box-arrow-right" aria-hidden="true"></i>
                </button>
            </div>
        </nav>

        <div class="encabezado">
            <div>
                <h1>Movimientos de inventario</h1>
                <p>Historial completo de entradas y salidas</p>
            </div>
        </div>

        <!-- Filtros -->
        <div class="filtros">
            <select v-model="tipoFiltro" class="select-filtro">
                <option value="">Todos los tipos</option>
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
                <option value="venta">Venta</option>
                <option value="reserva">Reserva</option>
                <option value="ajuste">Ajuste</option>
                <option value="devolucion">Devolución</option>
            </select>
            <input v-model="busqueda" type="text" placeholder="Buscar por producto o usuario..." class="input-busqueda" />
        </div>

        <div class="tabla-container">
            <div v-if="cargando" class="sin-datos">Cargando movimientos...</div>
            <table v-else-if="movimientosFiltrados.length > 0">
                <thead>
                    <tr>
                        <th>FECHA</th>
                        <th>TIPO</th>
                        <th>PRODUCTO</th>
                        <th>CANTIDAD</th>
                        <th>PRECIO UNIT.</th>
                        <th>TOTAL</th>
                        <th>USUARIO</th>
                        <th>MOTIVO</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="m in movimientosFiltrados" :key="m.id">
                        <td class="texto-fecha">{{ formatearFecha(m.created_at) }}</td>
                        <td>
                            <span class="badge-tipo" :class="m.tipo">{{ m.tipo }}</span>
                        </td>
                        <td>
                            <div class="producto-nombre">{{ m.producto_nombre }}</div>
                            <div class="producto-unidad">{{ m.unidad }}</div>
                        </td>
                        <td>
                            <span class="cantidad" :class="['entrada','devolucion'].includes(m.tipo) ? 'positivo' : 'negativo'">
                                {{ ['entrada','devolucion'].includes(m.tipo) ? '+' : '-' }}{{ m.cantidad }}
                            </span>
                        </td>
                        <td>${{ Number(m.precio_unitario).toLocaleString('es-MX', { minimumFractionDigits: 2 }) }}</td>
                        <td>${{ Number(m.total).toLocaleString('es-MX', { minimumFractionDigits: 2 }) }}</td>
                        <td>{{ m.usuario_nombre }} {{ m.usuario_apellido }}</td>
                        <td class="texto-motivo">{{ m.motivo ?? '—' }}</td>
                    </tr>
                </tbody>
            </table>
            <div v-else class="sin-datos">No hay movimientos registrados.</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/authStore';
import { useAuth } from '../../auth/controladores/useAuth';
import inventarioApi from '../api/inventarioApi';
import logoSolarEye from '../../../assets/images/LogoSolarEye.png';

const router = useRouter();
const authStore = useAuthStore();
const { cerrarSesion } = useAuth();
const empresa_id = authStore.usuario?.empresa_id;
const esAdmin = authStore.usuario?.rol_empresa === 'admin';

const cambiarEmpresa = () => {
    router.push('/seleccionar-empresa');
};

const movimientos = ref<any[]>([]);
const cargando = ref(false);
const busqueda = ref('');
const tipoFiltro = ref('');

const formatearFecha = (fecha: string) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-MX', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

const movimientosFiltrados = computed(() => {
    let lista = movimientos.value;
    if (tipoFiltro.value) lista = lista.filter(m => m.tipo === tipoFiltro.value);
    if (busqueda.value) {
        const b = busqueda.value.toLowerCase();
        lista = lista.filter(m =>
            m.producto_nombre?.toLowerCase().includes(b) ||
            `${m.usuario_nombre} ${m.usuario_apellido}`.toLowerCase().includes(b)
        );
    }
    return lista;
});

onMounted(async () => {
    if (!empresa_id) return;
    cargando.value = true;
    const resp = await inventarioApi.get(`/movimientos/${empresa_id}?limite=200`);
    movimientos.value = resp.data;
    cargando.value = false;
});
</script>

<style scoped>
.contenedor { padding: 2rem; max-width: 1300px; margin: 0 auto; }

.navbar {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 1rem;
    padding: 0.9rem 1.25rem;
    margin: -2rem calc(50% - 50vw) 1.75rem;
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

.encabezado { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.encabezado h1 { font-size: 1.8rem; color: #333; margin: 0; }
.encabezado p { color: #666; font-size: 0.9rem; margin: 0.25rem 0 0; }
.filtros { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.input-busqueda { flex: 1; padding: 0.75rem 1rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem; outline: none; min-width: 200px; }
.input-busqueda:focus { border-color: #FF7043; }
.select-filtro { padding: 0.75rem 1rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem; outline: none; background: white; cursor: pointer; min-width: 160px; }
.select-filtro:focus { border-color: #FF7043; }
.tabla-container { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
thead { background-color: #f5f5f5; }
th { padding: 1rem; text-align: left; font-size: 0.85rem; color: #666; font-weight: 600; }
td { padding: 0.85rem 1rem; border-top: 1px solid #f0f0f0; font-size: 0.875rem; }
tr:hover td { background-color: #fafafa; }
.texto-fecha { color: #666; font-size: 0.8rem; white-space: nowrap; }
.badge-tipo { padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.78rem; font-weight: 600; text-transform: capitalize; }
.badge-tipo.entrada { background: #dcfce7; color: #16a34a; }
.badge-tipo.salida { background: #fef2f2; color: #ef4444; }
.badge-tipo.venta { background: #fef9c3; color: #854d0e; }
.badge-tipo.reserva { background: #ede9fe; color: #6d28d9; }
.badge-tipo.ajuste { background: #fff7ed; color: #c2410c; }
.badge-tipo.devolucion { background: #dbeafe; color: #1e40af; }
.producto-nombre { font-weight: 600; color: #333; }
.producto-unidad { font-size: 0.75rem; color: #999; }
.cantidad { font-weight: 700; }
.cantidad.positivo { color: #16a34a; }
.cantidad.negativo { color: #ef4444; }
.texto-motivo { color: #666; font-size: 0.82rem; max-width: 200px; }
.sin-datos { text-align: center; padding: 3rem; color: #999; }

@media (max-width: 768px) {
    .contenedor { padding: 1rem; }

    .navbar {
        align-items: flex-start;
    }

    .navbar-links,
    .navbar-user {
        width: 100%;
        justify-content: flex-start;
        gap: 0.85rem;
    }

    .navbar-user {
        margin-left: 0;
    }

    .navbar-logo {
        height: 32px;
    }

    .nav-link {
        font-size: 0.92rem;
    }

    .filtros { flex-direction: column; }
}
</style>