<template>
    <div class="contenedor">
        <nav class="navbar">
            <div class="navbar-brand">
                <img class="navbar-logo" :src="logoSolarEye" alt="Solar Eye" />
            </div>
            <div class="navbar-user">
                <span class="navbar-user-name">{{ authStore.usuario?.nombre }}</span>
                <button class="nav-link" @click="router.back()">← Volver</button>
            </div>
        </nav>

        <div class="encabezado">
            <h1>{{ editando ? 'Editar' : 'Agregar' }} {{ tipo === 'panel' ? 'panel solar' : 'inversor' }}</h1>
            <p>{{ editando ? 'Modifica los datos del componente' : 'Ingresa los datos del datasheet del fabricante' }}</p>
        </div>

        <div class="card">

            <!-- FORMULARIO PANEL -->
            <template v-if="tipo === 'panel'">
                <div class="seccion-titulo">Identificación</div>
                <div class="fila-doble">
                    <div class="grupo">
                        <label>Fabricante</label>
                        <input v-model="form.fabricante" type="text" placeholder="Ej: Jinko Solar" />
                    </div>
                    <div class="grupo">
                        <label>Modelo *</label>
                        <input v-model="form.modelo" type="text" placeholder="Ej: Tiger Neo JKM575N" />
                    </div>
                </div>
                <div class="fila-doble">
                    <div class="grupo">
                        <label>Tecnología</label>
                        <select v-model="form.tecnologia">
                            <option value="">Seleccionar...</option>
                            <option value="Monocristalino PERC">Monocristalino PERC</option>
                            <option value="N-Type TOPCon">N-Type TOPCon</option>
                            <option value="N-Type Bifacial">N-Type Bifacial</option>
                            <option value="Policristalino">Policristalino</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                    <div class="grupo">
                        <label>Área del panel (m²) *</label>
                        <input v-model.number="form.area_m2" type="number" step="0.001" placeholder="1.953" />
                        <span class="ayuda">Ancho × Alto del panel</span>
                    </div>
                </div>

                <div class="seccion-titulo">Parámetros eléctricos (condiciones estándar STC)</div>
                <div class="fila-doble">
                    <div class="grupo">
                        <label>Potencia máxima Pmax (Wp) *</label>
                        <input v-model.number="form.potencia_wp" type="number" placeholder="460" />
                    </div>
                    <div class="grupo">
                        <label>Eficiencia (decimal) *</label>
                        <input v-model.number="form.eficiencia" type="number" step="0.001" placeholder="0.205" />
                        <span class="ayuda">Ej: 20.5% → 0.205</span>
                    </div>
                </div>
                <div class="fila-cuatro">
                    <div class="grupo">
                        <label>Voc (V) *</label>
                        <input v-model.number="form.voc" type="number" step="0.01" placeholder="41.8" />
                        <span class="ayuda">Voltaje circuito abierto</span>
                    </div>
                    <div class="grupo">
                        <label>Isc (A) *</label>
                        <input v-model.number="form.isc" type="number" step="0.01" placeholder="13.95" />
                        <span class="ayuda">Corriente cortocircuito</span>
                    </div>
                    <div class="grupo">
                        <label>Vmp (V) *</label>
                        <input v-model.number="form.vmp" type="number" step="0.01" placeholder="34.92" />
                        <span class="ayuda">Voltaje máx. potencia</span>
                    </div>
                    <div class="grupo">
                        <label>Imp (A) *</label>
                        <input v-model.number="form.imp" type="number" step="0.01" placeholder="13.17" />
                        <span class="ayuda">Corriente máx. potencia</span>
                    </div>
                </div>

                <div class="seccion-titulo">Coeficientes de temperatura</div>
                <div class="fila-doble">
                    <div class="grupo">
                        <label>Coef. temp. potencia (%/°C) *</label>
                        <input v-model.number="form.coef_temp_potencia" type="number" step="0.0001" placeholder="-0.0035" />
                        <span class="ayuda">Valor negativo, ej: -0.0035</span>
                    </div>
                    <div class="grupo">
                        <label>Coef. temp. Voc (%/°C)</label>
                        <input v-model.number="form.coef_temp_voc" type="number" step="0.0001" placeholder="-0.0028" />
                        <span class="ayuda">Valor negativo, ej: -0.0028</span>
                    </div>
                </div>
            </template>

            <!-- FORMULARIO INVERSOR -->
            <template v-if="tipo === 'inversor'">
                <div class="seccion-titulo">Identificación</div>
                <div class="fila-doble">
                    <div class="grupo">
                        <label>Fabricante</label>
                        <input v-model="form.fabricante" type="text" placeholder="Ej: Huawei" />
                    </div>
                    <div class="grupo">
                        <label>Modelo *</label>
                        <input v-model="form.modelo" type="text" placeholder="Ej: SUN2000-5KTL-L1" />
                    </div>
                </div>
                <div class="fila-doble">
                    <div class="grupo">
                        <label>Fases *</label>
                        <select v-model="form.fases">
                            <option value="">Seleccionar...</option>
                            <option value="monofasico">Monofásico</option>
                            <option value="trifasico">Trifásico</option>
                        </select>
                    </div>
                    <div class="grupo">
                        <label>Tipo</label>
                        <select v-model="form.tipo_inversor">
                            <option value="">Seleccionar...</option>
                            <option value="String">String</option>
                            <option value="Microinversor">Microinversor</option>
                            <option value="Híbrido">Híbrido</option>
                        </select>
                    </div>
                </div>

                <div class="seccion-titulo">Potencia y eficiencia</div>
                <div class="fila-doble">
                    <div class="grupo">
                        <label>Potencia nominal AC (kW) *</label>
                        <input v-model.number="form.potencia_nominal_kw" type="number" step="0.01" placeholder="5.0" />
                    </div>
                    <div class="grupo">
                        <label>Eficiencia máxima (decimal) *</label>
                        <input v-model.number="form.eficiencia_maxima" type="number" step="0.001" placeholder="0.984" />
                        <span class="ayuda">Ej: 98.4% → 0.984</span>
                    </div>
                </div>

                <div class="seccion-titulo">Parámetros de entrada DC</div>
                <div class="fila-cuatro">
                    <div class="grupo">
                        <label>MPPT mín (V) *</label>
                        <input v-model.number="form.voltaje_mppt_min" type="number" placeholder="90" />
                    </div>
                    <div class="grupo">
                        <label>MPPT máx (V) *</label>
                        <input v-model.number="form.voltaje_mppt_max" type="number" placeholder="560" />
                    </div>
                    <div class="grupo">
                        <label>Volt. máx entrada (V) *</label>
                        <input v-model.number="form.voltaje_max_entrada" type="number" placeholder="600" />
                    </div>
                    <div class="grupo">
                        <label>Corr. máx entrada (A) *</label>
                        <input v-model.number="form.corriente_max_entrada" type="number" placeholder="13" />
                    </div>
                </div>
                <div class="fila-doble">
                    <div class="grupo">
                        <label>Número de MPPT *</label>
                        <input v-model.number="form.numero_mppt" type="number" placeholder="2" />
                    </div>
                    <div class="grupo">
                        <label>Entradas por MPPT *</label>
                        <input v-model.number="form.numero_entradas_por_mppt" type="number" placeholder="1" />
                    </div>
                </div>
            </template>

            <div class="info-datasheet">
                <i class="bi bi-info-circle"></i>
                Todos estos datos los encuentras en la hoja de datos técnicos (datasheet) del fabricante,
                disponible en su sitio web oficial.
            </div>

            <div class="botones">
                <button class="btn-cancelar" @click="router.back()">Cancelar</button>
                <button class="btn-guardar" @click="guardar" :disabled="guardando">
                    {{ guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Agregar componente' }}
                </button>
            </div>

            <div class="error-msg" v-if="error">{{ error }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../../stores/authStore';
import catalogoApi from '../../simulaciones/api/catalogoApi';
import logoSolarEye from '../../../assets/images/LogoSolarEye.png';

const router = useRouter();
const route  = useRoute();
const authStore = useAuthStore();
const empresa_id = authStore.usuario?.empresa_id;

const tipo     = route.params.tipo as 'panel' | 'inversor';
const idEditar = route.params.id ? Number(route.params.id) : null;
const editando = !!idEditar;
const guardando = ref(false);
const error     = ref('');


const form = ref({
    id: null as number | null,
    empresa_id,
    tipo,
    fabricante: '',
    modelo: '',
    // Panel
    potencia_wp: null as number | null,
    eficiencia: null as number | null,
    voc: null as number | null,
    isc: null as number | null,
    vmp: null as number | null,
    imp: null as number | null,
    coef_temp_potencia: null as number | null,
    coef_temp_voc: null as number | null,
    area_m2: null as number | null,
    tecnologia: '',
    // Inversor
    potencia_nominal_kw: null as number | null,
    eficiencia_maxima: null as number | null,
    voltaje_mppt_min: null as number | null,
    voltaje_mppt_max: null as number | null,
    voltaje_max_entrada: null as number | null,
    corriente_max_entrada: null as number | null,
    numero_mppt: null as number | null,
    numero_entradas_por_mppt: null as number | null,
    fases: '',
    tipo_inversor: ''
});

const guardar = async () => {
    if (!form.value.modelo) { error.value = 'El modelo es obligatorio'; return; }
    if (tipo === 'panel' && !form.value.potencia_wp) { error.value = 'La potencia es obligatoria'; return; }
    if (tipo === 'inversor' && !form.value.potencia_nominal_kw) { error.value = 'La potencia nominal es obligatoria'; return; }

    guardando.value = true;
    error.value = '';

    try {
        if (editando) {
            await catalogoApi.put('/empresa/componentes', form.value);
        } else {
            await catalogoApi.post('/empresa/componentes', form.value);
        }
        router.push('/admin/catalogo');
    } catch (err) {
        console.error('Error guardando:', err);
        error.value = 'Error al guardar el componente. Verifica los datos.';
    } finally {
        guardando.value = false;
    }
};

onMounted(async () => {
    if (editando && idEditar) {
        try {
            const resp = await catalogoApi.get(`/empresa/${empresa_id}/componentes?tipo=${tipo}`);
            const lista = Array.isArray(resp.data) ? resp.data : [];
            const componente = lista.find((c: any) => c.id === idEditar);
            if (componente) Object.assign(form.value, componente);
        } catch (err) {
            console.error('Error cargando componente:', err);
        }
    }
    
});
</script>

<style scoped>
.contenedor { min-height: 100vh; background: #f0f4f8; font-family: 'Segoe UI', system-ui, sans-serif; }

.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.9rem 1.5rem;
    background: #04142c;
}

.navbar-brand { display: flex; align-items: center; }
.navbar-logo { height: 34px; }
.navbar-user { display: flex; align-items: center; gap: 1rem; }
.navbar-user-name { color: white; font-weight: 600; font-size: 0.9rem; }

.nav-link {
    background: transparent;
    border: none;
    color: rgba(255,255,255,0.8);
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
}
.nav-link:hover { color: white; }

.encabezado {
    padding: 1.5rem 1.5rem 0;
}

.encabezado h1 { font-size: 1.8rem; color: #04142c; margin: 0; font-weight: 800; }
.encabezado p  { color: #666; font-size: 0.9rem; margin: 0.25rem 0 0; }

.card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    margin: 1.5rem;
    box-shadow: 0 2px 8px rgba(4,20,44,0.07);
    border: 1px solid #e8edf2;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.seccion-titulo {
    font-size: 0.78rem;
    font-weight: 700;
    color: #04142c;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #1d4f91;
    margin-top: 0.5rem;
}

.fila-doble  { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.fila-cuatro { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }

.grupo { display: flex; flex-direction: column; gap: 0.35rem; }
.grupo label { font-size: 0.85rem; font-weight: 600; color: #333; }
.ayuda { font-size: 0.75rem; color: #999; }

.grupo input, .grupo select {
    padding: 0.65rem 0.85rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.9rem;
    outline: none;
    font-family: inherit;
    transition: border-color 0.2s;
}
.grupo input:focus, .grupo select:focus { border-color: #1d4f91; }

.info-datasheet {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    background: #f0f5fb;
    border: 1px solid #c7d9f0;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    font-size: 0.82rem;
    color: #1d4f91;
    line-height: 1.5;
}

.botones {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 0.5rem;
}

.btn-cancelar {
    padding: 0.7rem 1.4rem;
    background: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
.btn-cancelar:hover { background: #e0e0e0; }

.btn-guardar {
    padding: 0.7rem 1.6rem;
    background: #1d4f91;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 700;
    font-size: 0.95rem;
}
.btn-guardar:hover { background: #163d72; }
.btn-guardar:disabled { opacity: 0.6; cursor: not-allowed; }

.error-msg {
    background: #fef2f2;
    color: #dc2626;
    padding: 0.75rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    border: 1px solid #fecaca;
}

@media (max-width: 768px) {
    .fila-doble  { grid-template-columns: 1fr; }
    .fila-cuatro { grid-template-columns: repeat(2, 1fr); }
}
</style>