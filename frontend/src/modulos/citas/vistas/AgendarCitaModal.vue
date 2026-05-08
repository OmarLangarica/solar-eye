<template>
  <div class="modal-backdrop">
    <div class="modal-card">
      <h3>Agendar cita</h3>
      <form @submit.prevent="guardar">
        <label>Tipo</label>
        <select v-model="tipo">
          <option value="visita_tecnica">Visita técnica</option>
          <option value="llamada">Llamada</option>
          <option value="videollamada">Videollamada</option>
        </select>

        <label>Fecha y hora</label>
        <input type="datetime-local" v-model="fechaHora" required />

        <label>Notas (opcional)</label>
        <textarea v-model="notas" rows="3" />

        <div class="acciones">
          <button type="button" class="btn-secundario" @click="$emit('close')">Cancelar</button>
          <button type="submit" class="btn-primario" :disabled="guardando">{{ guardando ? 'Guardando...' : 'Guardar' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import citasApi from '../api/citasApi';
import { useAuthStore } from '../../../stores/authStore';

const formateaParaDatetimeLocal = (valor?: string | null) => {
  if (!valor) return '';

  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;

  const pad = (n: number) => String(n).padStart(2, '0');
  const anio = fecha.getFullYear();
  const mes = pad(fecha.getMonth() + 1);
  const dia = pad(fecha.getDate());
  const horas = pad(fecha.getHours());
  const minutos = pad(fecha.getMinutes());

  return `${anio}-${mes}-${dia}T${horas}:${minutos}`;
};

const props = defineProps<{
  clienteId: number;
  simulacionId?: number | null;
  cita?: any | null;
}>();

const emit = defineEmits(['close', 'saved']);

const authStore = useAuthStore();

type TipoCita = 'visita_tecnica' | 'llamada' | 'videollamada';
type EstadoCita = 'pendiente' | 'confirmada' | 'reprogramada' | 'cancelada' | 'realizada';

type CitaPayload = {
  id?: number;
  empresa_id: number | null;
  cliente_id: number;
  simulacion_id: number | null;
  usuario_id: number | null;
  tipo: TipoCita;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado: EstadoCita;
  notas: string | null;
};

const tipo = ref<TipoCita>(props.cita?.tipo ?? 'visita_tecnica');
const fechaHora = ref(formateaParaDatetimeLocal(props.cita?.fecha_inicio));
const notas = ref(props.cita?.notas ?? '');
const id = ref<number | null>(props.cita?.id ?? null);
const guardando = ref(false);

const guardar = async () => {
  if (!fechaHora.value) return alert('Selecciona fecha y hora');
  guardando.value = true;

  try {
    const body: CitaPayload = {
      empresa_id: authStore.usuario?.empresa_id ?? null,
      cliente_id: props.clienteId,
      simulacion_id: props.simulacionId ?? null,
      usuario_id: authStore.usuario?.id ?? null,
      tipo: tipo.value,
      fecha_inicio: fechaHora.value,
      fecha_fin: null,
      estado: props.cita?.estado ?? 'pendiente',
      notas: notas.value || null
    };

    let resp;
    if (id.value) {
      body.id = id.value;
      resp = await citasApi.put('/', body);
    } else {
      resp = await citasApi.post('/', body);
    }

    if (resp && resp.data) {
      emit('saved', resp.data);
      emit('close');
    } else {
      alert('No se pudo guardar la cita');
    }
  } catch (err) {
    console.error(err);
    alert('Error al agendar la cita');
  } finally {
    guardando.value = false;
  }
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:1000;
}
.modal-card { background:white; padding:1.25rem; border-radius:8px; width:320px; }
.modal-card h3 { margin:0 0 0.75rem; }
.modal-card label { display:block; font-size:0.85rem; margin-top:0.5rem; }
.modal-card input, .modal-card select, .modal-card textarea { width:100%; padding:0.5rem; margin-top:0.25rem; }
.acciones { display:flex; justify-content:flex-end; gap:0.5rem; margin-top:0.75rem; }
.btn-primario { background:#0ea5a4; color:white; border:none; padding:0.5rem 0.75rem; border-radius:6px; }
.btn-secundario { background:#e5e7eb; border:none; padding:0.5rem 0.75rem; border-radius:6px; }
</style>
