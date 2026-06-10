<template>
    <Teleport to="body">
        <div class="agenda-overlay" @click.self="$emit('close')">
            <div class="agenda-modal">
                <div class="agenda-modal-header" :class="tipo">
                    <div>
                        <h2>{{ props.cita ? 'Editar cita' : 'Agendar cita' }}</h2>
                        <span class="agenda-modal-subtitulo">{{ labelTipo(tipo) }}</span>
                    </div>
                    <button class="btn-cerrar" @click="$emit('close')">✕</button>
                </div>

                <div class="formulario">
                    <div class="grupo">
                        <label>Tipo de cita</label>
                        <select v-model="tipo">
                            <option value="visita_tecnica">Visita técnica</option>
                            <option value="llamada">Llamada</option>
                            <option value="videollamada">Videollamada</option>
                        </select>
                    </div>

                    <div class="fila-doble">
                        <div class="grupo">
                            <label>Fecha y hora inicio *</label>
                            <input type="datetime-local" v-model="fechaHora" />
                        </div>
                        <div class="grupo">
                            <label>Fecha y hora fin</label>
                            <input type="datetime-local" v-model="fechaFin" />
                        </div>
                    </div>

                    <div class="grupo">
                        <label>Notas <span class="opcional">(opcional)</span></label>
                        <textarea v-model="notas" rows="3" placeholder="Notas adicionales..."></textarea>
                    </div>
                </div>

                <div class="agenda-modal-botones">
                    <button class="btn-cancelar" @click="$emit('close')">Cancelar</button>
                    <button class="btn-confirmar" @click="guardar" :disabled="guardando">
                        {{ guardando ? 'Guardando...' : props.cita ? 'Guardar cambios' : 'Crear cita' }}
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
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
    return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}T${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
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
const fechaFin = ref(formateaParaDatetimeLocal(props.cita?.fecha_fin));
const notas = ref(props.cita?.notas ?? '');
const id = ref<number | null>(props.cita?.id ?? null);
const guardando = ref(false);

const tiposCita = [
    { valor: 'visita_tecnica', label: 'Visita técnica' },
    { valor: 'llamada', label: 'Llamada' },
    { valor: 'videollamada', label: 'Videollamada' },
];

const labelTipo = (t?: string) => tiposCita.find(x => x.valor === t)?.label ?? '';

const guardar = async () => {
    if (!fechaHora.value) { alert('Selecciona fecha y hora de inicio'); return; }
    guardando.value = true;
    try {
        const body: CitaPayload = {
            empresa_id: authStore.usuario?.empresa_id ?? null,
            cliente_id: props.clienteId,
            simulacion_id: props.simulacionId ?? null,
            usuario_id: authStore.usuario?.id ?? null,
            tipo: tipo.value,
            fecha_inicio: fechaHora.value,
            fecha_fin: fechaFin.value || null,
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

        if (resp?.data) {
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
.agenda-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 1rem;
}

.agenda-modal {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    width: 100%;
    max-width: 520px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.agenda-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1.25rem 1.5rem;
    border-radius: 8px 8px 0 0;
    margin: -2rem -2rem 1.5rem;
}

.agenda-modal-header.visita_tecnica { background: #eff6ff; }
.agenda-modal-header.llamada { background: #eff6ff; }
.agenda-modal-header.videollamada { background: #f5f3ff; }

.agenda-modal-header h2 { margin: 0 0 0.25rem; font-size: 1.2rem; color: #333; }
.agenda-modal-subtitulo { font-size: 0.82rem; color: #666; }

.btn-cerrar {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: #666;
    padding: 0.25rem;
    line-height: 1;
}
.btn-cerrar:hover { color: #333; }

.formulario { display: flex; flex-direction: column; gap: 1.25rem; margin-bottom: 1.5rem; }

.fila-doble { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

.grupo { display: flex; flex-direction: column; gap: 0.4rem; }
.grupo label { font-size: 0.875rem; font-weight: 600; color: #333; }
.opcional { font-weight: 400; color: #999; font-size: 0.8rem; }

.grupo input,
.grupo select,
.grupo textarea {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 0.95rem;
    outline: none;
    font-family: inherit;
    transition: border-color 0.2s;
}
.grupo input:focus,
.grupo select:focus,
.grupo textarea:focus { border-color: #04142c; }

.agenda-modal-botones {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

.btn-cancelar {
    padding: 0.6rem 1.2rem;
    background: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
.btn-cancelar:hover { background: #e0e0e0; }

.btn-confirmar {
    padding: 0.6rem 1.2rem;
    background: #04142c;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
.btn-confirmar:hover { background: #1e3a8a; }
.btn-confirmar:disabled { opacity: 0.6; cursor: not-allowed; }

@media (max-width: 480px) {
    .agenda-modal { padding: 1.25rem; }
    .fila-doble { grid-template-columns: 1fr; }
}
</style>