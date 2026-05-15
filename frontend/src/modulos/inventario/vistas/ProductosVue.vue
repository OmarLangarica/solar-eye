<template>
    <div class="contenedor">
        <nav class="navbar">
            <div class="navbar-brand">
                <img class="navbar-logo" :src="logoSolarEye" alt="Solar Eye" />
            </div>

            <div class="navbar-links">
                <button v-if="esAdmin" class="nav-link" @click="router.push('/inventario/productos/agregar')">+ Nuevo producto</button>
                <button class="nav-link" @click="router.push('/inventario')">← Volver</button>
            </div>
        </nav>

        <div class="encabezado">
            <div>
                <h1>Productos</h1>
                <p>Catálogo de productos del inventario</p>
            </div>
        </div>

        <!-- Filtros -->
        <div class="filtros">
            <input v-model="busqueda" type="text" placeholder="Buscar producto..." class="input-busqueda" />
            <select v-model="categoriaFiltro" class="select-filtro">
                <option value="">Todas las categorías</option>
                <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
            </select>
            <select v-model="stockFiltro" class="select-filtro">
                <option value="">Todo el stock</option>
                <option value="bajo">Bajo stock</option>
                <option value="ok">Stock OK</option>
            </select>
        </div>

        <div class="tabla-container">
            <div v-if="cargando" class="sin-datos">Cargando productos...</div>

            <div v-else-if="errorCarga" class="sin-datos error-carga">{{ errorCarga }}</div>

            <table v-else-if="productosFiltrados.length > 0">
                <thead>
                    <tr>
                        <th>PRODUCTO</th>
                        <th>CATEGORÍA</th>
                        <th>STOCK</th>
                        <th>PRECIO COMPRA</th>
                        <th>PRECIO VENTA</th>
                        <th>ESTADO</th>
                        <th>ACCIONES</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="p in productosFiltrados" :key="p.id">
                        <td>
                            <div class="producto-nombre">{{ p.nombre }}</div>
                            <div class="producto-sub">{{ p.marca ?? '' }} {{ p.modelo ?? '' }}</div>
                        </td>
                        <td>
                            <span class="badge-cat">{{ p.categoria_nombre ?? 'Sin categoría' }}</span>
                        </td>
                        <td>
                            <div class="stock-info">
                                <span class="stock-valor" :class="p.stock_actual <= p.stock_minimo ? 'bajo' : 'ok'">
                                    {{ p.stock_actual }} {{ p.unidad }}
                                </span>
                                <div class="stock-barra">
                                    <div class="stock-fill"
                                        :class="p.stock_actual <= p.stock_minimo ? 'bajo' : 'ok'"
                                        :style="{ width: `${Math.min((p.stock_actual / p.stock_maximo) * 100, 100)}%` }">
                                    </div>
                                </div>
                                <span class="stock-min">Mín: {{ p.stock_minimo }}</span>
                            </div>
                        </td>
                        <td>${{ Number(p.precio_compra).toLocaleString('es-MX') }}</td>
                        <td>${{ Number(p.precio_venta).toLocaleString('es-MX') }}</td>
                        <td>
                            <span class="badge" :class="p.activo ? 'activo' : 'inactivo'">
                                {{ p.activo ? 'Activo' : 'Inactivo' }}
                            </span>
                        </td>
                        <td class="acciones">
                            <button class="btn-accion verde" @click="abrirMovimiento(p, 'entrada')" title="Registrar entrada" aria-label="Registrar entrada">
                                <i class="bi bi-box-arrow-in-down" aria-hidden="true"></i>
                            </button>
                            <button class="btn-accion rojo" @click="abrirMovimiento(p, 'salida')" title="Registrar salida" aria-label="Registrar salida">
                                <i class="bi bi-box-arrow-up" aria-hidden="true"></i>
                            </button>
                            <button class="btn-accion azul" @click="router.push(`/inventario/productos/${p.id}/movimientos`)" title="Ver movimientos" aria-label="Ver movimientos">
                                <i class="bi bi-card-checklist" aria-hidden="true"></i>
                            </button>
                            <button v-if="esAdmin" class="btn-accion amarillo" @click="router.push(`/inventario/productos/editar/${p.id}`)" title="Editar producto" aria-label="Editar producto">
                                <i class="bi bi-pencil-square" aria-hidden="true"></i>
                            </button>
                            <button v-if="esAdmin" class="btn-accion gris" @click="confirmarEliminar(p)" title="Desactivar producto" aria-label="Desactivar producto">
                                <i class="bi bi-trash" aria-hidden="true"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div v-else class="sin-datos">No se encontraron productos.</div>
        </div>

        <!-- Modal movimiento -->
        <Teleport to="body">
            <div v-if="modalMovimiento" class="overlay overlay-movimiento" @click.self="modalMovimiento = false">
                <div class="modal-movimiento">
                <h2>
                    <i :class="formMov.tipo === 'entrada' ? 'bi bi-box-arrow-in-down' : 'bi bi-box-arrow-up'" aria-hidden="true"></i>
                    {{ formMov.tipo === 'entrada' ? 'Registrar Entrada' : 'Registrar Salida' }}
                </h2>
                <div class="formulario">
                    <div class="grupo">
                        <label>Producto</label>
                        <input :value="productoSeleccionado?.nombre" disabled />
                    </div>
                    <div class="grupo">
                        <label>Tipo</label>
                        <select v-model="formMov.tipo">
                            <option value="entrada">Entrada (compra/recepción)</option>
                            <option value="salida">Salida (uso en instalación)</option>
                            <option value="venta">Venta</option>
                            <option value="ajuste">Ajuste de inventario</option>
                            <option value="devolucion">Devolución</option>
                        </select>
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
                        <input v-model="formMov.motivo" type="text" placeholder="Ej: Compra proveedor, instalación..." />
                    </div>
                    <div class="grupo">
                        <label>Notas (opcional)</label>
                        <textarea v-model="formMov.notas" rows="2" placeholder="Notas adicionales..."></textarea>
                    </div>
                </div>
                <div class="modal-botones">
                    <button class="btn-cancelar" @click="modalMovimiento = false">Cancelar</button>
                    <button class="btn-confirmar" @click="registrarMovimiento" :disabled="guardando">
                        {{ guardando ? 'Guardando...' : 'Registrar movimiento' }}
                    </button>
                </div>
            </div>
            </div>
        </Teleport>

        <!-- Modal eliminar -->
        <div v-if="modalEliminar" class="overlay" @click.self="modalEliminar = false">
            <div class="modal">
                <h2>¿Desactivar producto?</h2>
                <p>¿Deseas desactivar <strong>{{ productoAEliminar?.nombre }}</strong>? El producto no se eliminará, solo se marcará como inactivo.</p>
                <div class="modal-botones">
                    <button class="btn-cancelar" @click="modalEliminar = false">Cancelar</button>
                    <button class="btn-eliminar" @click="ejecutarEliminar" :disabled="guardando">
                        {{ guardando ? 'Procesando...' : 'Sí, desactivar' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/authStore';
import inventarioApi from '../api/inventarioApi';
import logoSolarEye from '../../../assets/images/LogoSolarEye.png';

const router = useRouter();
const authStore = useAuthStore();
const esAdmin = authStore.usuario?.rol_empresa === 'admin';
const empresa_id = authStore.usuario?.empresa_id;

const productos = ref<any[]>([]);
const categorias = ref<any[]>([]);
const cargando = ref(false);
const busqueda = ref('');
const categoriaFiltro = ref('');
const stockFiltro = ref('');
const modalMovimiento = ref(false);
const modalEliminar = ref(false);
const productoSeleccionado = ref<any>(null);
const productoAEliminar = ref<any>(null);
const guardando = ref(false);
const errorCarga = ref('');

const formMov = reactive({
    tipo: 'entrada' as string,
    cantidad: 1,
    precio_unitario: 0,
    motivo: '',
    notas: ''
});

const productosFiltrados = computed(() => {
    let lista = productos.value;
    if (busqueda.value) {
        const b = busqueda.value.toLowerCase();
        lista = lista.filter(p =>
            p.nombre.toLowerCase().includes(b) ||
            p.marca?.toLowerCase().includes(b) ||
            p.modelo?.toLowerCase().includes(b)
        );
    }
    if (categoriaFiltro.value) {
        lista = lista.filter(p => p.categoria_id === Number(categoriaFiltro.value));
    }
    if (stockFiltro.value === 'bajo') {
        lista = lista.filter(p => p.stock_actual <= p.stock_minimo);
    } else if (stockFiltro.value === 'ok') {
        lista = lista.filter(p => p.stock_actual > p.stock_minimo);
    }
    return lista;
});

const abrirMovimiento = (producto: any, tipo: string) => {
    productoSeleccionado.value = producto;
    formMov.tipo = tipo;
    formMov.cantidad = 1;
    formMov.precio_unitario = tipo === 'entrada' ? producto.precio_compra : producto.precio_venta;
    formMov.motivo = '';
    formMov.notas = '';
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
            motivo: formMov.motivo,
            notas: formMov.notas
        });
        modalMovimiento.value = false;
        await cargarProductos();
    } catch {
        alert('Error al registrar el movimiento');
    } finally {
        guardando.value = false;
    }
};

const confirmarEliminar = (p: any) => {
    productoAEliminar.value = p;
    modalEliminar.value = true;
};

const ejecutarEliminar = async () => {
    if (!productoAEliminar.value) return;
    try {
        guardando.value = true;
        await inventarioApi.delete('/productos', {
            data: { id: productoAEliminar.value.id, empresa_id }
        });
        modalEliminar.value = false;
        await cargarProductos();
    } catch {
        alert('Error al desactivar el producto');
    } finally {
        guardando.value = false;
    }
};

const cargarProductos = async () => {
    if (!empresa_id) return;
    cargando.value = true;
    errorCarga.value = '';

    try {
        const [prodsResp, catsResp] = await Promise.allSettled([
            inventarioApi.get(`/productos/${empresa_id}`),
            inventarioApi.get(`/categorias/${empresa_id}`)
        ]);

        if (prodsResp.status === 'fulfilled') {
            productos.value = prodsResp.value.data;
        } else {
            console.error('Error al cargar productos:', prodsResp.reason);
            productos.value = [];
            errorCarga.value = 'No se pudieron cargar los productos.';
        }

        if (catsResp.status === 'fulfilled') {
            categorias.value = catsResp.value.data;
        } else {
            console.error('Error al cargar categorías:', catsResp.reason);
        }
    } finally {
        cargando.value = false;
    }
};

onMounted(() => cargarProductos());
</script>

<style scoped>
.contenedor { padding: 2rem; max-width: 1300px; margin: 0 auto; }

.navbar {
    display: flex;
    justify-content: space-between;
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

.navbar-brand { display: flex; align-items: center; gap: 0.75rem; flex: 0 0 auto; }
.navbar-logo { display: block; height: 36px; width: auto; object-fit: contain; }
.navbar-links { display: flex; align-items: center; flex-wrap: wrap; gap: 1rem; margin-left: auto; }
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
.acciones-header { display: flex; gap: 0.75rem; }

.btn-principal { padding: 0.6rem 1.2rem; background-color: #FF7043; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-principal:hover { background-color: #F4511E; }
.btn-secundario { padding: 0.6rem 1.2rem; background-color: #f5f5f5; color: #333; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-secundario:hover { background-color: #e0e0e0; }

.filtros { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }

.input-busqueda {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.95rem;
    outline: none;
    min-width: 200px;
}
.input-busqueda:focus { border-color: #FF7043; }

.select-filtro {
    padding: 0.75rem 1rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.95rem;
    outline: none;
    background: white;
    cursor: pointer;
    min-width: 180px;
}
.select-filtro:focus { border-color: #FF7043; }

.tabla-container { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
thead { background-color: #f5f5f5; }
th { padding: 1rem; text-align: left; font-size: 0.85rem; color: #666; font-weight: 600; }
td { padding: 0.85rem 1rem; border-top: 1px solid #f0f0f0; font-size: 0.9rem; color: #333; }
tr:hover td { background-color: #fafafa; }

.producto-nombre { font-weight: 600; color: #333; }
.producto-sub { font-size: 0.75rem; color: #999; margin-top: 0.1rem; }

.badge-cat {
    background: #f0f4ff;
    color: #3b4fd8;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 600;
}

.stock-info { display: flex; flex-direction: column; gap: 0.2rem; }
.stock-valor { font-weight: 700; font-size: 0.875rem; }
.stock-valor.bajo { color: #ef4444; }
.stock-valor.ok { color: #16a34a; }
.stock-barra { height: 4px; background: #f0f0f0; border-radius: 999px; width: 80px; overflow: hidden; }
.stock-fill { height: 100%; border-radius: 999px; }
.stock-fill.bajo { background: #ef4444; }
.stock-fill.ok { background: #22c55e; }
.stock-min { font-size: 0.7rem; color: #999; }

.badge { padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.8rem; font-weight: 600; }
.badge.activo { background: #dcfce7; color: #166534; }
.badge.inactivo { background: #fee2e2; color: #991b1b; }

.acciones { display: flex; gap: 0.3rem; }
.btn-accion { width: 32px; height: 32px; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; }
.btn-accion.verde { background: #dcfce7; }
.btn-accion.verde:hover { background: #bbf7d0; }
.btn-accion.rojo { background: #fee2e2; }
.btn-accion.rojo:hover { background: #fecaca; }
.btn-accion.azul { background: #dbeafe; }
.btn-accion.azul:hover { background: #bfdbfe; }
.btn-accion.amarillo { background: #fef9c3; }
.btn-accion.amarillo:hover { background: #fef08a; }
.btn-accion.gris { background: #f5f5f5; }
.btn-accion.gris:hover { background: #e0e0e0; }

.sin-datos { text-align: center; padding: 3rem; color: #999; }
.error-carga { color: #b91c1c; }

.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.overlay-movimiento { padding: 1rem; }
.modal-movimiento { background: white; border-radius: 12px; padding: 2rem; width: 90%; max-width: 480px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); position: relative; z-index: 10000; display: block; }
.modal h2 { margin: 0 0 1.5rem; color: #333; font-size: 1.3rem; }
.modal p { color: #666; margin-bottom: 1.5rem; line-height: 1.5; }

.formulario { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
.grupo { display: flex; flex-direction: column; gap: 0.4rem; }
.grupo label { font-size: 0.875rem; font-weight: 600; color: #333; }
.grupo input, .grupo select, .grupo textarea { padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 0.95rem; outline: none; font-family: inherit; }
.grupo input:focus, .grupo select:focus, .grupo textarea:focus { border-color: #FF7043; }
.grupo input:disabled { background: #f5f5f5; color: #666; }

.modal-botones { display: flex; justify-content: flex-end; gap: 0.75rem; }
.btn-cancelar { padding: 0.6rem 1.2rem; background: #f5f5f5; color: #333; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-confirmar { padding: 0.6rem 1.2rem; background: #FF7043; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-confirmar:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-eliminar { padding: 0.6rem 1.2rem; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-eliminar:disabled { opacity: 0.6; cursor: not-allowed; }

@media (max-width: 768px) {
    .contenedor { padding: 1rem; }
    .encabezado { flex-direction: column; align-items: flex-start; }
    .filtros { flex-direction: column; }
    .input-busqueda, .select-filtro { width: 100%; }
}
</style>