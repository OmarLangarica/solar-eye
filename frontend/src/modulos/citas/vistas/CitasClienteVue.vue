<template>
  <div class="contenedor citas-container">
    <nav class="navbar">
      <div class="navbar-brand">
        <img class="navbar-logo" :src="logoSolarEye" alt="Solar Eye" />
      </div>

      <div class="navbar-links">
        <button class="nav-link" @click="volver">← Volver</button>
        <button class="nav-link" @click="abrirNuevo">+ Agendar</button>
      </div>

      <div class="navbar-user">
        <span class="navbar-user-name">{{ authStore.usuario?.nombre }} {{ authStore.usuario?.apellido }}</span>
        <button class="nav-link nav-link--logout" @click="router.push('/clientes')" aria-label="Cerrar sesión" title="Cerrar sesión">
          <i class="bi bi-box-arrow-right" aria-hidden="true"></i>
        </button>
      </div>
    </nav>

    <div class="encabezado">
      <div>
        <h1>Citas del cliente</h1>
        <p>Agenda y seguimiento de citas asociadas a este cliente</p>
      </div>
      <div class="acciones-header">
      </div>
    </div>

    <div class="tabla-container">
      <div v-if="cargando" class="sin-datos">Cargando citas...</div>

      <table v-else-if="citas.length > 0">
        <thead>
          <tr>
            <th>ID</th>
            <th>TIPO</th>
            <th>INICIO</th>
            <th>ESTADO</th>
            <th>NOTAS</th>
            <th><span class="centrado">ACCIONES</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in citas" :key="c.id" :class="filaClase(c.estado)">
            <td>{{ c.id }}</td>
            <td><span class="tipo-cita">{{ formateaTipo(c.tipo) }}</span></td>
            <td>{{ formatFecha(c.fecha_inicio) }}</td>
            <td>
              <span class="estado-badge" :class="claseEstado(c.estado)">{{ etiquetaEstado(c.estado) }}</span>
            </td>
            <td class="notas-cell">{{ c.notas ?? '—' }}</td>
            <td class="acciones">
              <button class="btn-secundario" :disabled="accionBloqueada(c.estado)" @click="abrirReprogramar(c)">Reprogramar</button>
              <button class="btn-exito" :disabled="accionBloqueada(c.estado)" @click="actualizarEstado(c.id, 'realizada')">Realizada</button>
              <button class="btn-peligro" :disabled="accionBloqueada(c.estado)" @click="cancelar(c.id)">Cancelar</button>
              <button class="btn-secundario" @click="eliminar(c.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="sin-datos">No hay citas para este cliente.</div>
    </div>

    <AgendarCitaModal
      v-if="mostrarModal"
      :clienteId="cliente_id"
      :simulacionId="modalSimulacionId"
      :cita="citaSeleccionada"
      @close="cerrarModal"
      @saved="onSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import citasApi from '../api/citasApi';
import AgendarCitaModal from './AgendarCitaModal.vue';
import { useAuthStore } from '../../../stores/authStore';
import logoSolarEye from '../../../assets/images/LogoSolarEye.png';

const route = useRoute();
const router = useRouter();

const cliente_id = Number(route.params.cliente_id);
const citas = ref<any[]>([]);
const cargando = ref(false);
const authStore = useAuthStore();

const mostrarModal = ref(false);
const citaSeleccionada = ref<any | null>(null);
const modalSimulacionId = ref<number | null>(null);

const traeCitas = async () => {
  try {
    cargando.value = true;
    const resp = await citasApi.get(`/cliente/${cliente_id}`);
    citas.value = resp.data || [];
  } catch (err) {
    console.error(err);
    citas.value = [];
  } finally {
    cargando.value = false;
  }
};

const volver = () => router.back();

const abrirNuevo = () => {
  citaSeleccionada.value = null;
  modalSimulacionId.value = null;
  mostrarModal.value = true;
};

const abrirReprogramar = (cita: any) => {
  citaSeleccionada.value = cita;
  modalSimulacionId.value = cita.simulacion_id ?? null;
  mostrarModal.value = true;
};

const cerrarModal = () => {
  mostrarModal.value = false;
  citaSeleccionada.value = null;
  modalSimulacionId.value = null;
};

const onSaved = (_data: any) => {
  cerrarModal();
  traeCitas();
};

const formatFecha = (s: string) => {
  try {
    return new Date(s).toLocaleString('es-MX');
  } catch {
    return s;
  }
};

const formateaTipo = (tipo: string) => {
  switch (tipo) {
    case 'visita_tecnica': return 'Visita técnica';
    case 'llamada': return 'Llamada';
    case 'videollamada': return 'Videollamada';
    default: return tipo;
  }
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

const accionBloqueada = (estado: string) => {
  return estado === 'realizada' || estado === 'cancelada';
};

onMounted(() => traeCitas());

async function actualizarEstado(id: number, estado: string) {
  try {
    const resp = await citasApi.get(`/${id}`);
    const c = Array.isArray(resp.data) ? resp.data[0] : resp.data;
    if (!c) return alert('Cita no encontrada');
    if (c.estado === 'realizada' || c.estado === 'cancelada') return;
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
</script>

<style scoped>
.contenedor {
  padding: 0 2rem 2rem;
  max-width: 1300px;
  margin: 0 auto;
}

.encabezado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.encabezado h1 {
  font-size: 1.8rem;
  color: #333;
  margin: 0;
}

.encabezado p {
  color: #666;
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
}

.acciones-header {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-principal,
.btn-secundario,
.btn-exito,
.btn-peligro {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
}

.btn-principal {
  background-color: #1e3a8a;
  color: white;
}

.btn-principal:hover { background-color: #2563eb; }

/* Navbar shared styles */
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

.navbar-links,
.navbar-user {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.navbar-user { margin-left: auto; justify-content: flex-end; }

.navbar-user-name { color: white; font-weight: 600; white-space: nowrap; }

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

.nav-link--logout { font-weight: 500; display: inline-flex; align-items: center; justify-content: center; font-size: 1.15rem; }

.btn-secundario {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secundario:hover { background-color: #e0e0e0; }

.btn-exito {
  background-color: #16a34a;
  color: white;
}

.btn-exito:hover { background-color: #15803d; }
.btn-exito:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  background-color: #9ca3af;
}

.btn-peligro {
  background-color: #ef4444;
  color: white;
}

.btn-peligro:hover { background-color: #dc2626; }
.btn-peligro:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  background-color: #9ca3af;
}

.btn-secundario:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  background-color: #f3f4f6;
  color: #9ca3af;
}

.tabla-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background-color: #f5f5f5;
}

th {
  padding: 1rem;
  text-align: left;
  font-size: 0.85rem;
  color: #666;
  font-weight: 600;
}

td {
  padding: 0.85rem 1rem;
  border-top: 1px solid #f0f0f0;
  font-size: 0.9rem;
  color: #333;
  vertical-align: top;
}

tr:hover td {
  background-color: #fafafa;
}

.fila-completada td {
  background: #f0fdf4;
}

.tipo-cita {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  background: #f0f4ff;
  color: #3b4fd8;
  white-space: nowrap;
}

.estado-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.estado-pendiente { background: #fef3c7; color: #92400e; }
.estado-confirmada { background: #dbeafe; color: #1d4ed8; }
.estado-reprogramada { background: #ede9fe; color: #6d28d9; }
.estado-cancelada { background: #fee2e2; color: #b91c1c; }
.estado-completada { background: #dcfce7; color: #15803d; }

.notas-cell {
  max-width: 340px;
  color: #4b5563;
  word-break: break-word;
}

.acciones {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.sin-datos {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.centrado {
  display: inline-block;
  width: 100%;
  text-align: center;
}

@media (max-width: 768px) {
  .contenedor { padding: 1rem; }
  .encabezado { flex-direction: column; align-items: flex-start; }
  .acciones-header { width: 100%; }
  .btn-principal, .btn-secundario, .btn-exito, .btn-peligro { flex: 1; text-align: center; }
  .tabla-container { overflow-x: auto; }
  table { min-width: 900px; }
}
</style>
