<template>
    <div class="contenedor">
        <div class="encabezado">
            <div>
                <h1>Inventario</h1>
                <p>Gestión de materiales y productos de {{ authStore.usuario?.empresa_nombre }}</p>
            </div>
            <div class="acciones-header">
                <button v-if="esAdmin" class="btn-secundario" @click="router.push('/inventario/categorias')">
                    <i class="bi bi-folder2-open" aria-hidden="true"></i> Categorías
                </button>
                <button v-if="esAdmin" class="btn-principal" @click="router.push('/inventario/productos/agregar')">
                    + Nuevo producto
                </button>
                <button class="btn-volver" @click="router.push('/clientes')">← Volver</button>
            </div>
        </div>

        <!-- KPIs -->
        <div class="kpis" v-if="stats">
            <div class="kpi-card">
                <div class="kpi-icono"><i class="bi bi-box-seam" aria-hidden="true"></i></div>
                <div class="kpi-info">
                    <span class="kpi-label">Total productos</span>
                    <span class="kpi-valor">{{ stats.totalProductos }}</span>
                </div>
            </div>
            <div class="kpi-card alerta" v-if="stats.productosBajoStock > 0">
                <div class="kpi-icono"><i class="bi bi-exclamation-triangle" aria-hidden="true"></i></div>
                <div class="kpi-info">
                    <span class="kpi-label">Bajo stock</span>
                    <span class="kpi-valor">{{ stats.productosBajoStock }}</span>
                </div>
            </div>
            <div class="kpi-card" v-else>
                <div class="kpi-icono"><i class="bi bi-check-circle" aria-hidden="true"></i></div>
                <div class="kpi-info">
                    <span class="kpi-label">Bajo stock</span>
                    <span class="kpi-valor">0</span>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icono"><i class="bi bi-cash-coin" aria-hidden="true"></i></div>
                <div class="kpi-info">
                    <span class="kpi-label">Valor inventario</span>
                    <span class="kpi-valor">${{ formatearNumero(stats.valorInventario) }}</span>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icono"><i class="bi bi-box-arrow-in-down" aria-hidden="true"></i></div>
                <div class="kpi-info">
                    <span class="kpi-label">Entradas este mes</span>
                    <span class="kpi-valor">{{ stats.entradasMes }}</span>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icono"><i class="bi bi-box-arrow-up" aria-hidden="true"></i></div>
                <div class="kpi-info">
                    <span class="kpi-label">Salidas este mes</span>
                    <span class="kpi-valor">{{ stats.salidasMes }}</span>
                </div>
            </div>
        </div>

        <div class="grid-principal">
            <!-- Productos con bajo stock -->
            <div class="card">
                <div class="card-header">
                    <h3><i class="bi bi-exclamation-triangle" aria-hidden="true"></i> Productos con bajo stock</h3>
                    <button class="btn-link" @click="router.push('/inventario/productos')">
                        Ver todos →
                    </button>
                </div>
                <div v-if="productosBajoStock.length === 0" class="sin-datos">
                    <i class="bi bi-check-circle" aria-hidden="true"></i> Todos los productos tienen stock suficiente
                </div>
                <table v-else>
                    <thead>
                        <tr>
                            <th>PRODUCTO</th>
                            <th>STOCK</th>
                            <th>MÍNIMO</th>
                            <th>ACCIÓN</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="p in productosBajoStock" :key="p.id">
                            <td>
                                <div class="producto-nombre">{{ p.nombre }}</div>
                                <div class="producto-marca">{{ p.marca ?? '—' }}</div>
                            </td>
                            <td>
                                <span class="badge-stock critico">{{ p.stock_actual }} {{ p.unidad }}</span>
                            </td>
                            <td class="texto-gris">{{ p.stock_minimo }}</td>
                            <td>
                                <button class="btn-mini" @click="abrirMovimiento(p, 'entrada')">
                                    + Entrada
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Últimos movimientos -->
            <div class="card">
                <div class="card-header">
                    <h3><i class="bi bi-arrow-repeat" aria-hidden="true"></i> Últimos movimientos</h3>
                    <button class="btn-link" @click="router.push('/inventario/movimientos')">
                        Ver todos →
                    </button>
                </div>
                <div v-if="movimientos.length === 0" class="sin-datos">
                    No hay movimientos registrados
                </div>
                <div v-else class="lista-movimientos">
                    <div v-for="m in movimientos.slice(0, 8)" :key="m.id" class="movimiento-item">
                        <div class="mov-icono" :class="m.tipo">
                            <i :class="iconoMovimiento(m.tipo)" aria-hidden="true"></i>
                        </div>
                        <div class="mov-info">
                            <span class="mov-producto">{{ m.producto_nombre }}</span>
                            <span class="mov-detalle">
                                {{ m.usuario_nombre }} {{ m.usuario_apellido }} •
                                {{ formatearFecha(m.created_at) }}
                            </span>
                        </div>
                        <div class="mov-cantidad" :class="m.tipo">
                            {{ ['entrada','devolucion'].includes(m.tipo) ? '+' : '-' }}{{ m.cantidad }}
                            <span class="mov-tipo-badge" :class="m.tipo">{{ m.tipo }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal movimiento rápido -->
        <Teleport to="body">
            <div v-if="modalMovimiento" class="overlay overlay-movimiento" @click.self="modalMovimiento = false">
                <div class="modal-movimiento">
                <h2>Registrar {{ formMov.tipo === 'entrada' ? 'Entrada' : 'Salida' }}</h2>
                <div class="formulario">
                    <div class="grupo">
                        <label>Producto</label>
                        <input :value="productoSeleccionado?.nombre" disabled />
                    </div>
                    <div class="grupo">
                        <label>Cantidad *</label>
                        <input v-model.number="formMov.cantidad" type="number" min="1" />
                    </div>
                    <div class="grupo">
                        <label>Precio unitario (MXN)</label>
                        <input v-model.number="formMov.precio_unitario" type="number" min="0" step="0.01" />
                    </div>
                    <div class="grupo">
                        <label>Motivo</label>
                        <input v-model="formMov.motivo" type="text" placeholder="Motivo del movimiento" />
                    </div>
                </div>
                <div class="modal-botones">
                    <button class="btn-cancelar" @click="modalMovimiento = false">Cancelar</button>
                    <button class="btn-confirmar" @click="registrarMovimiento" :disabled="guardando">
                        {{ guardando ? 'Guardando...' : 'Registrar' }}
                    </button>
                </div>
            </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/authStore';
import inventarioApi from '../api/inventarioApi';

const router = useRouter();
const authStore = useAuthStore();
const esAdmin = authStore.usuario?.rol_empresa === 'admin';
const empresa_id = authStore.usuario?.empresa_id;

const stats = ref<any>(null);
const productosBajoStock = ref<any[]>([]);
const movimientos = ref<any[]>([]);
const modalMovimiento = ref(false);
const productoSeleccionado = ref<any>(null);
const guardando = ref(false);

const formMov = reactive({
    tipo: 'entrada' as 'entrada' | 'salida',
    cantidad: 1,
    precio_unitario: 0,
    motivo: ''
});

const formatearNumero = (n: number) =>
    Number(n).toLocaleString('es-MX', { maximumFractionDigits: 0 });

const formatearFecha = (fecha: string) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const iconoMovimiento = (tipo: string) => {
    const iconos: Record<string, string> = {
        entrada: 'bi bi-box-arrow-in-down',
        salida: 'bi bi-box-arrow-up',
        ajuste: 'bi bi-tools',
        reserva: 'bi bi-lock',
        venta: 'bi bi-cash',
        devolucion: 'bi bi-arrow-counterclockwise'
    };
    return iconos[tipo] ?? 'bi bi-box-seam';
};

const abrirMovimiento = (producto: any, tipo: 'entrada' | 'salida') => {
    productoSeleccionado.value = producto;
    formMov.tipo = tipo;
    formMov.cantidad = 1;
    formMov.precio_unitario = tipo === 'entrada' ? producto.precio_compra : producto.precio_venta;
    formMov.motivo = '';
    modalMovimiento.value = true;
};

const registrarMovimiento = async () => {
    if (!productoSeleccionado.value || formMov.cantidad < 1) return;
    try {
        guardando.value = true;
        await inventarioApi.post('/movimientos', {
            empresa_id,
            producto_id: productoSeleccionado.value.id,
            usuario_id: authStore.usuario?.id,
            tipo: formMov.tipo,
            cantidad: formMov.cantidad,
            precio_unitario: formMov.precio_unitario,
            total: formMov.cantidad * formMov.precio_unitario,
            motivo: formMov.motivo
        });
        modalMovimiento.value = false;
        await cargarDatos();
    } catch {
        alert('Error al registrar el movimiento');
    } finally {
        guardando.value = false;
    }
};

const cargarDatos = async () => {
    if (!empresa_id) return;
    const [statsResp, bajoStockResp, movsResp] = await Promise.all([
        inventarioApi.get(`/estadisticas/${empresa_id}`),
        inventarioApi.get(`/productos/${empresa_id}/bajo-stock`),
        inventarioApi.get(`/movimientos/${empresa_id}?limite=8`)
    ]);
    stats.value = statsResp.data;
    productosBajoStock.value = bajoStockResp.data;
    movimientos.value = movsResp.data;
};

onMounted(() => cargarDatos());
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

.acciones-header { display: flex; gap: 0.75rem; flex-wrap: wrap; }

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

.btn-link {
    background: none;
    border: none;
    color: #FF7043;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
}
.btn-link:hover { text-decoration: underline; }

.btn-mini {
    padding: 0.3rem 0.6rem;
    background-color: #22c55e;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
}
.btn-mini:hover { background-color: #16a34a; }

/* KPIs */
.kpis {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.kpi-card {
    background: white;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border-left: 4px solid #FF7043;
}

.kpi-card.alerta { border-left-color: #ef4444; }

.kpi-icono { font-size: 1.8rem; }
.kpi-info { display: flex; flex-direction: column; }
.kpi-label { font-size: 0.75rem; color: #666; }
.kpi-valor { font-size: 1.4rem; font-weight: 700; color: #333; }

/* Grid principal */
.grid-principal {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.card-header h3 { margin: 0; font-size: 1rem; color: #333; }

table { width: 100%; border-collapse: collapse; }
th { padding: 0.5rem; text-align: left; font-size: 0.8rem; color: #666; border-bottom: 1px solid #f0f0f0; }
td { padding: 0.6rem 0.5rem; border-bottom: 1px solid #f9f9f9; font-size: 0.875rem; }

.producto-nombre { font-weight: 600; color: #333; }
.producto-marca { font-size: 0.75rem; color: #999; }
.texto-gris { color: #999; }

.badge-stock {
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 600;
}
.badge-stock.critico { background: #fef2f2; color: #ef4444; }
.badge-stock.ok { background: #f0fdf4; color: #16a34a; }

/* Movimientos */
.lista-movimientos { display: flex; flex-direction: column; gap: 0.5rem; }

.movimiento-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    border-radius: 6px;
    background: #fafafa;
}

.mov-icono { font-size: 1.3rem; width: 32px; text-align: center; }
.mov-info { flex: 1; display: flex; flex-direction: column; }
.mov-producto { font-size: 0.875rem; font-weight: 600; color: #333; }
.mov-detalle { font-size: 0.75rem; color: #999; }

.mov-cantidad {
    font-weight: 700;
    font-size: 0.9rem;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.2rem;
}
.mov-cantidad.entrada, .mov-cantidad.devolucion { color: #16a34a; }
.mov-cantidad.salida, .mov-cantidad.venta, .mov-cantidad.reserva { color: #ef4444; }
.mov-cantidad.ajuste { color: #f59e0b; }

.mov-tipo-badge {
    font-size: 0.65rem;
    padding: 0.1rem 0.4rem;
    border-radius: 999px;
    font-weight: 600;
    text-transform: capitalize;
}
.mov-tipo-badge.entrada { background: #dcfce7; color: #16a34a; }
.mov-tipo-badge.salida { background: #fef2f2; color: #ef4444; }
.mov-tipo-badge.venta { background: #fef9c3; color: #854d0e; }
.mov-tipo-badge.reserva { background: #ede9fe; color: #6d28d9; }
.mov-tipo-badge.ajuste { background: #fff7ed; color: #c2410c; }
.mov-tipo-badge.devolucion { background: #dbeafe; color: #1e40af; }

.sin-datos { text-align: center; padding: 2rem; color: #999; font-size: 0.9rem; }

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

.overlay-movimiento {
    padding: 1rem;
}

.modal-movimiento {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    width: 90%;
    max-width: 450px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    position: relative;
    z-index: 10000;
    display: block;
}

.modal h2 { margin: 0 0 1.5rem; color: #333; font-size: 1.3rem; }

.formulario { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
.grupo { display: flex; flex-direction: column; gap: 0.4rem; }
.grupo label { font-size: 0.875rem; font-weight: 600; color: #333; }
.grupo input {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 0.95rem;
    outline: none;
}
.grupo input:focus { border-color: #FF7043; }
.grupo input:disabled { background: #f5f5f5; color: #666; }

.modal-botones { display: flex; justify-content: flex-end; gap: 0.75rem; }

.btn-cancelar {
    padding: 0.6rem 1.2rem;
    background: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}

.btn-confirmar {
    padding: 0.6rem 1.2rem;
    background: #FF7043;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
.btn-confirmar:disabled { opacity: 0.6; cursor: not-allowed; }

@media (max-width: 1024px) {
    .kpis { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
    .contenedor { padding: 1rem; }
    .encabezado { flex-direction: column; align-items: flex-start; }
    .acciones-header { width: 100%; }
    .kpis { grid-template-columns: 1fr 1fr; }
    .grid-principal { grid-template-columns: 1fr; }
}
</style>