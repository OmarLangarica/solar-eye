<template>
  <div class="contenedor">
    <div class="encabezado">
      <h1>Citas — Empresa</h1>
      <div>
        <button class="btn-volver" @click="volver">← Volver</button>
        <button class="btn-primario" @click="traeCitas">Refrescar</button>
      </div>
    </div>

    <div v-if="cargando">Cargando...</div>
    <div v-else>
      <table class="tabla-citas">
        <thead>
          <tr><th>ID</th><th>Cliente ID</th><th>Tipo</th><th>Inicio</th><th>Estado</th><th>Notas</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          <tr v-for="c in citas" :key="c.id" :class="filaClase(c.estado)">
            <td>{{ c.id }}</td>
            <td>{{ c.cliente_id }}</td>
            <td>{{ c.tipo }}</td>
            <td>{{ formatFecha(c.fecha_inicio) }}</td>
            <td><span class="estado-badge" :class="claseEstado(c.estado)">{{ etiquetaEstado(c.estado) }}</span></td>
            <td>{{ c.notas }}</td>
            <td>
              <button class="btn-exito" @click="actualizarEstado(c.id, 'realizada')">Marcar realizada</button>
              <button class="btn-peligro" @click="cancelar(c.id)">Cancelar</button>
              <button class="btn-secundario" @click="eliminar(c.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="citas.length === 0">No hay citas para esta empresa.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/authStore';
import citasApi from '../api/citasApi';

const router = useRouter();
const authStore = useAuthStore();

const citas = ref<any[]>([]);
const cargando = ref(false);

const traeCitas = async () => {
  try {
    cargando.value = true;
    const empresa_id = authStore.usuario?.empresa_id;
    if (!empresa_id) {
      citas.value = [];
      return;
    }
    const resp = await citasApi.get('/', { params: { empresa_id } });
    citas.value = resp.data || [];
  } catch (err) {
    console.error(err);
    citas.value = [];
  } finally { cargando.value = false; }
};

const volver = () => router.back();

const formatFecha = (s: string) => {
  try { return new Date(s).toLocaleString(); } catch { return s; }
};

const etiquetaEstado = (estado: string) => {
  switch (estado) {
    case 'pendiente': return 'Pendiente';
    case 'confirmada': return 'Confirmada';
    case 'reprogramada': return 'Reprogramada';
    case 'cancelada': return 'Cancelada';
    case 'realizada': return 'Completada';
    default: return estado;
  }
};

const claseEstado = (estado: string) => {
  switch (estado) {
    case 'pendiente': return 'estado-pendiente';
    case 'confirmada': return 'estado-confirmada';
    case 'reprogramada': return 'estado-reprogramada';
    case 'cancelada': return 'estado-cancelada';
    case 'realizada': return 'estado-completada';
    default: return '';
  }
};

const filaClase = (estado: string) => {
  return estado === 'realizada' ? 'fila-completada' : '';
};

async function actualizarEstado(id: number, estado: string) {
  try {
    const resp = await citasApi.get(`/${id}`);
    const c = Array.isArray(resp.data) ? resp.data[0] : resp.data;
    if (!c) return alert('Cita no encontrada');
    c.estado = estado;
    if (estado === 'realizada') {
      c.fecha_fin = new Date().toISOString();
    }
    await citasApi.put('/', c);
    await traeCitas();
    alert(`Cita ${id} actualizada: ${estado}`);
  } catch (err) {
    console.error(err);
    alert('Error al actualizar estado');
  }
}

async function cancelar(id: number) {
  if (!confirm('¿Deseas cancelar esta cita?')) return;
  await actualizarEstado(id, 'cancelada');
}

async function eliminar(id: number) {
  if (!confirm('¿Eliminar la cita permanentemente?')) return;
  try {
    await citasApi.delete('/', { data: { id } });
    traeCitas();
  } catch (err) {
    console.error(err);
    alert('Error al eliminar');
  }
}

onMounted(() => traeCitas());
</script>

<style scoped>
.contenedor { padding:1rem; }
.encabezado { display:flex; justify-content:space-between; align-items:center; }
.tabla-citas { width:100%; border-collapse:collapse; margin-top:1rem; }
.tabla-citas th, .tabla-citas td { border:1px solid #e5e7eb; padding:0.5rem; }
.tabla-citas tr.fila-completada { background: #f0fdf4; }
.estado-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
.estado-pendiente { background: #fef3c7; color: #92400e; }
.estado-confirmada { background: #dbeafe; color: #1d4ed8; }
.estado-reprogramada { background: #ede9fe; color: #6d28d9; }
.estado-cancelada { background: #fee2e2; color: #b91c1c; }
.estado-completada { background: #dcfce7; color: #15803d; }
.btn-volver { background:#e5e7eb; border:none; padding:0.4rem 0.6rem; border-radius:6px; margin-right:0.5rem }
.btn-primario { background:#0ea5a4; color:white; border:none; padding:0.4rem 0.6rem; border-radius:6px; }
.btn-secundario { background:#e5e7eb; border:none; padding:0.3rem 0.5rem; border-radius:6px; margin-right:0.25rem }
.btn-exito { background:#16a34a; color:white; border:none; padding:0.3rem 0.5rem; border-radius:6px; margin-right:0.25rem }
.btn-peligro { background:#f87171; border:none; padding:0.3rem 0.5rem; border-radius:6px; color:white }
</style>
