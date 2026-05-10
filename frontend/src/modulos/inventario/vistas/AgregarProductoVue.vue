<template>
    <div class="contenedor">
        <div class="encabezado">
            <div>
                <h1>Nuevo producto</h1>
                <p>Agrega un producto al inventario</p>
            </div>
            <button class="btn-secundario" @click="router.push('/inventario/productos')">← Volver</button>
        </div>

        <div class="card">
            <div class="mensaje exito" v-if="mensaje">{{ mensaje }}</div>
            <div class="mensaje error-msg" v-if="error">{{ error }}</div>

            <div class="formulario">
                <div class="seccion">
                    <h3>Información general</h3>
                    <div class="fila-doble">
                        <div class="grupo">
                            <label>Nombre del producto *</label>
                            <input v-model="form.nombre" type="text" placeholder="Ej: Panel Solar 410W" />
                        </div>
                        <div class="grupo">
                            <label>Categoría</label>
                            <select v-model="form.categoria_id">
                                <option :value="null">Sin categoría</option>
                                <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
                                    {{ cat.nombre }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div class="grupo">
                        <label>Descripción</label>
                        <textarea v-model="form.descripcion" rows="3" placeholder="Descripción del producto..."></textarea>
                    </div>
                    <div class="fila-doble">
                        <div class="grupo">
                            <label>Marca</label>
                            <input v-model="form.marca" type="text" placeholder="Ej: Canadian Solar" />
                        </div>
                        <div class="grupo">
                            <label>Modelo</label>
                            <input v-model="form.modelo" type="text" placeholder="Ej: CS6R-410MS" />
                        </div>
                    </div>
                    <div class="grupo grupo-pequeno">
                        <label>Unidad de medida *</label>
                        <select v-model="form.unidad">
                            <option value="pieza">Pieza</option>
                            <option value="kit">Kit</option>
                            <option value="metro">Metro</option>
                            <option value="par">Par</option>
                            <option value="rollo">Rollo</option>
                            <option value="bolsa">Bolsa</option>
                            <option value="caja">Caja</option>
                        </select>
                    </div>
                </div>

                <div class="seccion">
                    <h3>Precios</h3>
                    <div class="fila-doble">
                        <div class="grupo">
                            <label>Precio de compra (MXN) *</label>
                            <input v-model.number="form.precio_compra" type="number" min="0" step="0.01" placeholder="0.00" />
                        </div>
                        <div class="grupo">
                            <label>Precio de venta (MXN) *</label>
                            <input v-model.number="form.precio_venta" type="number" min="0" step="0.01" placeholder="0.00" />
                        </div>
                    </div>
                    <div class="margen-info" v-if="form.precio_compra > 0 && form.precio_venta > 0">
                        <span>Margen de ganancia:</span>
                        <strong :class="margen >= 0 ? 'positivo' : 'negativo'">
                            {{ margen.toFixed(1) }}%
                        </strong>
                    </div>
                </div>

                <div class="seccion">
                    <h3>Control de stock</h3>
                    <div class="fila-triple">
                        <div class="grupo">
                            <label>Stock inicial</label>
                            <input v-model.number="form.stock_actual" type="number" min="0" placeholder="0" />
                        </div>
                        <div class="grupo">
                            <label>Stock mínimo *</label>
                            <input v-model.number="form.stock_minimo" type="number" min="0" placeholder="5" />
                            <span class="ayuda">Alerta de bajo stock</span>
                        </div>
                        <div class="grupo">
                            <label>Stock máximo *</label>
                            <input v-model.number="form.stock_maximo" type="number" min="0" placeholder="100" />
                        </div>
                    </div>
                </div>

                <div class="botones">
                    <button class="btn-secundario" @click="router.push('/inventario/productos')">Cancelar</button>
                    <button class="btn-principal" @click="agregarProducto" :disabled="cargando">
                        {{ cargando ? 'Guardando...' : 'Crear producto' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/authStore';
import inventarioApi from '../api/inventarioApi';

const router = useRouter();
const authStore = useAuthStore();
const empresa_id = authStore.usuario?.empresa_id;

const cargando = ref(false);
const error = ref('');
const mensaje = ref('');
const categorias = ref<any[]>([]);

const form = reactive({
    nombre: '',
    categoria_id: null as number | null,
    descripcion: '',
    marca: '',
    modelo: '',
    unidad: 'pieza',
    precio_compra: 0,
    precio_venta: 0,
    stock_actual: 0,
    stock_minimo: 5,
    stock_maximo: 100,
    activo: true
});

const margen = computed(() => {
    if (form.precio_compra <= 0) return 0;
    return ((form.precio_venta - form.precio_compra) / form.precio_compra) * 100;
});

const agregarProducto = async () => {
    if (!form.nombre.trim()) { error.value = 'El nombre es requerido'; return; }
    if (form.precio_compra < 0) { error.value = 'El precio de compra no puede ser negativo'; return; }
    if (form.stock_minimo < 0) { error.value = 'El stock mínimo no puede ser negativo'; return; }
    try {
        cargando.value = true;
        error.value = '';
        await inventarioApi.post('/productos', { ...form, empresa_id });

        // Si tiene stock inicial registra movimiento de entrada
        if (form.stock_actual > 0) {
            await inventarioApi.post('/movimientos', {
                empresa_id,
                producto_id: null, // se obtiene del resultado
                usuario_id: authStore.usuario?.id,
                tipo: 'entrada',
                cantidad: form.stock_actual,
                precio_unitario: form.precio_compra,
                total: form.stock_actual * form.precio_compra,
                motivo: 'Stock inicial al crear producto'
            });
        }

        mensaje.value = 'Producto creado correctamente';
        setTimeout(() => router.push('/inventario/productos'), 1500);
    } catch {
        error.value = 'No se pudo crear el producto';
    } finally {
        cargando.value = false;
    }
};

onMounted(async () => {
    if (!empresa_id) return;
    const resp = await inventarioApi.get(`/categorias/${empresa_id}`);
    categorias.value = resp.data;
});
</script>

<style scoped>
.contenedor { padding: 2rem; max-width: 800px; margin: 0 auto; }

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

.card { background: white; border-radius: 8px; padding: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }

.mensaje { padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.9rem; }
.mensaje.exito { background: #f0fdf4; color: #16a34a; }
.mensaje.error-msg { background: #fef2f2; color: #ef4444; }

.formulario { display: flex; flex-direction: column; gap: 2rem; }

.seccion { display: flex; flex-direction: column; gap: 1rem; }
.seccion h3 { font-size: 1rem; color: #333; margin: 0 0 0.25rem; padding-bottom: 0.5rem; border-bottom: 1px solid #f0f0f0; }

.fila-doble { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.fila-triple { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
.grupo-pequeno { max-width: 250px; }

.grupo { display: flex; flex-direction: column; gap: 0.4rem; }
.grupo label { font-size: 0.875rem; font-weight: 600; color: #333; }
.ayuda { font-size: 0.75rem; color: #999; }

.grupo input, .grupo select, .grupo textarea {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 0.95rem;
    outline: none;
    font-family: inherit;
}
.grupo input:focus, .grupo select:focus, .grupo textarea:focus { border-color: #FF7043; }

.margen-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #666;
    padding: 0.5rem 0.75rem;
    background: #f9fafb;
    border-radius: 6px;
}
.positivo { color: #16a34a; }
.negativo { color: #ef4444; }

.botones { display: flex; justify-content: flex-end; gap: 1rem; }

.btn-principal { padding: 0.75rem 1.5rem; background-color: #FF7043; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 1rem; }
.btn-principal:hover { background-color: #F4511E; }
.btn-principal:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secundario { padding: 0.75rem 1.5rem; background-color: #f5f5f5; color: #333; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-secundario:hover { background-color: #e0e0e0; }

@media (max-width: 640px) {
    .contenedor { padding: 1rem; }
    .fila-doble, .fila-triple { grid-template-columns: 1fr; }
    .grupo-pequeno { max-width: 100%; }
    .botones { flex-direction: column; }
    .btn-principal, .btn-secundario { width: 100%; text-align: center; }
}
</style>