<template>
    <div class="selector-componentes">
         <!-- Filtro origen -->
            <div class="filtro-origen">
                <button
                    :class="{ activo: filtroOrigen === 'todos' }"
                    @click="filtroOrigen = 'todos'; fabricantePanelSel = null; fabricanteInversorSel = null">
                    Todos
                </button>
                <button
                    :class="{ activo: filtroOrigen === 'empresa' }"
                    @click="filtroOrigen = 'empresa'; fabricantePanelSel = null; fabricanteInversorSel = null">
                    <i class="bi bi-building"></i>
                    Mis componentes
                    <span class="count-badge" v-if="panelesEmpresa.length > 0">{{ panelesEmpresa.length }}</span>
                </button>
                <button
                    :class="{ activo: filtroOrigen === 'catalogo' }"
                    @click="filtroOrigen = 'catalogo'; fabricantePanelSel = null; fabricanteInversorSel = null">
                    Catálogo global
                </button>
            </div>
        <!-- PANEL SOLAR -->
        <div class="selector-grupo">
            <h3>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
                </svg>
                Panel solar
            </h3>

            <div class="filtro-fabricante" v-if="filtroOrigen === 'catalogo'">
                <button
                    :class="{ activo: fabricantePanelSel === null }"
                    @click="fabricantePanelSel = null">
                    Todos
                </button>
                <button
                    v-for="f in fabricantesPanel"
                    :key="f.id"
                    :class="{ activo: fabricantePanelSel === f.id }"
                    @click="fabricantePanelSel = f.id">
                    {{ f.nombre }}
                </button>
            </div>

            <div class="lista-componentes">
                <div
                    v-for="panel in panelesFiltrados"
                    :key="panel.id"
                    class="componente-card"
                    :class="{ seleccionado: panelSeleccionado?.id === panel.id }"
                    @click="seleccionarPanel(panel)">
                    <div class="componente-header">
                        <span class="componente-potencia">{{ panel.potencia_wp }} W</span>
                        <div style="display:flex; gap:0.3rem; align-items:center;">
                            <span class="badge-empresa" v-if="panel.es_empresa">Mi empresa</span>
                            <span class="componente-badge">{{ (panel.eficiencia * 100).toFixed(1) }}%</span>
                        </div>
                    </div>
                    <div class="componente-modelo">{{ panel.modelo }}</div>
                    <div class="componente-fabricante">{{ panel.fabricante_nombre }}</div>
                    <div class="componente-specs">
                        <span>Voc: {{ panel.voc }}V</span>
                        <span>Isc: {{ panel.isc }}A</span>
                        <span>{{ panel.tecnologia }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- INVERSOR -->
        <div class="selector-grupo">
            <h3>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                    <rect x="2" y="7" width="20" height="10" rx="2"/>
                    <path d="M6 11v2M10 11v2M14 11v2"/>
                </svg>
                Inversor
            </h3>

            <div class="recomendado-badge" v-if="inversorRecomendado">
                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>
                </svg>
                Recomendado para tu sistema: {{ inversorRecomendado.fabricante_nombre }} {{ inversorRecomendado.modelo }}
            </div>
            <div class="filtro-fabricante" v-if="filtroOrigen === 'catalogo'">
                <button
                    :class="{ activo: fabricanteInversorSel === null }"
                    @click="fabricanteInversorSel = null">
                    Todos
                </button>
                <button
                    v-for="f in fabricantesInversor"
                    :key="f.id"
                    :class="{ activo: fabricanteInversorSel === f.id }"
                    @click="fabricanteInversorSel = f.id">
                    {{ f.nombre }}
                </button>
            </div>

            <div class="lista-componentes">
                <div
                    v-for="inversor in inversoresFiltrados"
                    :key="inversor.id"
                    class="componente-card"
                    :class="{
                        seleccionado: inversorSeleccionado?.id === inversor.id,
                        recomendado: inversorRecomendado?.id === inversor.id && inversorSeleccionado?.id !== inversor.id
                    }"
                    @click="seleccionarInversor(inversor)">
                    <div class="componente-header">
                        <span class="componente-potencia">{{ inversor.potencia_nominal_kw }} kW</span>
                        <div style="display:flex; gap:0.3rem; align-items:center;">
                            <span class="badge-empresa" v-if="inversor.es_empresa">Mi empresa</span>
                            <span class="componente-badge">{{ (inversor.eficiencia_maxima * 100).toFixed(1) }}%</span>
                        </div>
                    </div>
                    <div class="componente-modelo">{{ inversor.modelo }}</div>
                    <div class="componente-fabricante">{{ inversor.fabricante_nombre }}</div>
                    <div class="componente-specs">
                        <span>{{ inversor.fases }}</span>
                        <span>{{ inversor.tipo }}</span>
                        <span>{{ inversor.numero_mppt }} MPPT</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- RESUMEN DEL SISTEMA -->
        <div class="resumen-sistema" v-if="panelSeleccionado && inversorSeleccionado">
            <h4>Resumen del sistema</h4>
            <div class="resumen-grid">
                <div class="resumen-item">
                    <span class="resumen-label">Paneles</span>
                    <span class="resumen-valor">{{ cantidadPaneles }}</span>
                </div>
                <div class="resumen-item">
                    <span class="resumen-label">Potencia DC</span>
                    <span class="resumen-valor">{{ potenciaDcKwp.toFixed(2) }} kWp</span>
                </div>
                <div class="resumen-item">
                    <span class="resumen-label">Potencia inversor</span>
                    <span class="resumen-valor">{{ inversorSeleccionado.potencia_nominal_kw }} kW</span>
                </div>
                <div class="resumen-item">
                    <span class="resumen-label">Ratio DC/AC</span>
                    <span class="resumen-valor" :class="claseRatio">{{ ratioDcAc.toFixed(2) }}</span>
                </div>
            </div>
            <div class="compatibilidad" :class="claseCompatibilidad">
                <svg v-if="esCompatible" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                    <path d="M22 4L12 14.01l-3-3"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8v4M12 16h.01"/>
                </svg>
                {{ mensajeCompatibilidad }}
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import catalogoApi from '../api/catalogoApi';
import type { PanelSolar, InversorSolar } from '../interfaces/simulaciones-interface';
import { useAuthStore } from '../../../stores/authStore';

const authStore = useAuthStore();

const props = defineProps<{
    areaUtilM2: number;
}>();

const emit = defineEmits<{
    (e: 'seleccion', payload: {
        panel: PanelSolar;
        inversor: InversorSolar;
        cantidadPaneles: number;
        potenciaKwp: number;
    }): void;
}>();

const paneles = ref<PanelSolar[]>([]);
const inversores = ref<InversorSolar[]>([]);
const panelesEmpresa = ref<PanelSolar[]>([]);
const inversoresEmpresa = ref<InversorSolar[]>([]);
const filtroOrigen = ref<'todos' | 'empresa' | 'catalogo'>('todos');
const fabricantesPanel = ref<{ id: number; nombre: string }[]>([]);
const fabricantesInversor = ref<{ id: number; nombre: string }[]>([]);

const panelSeleccionado = ref<PanelSolar | null>(null);
const inversorSeleccionado = ref<InversorSolar | null>(null);
const inversorRecomendado = ref<InversorSolar | null>(null);
const fabricantePanelSel = ref<number | null>(null);
const fabricanteInversorSel = ref<number | null>(null);

// ─── Componentes de la empresa ──────────────────────────────
const cargarComponentesEmpresa = async () => {
    try {
        const empresa_id = authStore.usuario?.empresa_id;
        if (!empresa_id) return;

        const [respPaneles, respInversores] = await Promise.all([
            catalogoApi.get(`/empresa/${empresa_id}/componentes?tipo=panel`),
            catalogoApi.get(`/empresa/${empresa_id}/componentes?tipo=inversor`)
        ]);

        panelesEmpresa.value = (Array.isArray(respPaneles.data) ? respPaneles.data : []).map((p: any) => ({
            ...p,
            fabricante_nombre: p.fabricante ?? 'Mi empresa',
            potencia_wp: Number(p.potencia_wp),
            eficiencia: Number(p.eficiencia),
            voc: Number(p.voc),
            isc: Number(p.isc),
            vmp: Number(p.vmp),
            imp: Number(p.imp),
            coef_temp_potencia: Number(p.coef_temp_potencia),
            coef_temp_voc: Number(p.coef_temp_voc),
            area_m2: Number(p.area_m2),
            es_empresa: true
        }));

        inversoresEmpresa.value = (Array.isArray(respInversores.data) ? respInversores.data : []).map((i: any) => ({
            ...i,
            fabricante_nombre: i.fabricante ?? 'Mi empresa',
            potencia_nominal_kw: Number(i.potencia_nominal_kw),
            eficiencia_maxima: Number(i.eficiencia_maxima),
            voltaje_mppt_min: Number(i.voltaje_mppt_min),
            voltaje_mppt_max: Number(i.voltaje_mppt_max),
            voltaje_max_entrada: Number(i.voltaje_max_entrada),
            corriente_max_entrada: Number(i.corriente_max_entrada),
            numero_mppt: Number(i.numero_mppt),
            numero_entradas_por_mppt: Number(i.numero_entradas_por_mppt),
            es_empresa: true
        }));
    } catch (err) {
        console.error('Error cargando componentes empresa:', err);
    }
};

// ─── Filtros ──────────────────────────────────────────────────
const panelesFiltrados = computed(() => {
    let lista: PanelSolar[] = [];

    if (filtroOrigen.value === 'empresa') {
        lista = panelesEmpresa.value;
    } else if (filtroOrigen.value === 'catalogo') {
        lista = paneles.value;
    } else {
        // Todos: empresa primero, luego catálogo global
        lista = [...panelesEmpresa.value, ...paneles.value];
    }

    if (filtroOrigen.value === 'catalogo' && fabricantePanelSel.value !== null) {
        lista = lista.filter(p => p.fabricante_id === fabricantePanelSel.value ||
            (p.es_empresa && fabricantePanelSel.value === -1));
    }

    return lista;
});

const inversoresFiltrados = computed(() => {
    let lista: InversorSolar[] = [];

    if (filtroOrigen.value === 'empresa') {
        lista = inversoresEmpresa.value;
    } else if (filtroOrigen.value === 'catalogo') {
        lista = inversores.value;
    } else {
        lista = [...inversoresEmpresa.value, ...inversores.value];
    }

    if (filtroOrigen.value === 'catalogo' && fabricanteInversorSel.value !== null) {
        lista = lista.filter(i => i.fabricante_id === fabricanteInversorSel.value ||
            (i.es_empresa && fabricanteInversorSel.value === -1));
    }

    return lista;
});

// ─── Cálculos del sistema ─────────────────────────────────────
const cantidadPaneles = computed(() => {
    if (!panelSeleccionado.value) return 0;
    return Math.floor(props.areaUtilM2 / panelSeleccionado.value.area_m2);
});

const potenciaDcKwp = computed(() => {
    if (!panelSeleccionado.value) return 0;
    return (cantidadPaneles.value * panelSeleccionado.value.potencia_wp) / 1000;
});

const ratioDcAc = computed(() => {
    if (!inversorSeleccionado.value || potenciaDcKwp.value === 0) return 0;
    return potenciaDcKwp.value / inversorSeleccionado.value.potencia_nominal_kw;
});

const esCompatible = computed(() =>
    ratioDcAc.value >= 0.8 && ratioDcAc.value <= 1.35
);

const claseRatio = computed(() => {
    if (!ratioDcAc.value) return '';
    if (ratioDcAc.value < 0.8) return 'ratio-bajo';
    if (ratioDcAc.value > 1.35) return 'ratio-alto';
    return 'ratio-ok';
});

const claseCompatibilidad = computed(() =>
    esCompatible.value ? 'compatible' : 'incompatible'
);

const mensajeCompatibilidad = computed(() => {
    if (!ratioDcAc.value) return '';
    if (ratioDcAc.value < 0.8) return 'Inversor sobredimensionado. Considera uno de menor potencia.';
    if (ratioDcAc.value > 1.35) return 'Arreglo excede la capacidad del inversor. Considera uno de mayor potencia.';
    return `Compatibilidad correcta — Ratio DC/AC: ${ratioDcAc.value.toFixed(2)} (rango óptimo: 0.80 - 1.35)`;
});

// ─── Selección ────────────────────────────────────────────────
const seleccionarPanel = (panel: PanelSolar) => {
    panelSeleccionado.value = panel;
};

const seleccionarInversor = (inversor: InversorSolar) => {
    inversorSeleccionado.value = inversor;
};

// ─── Sugerencia automática de inversor ───────────────────────
const cargarSugerencia = async () => {
    if (potenciaDcKwp.value === 0) return;
    try {
        const resp = await catalogoApi.get(`/sugerir-inversor?potencia_kwp=${potenciaDcKwp.value}`);
        const sugerencias = Array.isArray(resp.data) ? resp.data : [];
        if (sugerencias.length > 0) {
            inversorRecomendado.value = sugerencias[0];
            if (!inversorSeleccionado.value) {
                inversorSeleccionado.value = sugerencias[0];
                fabricanteInversorSel.value = sugerencias[0].fabricante_id;
            }
        }
    } catch (err) {
        console.error('Error al obtener sugerencia de inversor:', err);
    }
};

watch(potenciaDcKwp, () => {
    cargarSugerencia();
});

// ─── Emitir selección ─────────────────────────────────────────
watch([panelSeleccionado, inversorSeleccionado], () => {
    if (panelSeleccionado.value && inversorSeleccionado.value) {
        emit('seleccion', {
            panel: panelSeleccionado.value,
            inversor: inversorSeleccionado.value,
            cantidadPaneles: cantidadPaneles.value,
            potenciaKwp: potenciaDcKwp.value
        });
    }
});

// ─── Carga inicial ────────────────────────────────────────────
onMounted(async () => {
    try {
        await cargarComponentesEmpresa();

        const [respPaneles, respInversores] = await Promise.all([
            catalogoApi.get('/paneles'),
            catalogoApi.get('/inversores')
        ]);

        paneles.value = (Array.isArray(respPaneles.data) ? respPaneles.data : []).map((p: any) => ({
            ...p,
            potencia_wp: Number(p.potencia_wp),
            eficiencia: Number(p.eficiencia),
            voc: Number(p.voc),
            isc: Number(p.isc),
            vmp: Number(p.vmp),
            imp: Number(p.imp),
            coef_temp_potencia: Number(p.coef_temp_potencia),
            coef_temp_voc: Number(p.coef_temp_voc),
            ancho_m: Number(p.ancho_m),
            alto_m: Number(p.alto_m),
            area_m2: Number(p.area_m2),
            peso_kg: Number(p.peso_kg),
        }));

        inversores.value = (Array.isArray(respInversores.data) ? respInversores.data : []).map((i: any) => ({
            ...i,
            potencia_nominal_kw: Number(i.potencia_nominal_kw),
            potencia_maxima_kw: Number(i.potencia_maxima_kw),
            eficiencia_maxima: Number(i.eficiencia_maxima),
            eficiencia_europea: Number(i.eficiencia_europea),
            voltaje_mppt_min: Number(i.voltaje_mppt_min),
            voltaje_mppt_max: Number(i.voltaje_mppt_max),
            voltaje_max_entrada: Number(i.voltaje_max_entrada),
            corriente_max_entrada: Number(i.corriente_max_entrada),
        }));

        // Fabricantes únicos
        const fabsPanel = new Map();
        paneles.value.forEach(p => fabsPanel.set(p.fabricante_id, p.fabricante_nombre));
        fabricantesPanel.value = Array.from(fabsPanel, ([id, nombre]) => ({ id, nombre }));

        const fabsInversor = new Map();
        inversores.value.forEach(i => fabsInversor.set(i.fabricante_id, i.fabricante_nombre));
        fabricantesInversor.value = Array.from(fabsInversor, ([id, nombre]) => ({ id, nombre }));

        // Panel por defecto
        const panelDefault = paneles.value.find(p => p.potencia_wp >= 450 && p.potencia_wp <= 480)
            ?? paneles.value[0];
        if (panelDefault) {
            panelSeleccionado.value = panelDefault;
            fabricantePanelSel.value = panelDefault.fabricante_id;
        }

        // ← Llamar sugerencia explícitamente después de tener panel y área
        await cargarSugerencia();

    } catch (err) {
        console.error('Error al cargar catálogo:', err);
    }
});
</script>

<style scoped>
.selector-componentes {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.selector-grupo h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.05rem;
    font-weight: 700;
    color: #04142c;
    margin: 0 0 1rem;
}

.recomendado-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #fef9c3;
    color: #854d0e;
    padding: 0.6rem 1rem;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.filtro-fabricante {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
}

.filtro-fabricante button {
    padding: 0.4rem 0.9rem;
    border: 1px solid #ddd;
    background: white;
    border-radius: 999px;
    font-size: 0.82rem;
    cursor: pointer;
    color: #555;
    transition: all 0.2s;
}

.filtro-fabricante button:hover { background: #f5f5f5; }
.filtro-fabricante button.activo {
    background: #1d4f91;
    color: white;
    border-color: #1d4f91;
    font-weight: 600;
}

.lista-componentes {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 0.75rem;
    max-height: 340px;
    overflow-y: auto;
    padding: 0.25rem;
}

.componente-card {
    border: 1.5px solid #e8edf2;
    border-radius: 10px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    background: white;
}

.componente-card:hover {
    border-color: #1d4f91;
    box-shadow: 0 4px 12px rgba(29,79,145,0.1);
}

.componente-card.seleccionado {
    border-color: #1d4f91;
    background: #f0f5fb;
    box-shadow: 0 4px 12px rgba(29,79,145,0.15);
}

.componente-card.recomendado {
    border-color: #f59e0b;
}

.componente-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.4rem;
}

.componente-potencia {
    font-size: 1.1rem;
    font-weight: 800;
    color: #1d4f91;
}

.componente-badge {
    font-size: 0.75rem;
    background: #e8f5e9;
    color: #16a34a;
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    font-weight: 600;
}

.componente-modelo {
    font-size: 0.85rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 0.15rem;
}

.componente-fabricante {
    font-size: 0.78rem;
    color: #888;
    margin-bottom: 0.5rem;
}

.componente-specs {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    font-size: 0.72rem;
    color: #666;
}

.componente-specs span {
    background: #f5f5f5;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
}

/* Resumen */
.resumen-sistema {
    background: #f8fafc;
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid #e8edf2;
}

.resumen-sistema h4 {
    margin: 0 0 1rem;
    font-size: 0.95rem;
    font-weight: 700;
    color: #04142c;
}

.resumen-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 1rem;
}

.resumen-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.resumen-label { font-size: 0.75rem; color: #888; }
.resumen-valor { font-size: 1.2rem; font-weight: 700; color: #04142c; }
.resumen-valor.ratio-ok { color: #16a34a; }
.resumen-valor.ratio-bajo,
.resumen-valor.ratio-alto { color: #f59e0b; }

.compatibilidad {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
}

.compatibilidad.compatible {
    background: #f0fdf4;
    color: #16a34a;
}

.compatibilidad.incompatible {
    background: #fef9c3;
    color: #854d0e;
}

.filtro-origen {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    padding: 0.25rem;
    background: #f0f4f8;
    border-radius: 8px;
    width: fit-content;
}

.filtro-origen button {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 1rem;
    border: none;
    background: transparent;
    border-radius: 6px;
    font-size: 0.82rem;
    cursor: pointer;
    color: #555;
    font-weight: 500;
    transition: all 0.2s;
}

.filtro-origen button:hover { background: white; color: #04142c; }
.filtro-origen button.activo {
    background: white;
    color: #1d4f91;
    font-weight: 700;
    box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

.count-badge {
    background: #1d4f91;
    color: white;
    font-size: 0.68rem;
    padding: 0.1rem 0.4rem;
    border-radius: 999px;
    font-weight: 700;
}

.badge-empresa {
    background: #f0fdf4;
    color: #16a34a;
    border: 1px solid #bbf7d0;
    font-size: 0.65rem;
    padding: 0.1rem 0.4rem;
    border-radius: 999px;
    font-weight: 700;
}

@media (max-width: 768px) {
    .resumen-grid { grid-template-columns: repeat(2, 1fr); }
    .lista-componentes { grid-template-columns: 1fr; max-height: 280px; }
}
</style>