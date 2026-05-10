<template>
    <div class="contenedor">
        <div class="encabezado">
            <div>
                <h1>{{ producto?.nombre ?? 'Movimientos' }}</h1>
                <p>Historial de movimientos del producto</p>
            </div>
            <button class="btn-secundario" @click="router.push('/inventario/productos')">← Volver</button>
        </div>

        <!-- Info del producto -->
        <div class="producto-card" v-if="producto">
            <div class="prod-dato">
                <span class="prod-label">Stock actual</span>
                <span class="prod-valor" :class="producto.stock_actual <= producto.stock_minimo ? 'bajo' : 'ok'">
                    {{ producto.stock_actual }} {{ producto.unidad }}
                </span>
            </div>
            <div class="prod-dato">
                <span class="prod-label">Stock mínimo</span>
                <span class="prod-valor">{{ producto.stock_minimo }}</span>
            </div>
            <div class="prod-dato">
                <span class="prod-label">Precio compra</span>
                <span class="prod-valor">${{ Number(producto.precio_compra).toLocaleString('es-MX') }}</span>
            </div>
            <div class="prod-dato">
                <span class="prod-label">Precio venta</span>
                <span class="prod-valor">${{ Number(producto.precio_venta).toLocaleString('es-MX') }}</span>
            </div>
        </div>

        <div class="tabla-container">
            <div v-if="cargando" class="sin-datos">Cargando movimientos...</div>
            <table v-else-if="movimientos.length > 0">
                <thead>
                    <tr>
                        <th>FECHA</th>
                        <th>TIPO</th>
                        <th>CANTIDAD</th>
                        <th>PRECIO UNIT.</th>
                        <th>TOTAL</th>
                        <th>USUARIO</th>
                        <th>CLIENTE</th>
                        <th>MOTIVO</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="m in movimientos" :key="m.id">
                        <td class="texto-fecha">{{ formatearFecha(m.created_at) }}</td>
                        <td><span class="badge-tipo" :class="m.tipo">{{ m.tipo }}</span></td>
                        <td>
                            <span class="cantidad" :class="['entrada','devolucion'].includes(m.tipo) ? 'positivo' : 'negativo'">
                                {{ ['entrada','devolucion'].includes(m.tipo) ? '+' : '-' }}{{ m.cantidad }}
                            </span>
                        </td>
                        <td>${{ Number(m.precio_unitario).toLocaleString('es-MX', { minimumFractionDigits: 2 }) }}</td>
                        <td>${{ Number(m.total).toLocaleString('es-MX', { minimumFractionDigits: 2 }) }}</td>
                        <td>{{ m.usuario_nombre }} {{ m.usuario_apellido }}</td>
                        <td>{{ m.cliente_nombre ? `${m.cliente_nombre} ${m.cliente_apellido}` : '—' }}</td>
                        <td class="texto-motivo">{{ m.motivo ?? '—' }}</td>
                    </tr>
                </tbody>
            </table>
            <div v-else class="sin-datos">No hay movimientos para este producto.</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../../stores/authStore';
import inventarioApi from '../api/inventarioApi';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const empresa_id = authStore.usuario?.empresa_id;
const producto_id = Number(route.params.id);

const movimientos = ref<any[]>([]);
const producto = ref<any>(null);
const cargando = ref(false);

const formatearFecha = (fecha: string) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-MX', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

onMounted(async () => {
    if (!empresa_id) return;
    cargando.value = true;
    const [movsResp, prodResp] = await Promise.all([
        inventarioApi.get(`/movimientos/producto/${producto_id}/${empresa_id}`),
        inventarioApi.get(`/producto/${producto_id}/${empresa_id}`)
    ]);
    movimientos.value = movsResp.data;
    const data = Array.isArray(prodResp.data) ? prodResp.data[0] : prodResp.data;
    producto.value = data;
    cargando.value = false;
});
</script>

<style scoped>
.contenedor { padding: 2rem; max-width: 1200px; margin: 0 auto; }
.encabezado { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.encabezado h1 { font-size: 1.8rem; color: #333; margin: 0; }
.encabezado p { color: #666; font-size: 0.9rem; margin: 0.25rem 0 0; }
.btn-secundario { padding: 0.6rem 1.2rem; background-color: #f5f5f5; color: #333; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-secundario:hover { background-color: #e0e0e0; }
.producto-card { display: flex; gap: 2rem; background: white; border-radius: 8px; padding: 1.25rem 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 1.5rem; flex-wrap: wrap; }
.prod-dato { display: flex; flex-direction: column; gap: 0.2rem; }
.prod-label { font-size: 0.75rem; color: #999; }
.prod-valor { font-size: 1.1rem; font-weight: 700; color: #333; }
.prod-valor.bajo { color: #ef4444; }
.prod-valor.ok { color: #16a34a; }
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
.cantidad { font-weight: 700; }
.cantidad.positivo { color: #16a34a; }
.cantidad.negativo { color: #ef4444; }
.texto-motivo { color: #666; font-size: 0.82rem; }
.sin-datos { text-align: center; padding: 3rem; color: #999; }
</style>