<template>
    <div class="contenedor">
        <nav class="navbar">
            <div class="navbar-brand">
                <img class="navbar-logo" :src="logoSolarEye" alt="Solar Eye" />
            </div>
            <div class="navbar-user">
                <span class="navbar-user-name">{{ authStore.usuario?.nombre }}</span>
                <button class="nav-link" @click="router.push('/admin/dashboard')">← Volver</button>
            </div>
        </nav>

        <div class="encabezado">
            <div>
                <h1>Catálogo de componentes</h1>
                <p>Administra los paneles e inversores de tu empresa</p>
            </div>
            <button class="btn-agregar" @click="irAgregar(tabActivo)">
                + Agregar {{ tabActivo === 'panel' ? 'panel' : 'inversor' }}
            </button>
        </div>

        <!-- Tabs -->
        <div class="tabs">
            <button
                class="tab-btn"
                :class="{ activo: tabActivo === 'panel' }"
                @click="tabActivo = 'panel'; cargarComponentes()">
                Mis paneles ({{ paneles.length }})
            </button>
            <button
                class="tab-btn"
                :class="{ activo: tabActivo === 'inversor' }"
                @click="tabActivo = 'inversor'; cargarComponentes()">
                Mis inversores ({{ inversores.length }})
            </button>
        </div>

        <!-- Mensaje vacío -->
        <div class="vacio" v-if="tabActivo === 'panel' && paneles.length === 0 && !cargando">
            <i class="bi bi-box"></i>
            <p>No tienes paneles registrados</p>
            <button class="btn-agregar" @click="irAgregar('panel')">+ Agregar primer panel</button>
        </div>

        <div class="vacio" v-if="tabActivo === 'inversor' && inversores.length === 0 && !cargando">
            <i class="bi bi-box"></i>
            <p>No tienes inversores registrados</p>
            <button class="btn-agregar" @click="irAgregar('inversor')">+ Agregar primer inversor</button>
        </div>

        <!-- Tabla paneles -->
        <div class="tabla-wrap" v-if="tabActivo === 'panel' && paneles.length > 0">
            <table class="tabla">
                <thead>
                    <tr>
                        <th>Fabricante</th>
                        <th>Modelo</th>
                        <th>Potencia</th>
                        <th>Eficiencia</th>
                        <th>Voc</th>
                        <th>Isc</th>
                        <th>Área m²</th>
                        <th>Tecnología</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="panel in paneles" :key="panel.id">
                        <td>{{ panel.fabricante ?? '—' }}</td>
                        <td class="modelo-col">{{ panel.modelo }}</td>
                        <td><span class="badge-potencia">{{ panel.potencia_wp }} W</span></td>
                        <td>{{ panel.eficiencia ? (panel.eficiencia * 100).toFixed(1) + '%' : '—' }}</td>
                        <td>{{ panel.voc ?? '—' }} V</td>
                        <td>{{ panel.isc ?? '—' }} A</td>
                        <td>{{ panel.area_m2 ?? '—' }} m²</td>
                        <td>{{ panel.tecnologia ?? '—' }}</td>
                        <td class="acciones-col">
                            <button class="btn-editar" @click="irEditar(panel, 'panel')">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn-eliminar" @click="confirmarEliminar(panel)">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Tabla inversores -->
        <div class="tabla-wrap" v-if="tabActivo === 'inversor' && inversores.length > 0">
            <table class="tabla">
                <thead>
                    <tr>
                        <th>Fabricante</th>
                        <th>Modelo</th>
                        <th>Potencia nominal</th>
                        <th>Eficiencia</th>
                        <th>MPPT min</th>
                        <th>MPPT max</th>
                        <th>Num. MPPT</th>
                        <th>Fases</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="inv in inversores" :key="inv.id">
                        <td>{{ inv.fabricante ?? '—' }}</td>
                        <td class="modelo-col">{{ inv.modelo }}</td>
                        <td><span class="badge-potencia">{{ inv.potencia_nominal_kw }} kW</span></td>
                        <td>{{ inv.eficiencia_maxima ? (inv.eficiencia_maxima * 100).toFixed(1) + '%' : '—' }}</td>
                        <td>{{ inv.voltaje_mppt_min ?? '—' }} V</td>
                        <td>{{ inv.voltaje_mppt_max ?? '—' }} V</td>
                        <td>{{ inv.numero_mppt ?? '—' }}</td>
                        <td>{{ inv.fases ?? '—' }}</td>
                        <td class="acciones-col">
                            <button class="btn-editar" @click="irEditar(inv, 'inversor')">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn-eliminar" @click="confirmarEliminar(inv)">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/authStore';
import catalogoApi from '../../simulaciones/api/catalogoApi';
import logoSolarEye from '../../../assets/images/LogoSolarEye.png';

const router = useRouter();
const authStore = useAuthStore();
const empresa_id = authStore.usuario?.empresa_id;

const paneles   = ref<any[]>([]);
const inversores = ref<any[]>([]);
const cargando  = ref(false);
const guardando = ref(false);
const tabActivo = ref<'panel' | 'inversor'>('panel');

const modalAbierto = ref(false);
const modalEliminar = ref(false);
const editando  = ref(false);
const tipoModal = ref<'panel' | 'inversor'>('panel');
const componenteAEliminar = ref<any>(null);

const formVacio = () => ({
    id: null,
    empresa_id: empresa_id,
    tipo: 'panel',
    fabricante: '',
    modelo: '',
    potencia_wp: null,
    eficiencia: null,
    voc: null,
    isc: null,
    vmp: null,
    imp: null,
    coef_temp_potencia: null,
    coef_temp_voc: null,
    area_m2: null,
    tecnologia: '',
    potencia_nominal_kw: null,
    eficiencia_maxima: null,
    voltaje_mppt_min: null,
    voltaje_mppt_max: null,
    voltaje_max_entrada: null,
    corriente_max_entrada: null,
    numero_mppt: null,
    numero_entradas_por_mppt: null,
    fases: ''
});

const form = ref(formVacio());

const cargarComponentes = async () => {
    if (!empresa_id) return;
    cargando.value = true;
    try {
        const [respPaneles, respInversores] = await Promise.all([
            catalogoApi.get(`/empresa/${empresa_id}/componentes?tipo=panel`),
            catalogoApi.get(`/empresa/${empresa_id}/componentes?tipo=inversor`)
        ]);
        paneles.value   = Array.isArray(respPaneles.data)   ? respPaneles.data   : [];
        inversores.value = Array.isArray(respInversores.data) ? respInversores.data : [];
    } catch (err) {
        console.error('Error cargando componentes:', err);
    } finally {
        cargando.value = false;
    }
};

// Reemplaza abrirModal por:
const irAgregar = (tipo: 'panel' | 'inversor') => {
    router.push(`/admin/catalogo/agregar/${tipo}`);
};

const irEditar = (componente: any, tipo: 'panel' | 'inversor') => {
    router.push(`/admin/catalogo/editar/${tipo}/${componente.id}`);
};

const cerrarModal = () => {
    modalAbierto.value = false;
    form.value = formVacio();
};

const guardar = async () => {
    if (!form.value.modelo) { alert('El modelo es obligatorio'); return; }
    guardando.value = true;
    try {
        if (editando.value) {
            await catalogoApi.put('/empresa/componentes', form.value);
        } else {
            await catalogoApi.post('/empresa/componentes', { ...form.value, tipo: tipoModal.value });
        }
        cerrarModal();
        await cargarComponentes();
    } catch (err) {
        console.error('Error guardando:', err);
        alert('Error al guardar el componente');
    } finally {
        guardando.value = false;
    }
};

const confirmarEliminar = (componente: any) => {
    componenteAEliminar.value = componente;
    modalEliminar.value = true;
};

const eliminar = async () => {
    if (!componenteAEliminar.value) return;
    guardando.value = true;
    try {
        await catalogoApi.delete(
            `/empresa/componentes/${componenteAEliminar.value.id}?empresa_id=${empresa_id}`
        );
        modalEliminar.value = false;
        componenteAEliminar.value = null;
        await cargarComponentes();
    } catch (err) {
        console.error('Error eliminando:', err);
    } finally {
        guardando.value = false;
    }
};

onMounted(cargarComponentes);
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.encabezado h1 { font-size: 1.8rem; color: #04142c; margin: 0; font-weight: 800; }
.encabezado p  { color: #666; font-size: 0.9rem; margin: 0.25rem 0 0; }

.btn-agregar {
    padding: 0.65rem 1.4rem;
    background: #1d4f91;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background 0.2s;
}
.btn-agregar:hover { background: #163d72; }

/* Tabs */
.tabs {
    display: flex;
    background: white;
    border-bottom: 2px solid #e8edf2;
    padding: 0 1.5rem;
}

.tab-btn {
    padding: 0.9rem 1.5rem;
    background: transparent;
    border: none;
    border-bottom: 3px solid transparent;
    margin-bottom: -2px;
    font-size: 0.9rem;
    font-weight: 600;
    color: #666;
    cursor: pointer;
    transition: all 0.2s;
}

.tab-btn:hover { color: #1d4f91; }
.tab-btn.activo { color: #1d4f91; border-bottom-color: #1d4f91; }

/* Vacío */
.vacio {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    gap: 1rem;
    color: #999;
}

.vacio i { font-size: 3rem; }
.vacio p { font-size: 1rem; }

/* Tabla */
.tabla-wrap {
    padding: 1.5rem;
    overflow-x: auto;
}

.tabla {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(4,20,44,0.07);
}

.tabla th {
    background: #04142c;
    color: white;
    padding: 0.75rem 1rem;
    text-align: left;
    font-size: 0.78rem;
    font-weight: 600;
    white-space: nowrap;
}

.tabla td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f0f0f0;
    font-size: 0.875rem;
    color: #333;
}

.tabla tr:hover td { background: #f8fafc; }
.modelo-col { font-weight: 600; color: #04142c; }

.badge-potencia {
    background: #dbeafe;
    color: #1d4f91;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 700;
}

.acciones-col { display: flex; gap: 0.5rem; }

.btn-editar {
    padding: 0.35rem 0.65rem;
    background: #f0f5fb;
    color: #1d4f91;
    border: 1px solid #c7d9f0;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
}
.btn-editar:hover { background: #dbeafe; }

.btn-eliminar {
    padding: 0.35rem 0.65rem;
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
}
.btn-eliminar:hover { background: #fee2e2; }

/* Modal */
.overlay {
    position: fixed;
    inset: 0;
    background: rgba(4,20,44,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 1rem;
}

.modal {
    background: white;
    border-radius: 14px;
    padding: 2rem;
    width: 100%;
    max-width: 640px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(4,20,44,0.25);
}

.modal-chico { max-width: 440px; }

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.modal-header h2 { font-size: 1.2rem; color: #04142c; margin: 0; }

.btn-cerrar {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: #666;
    padding: 0.25rem;
}
.btn-cerrar:hover { color: #333; }

.formulario { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }

.fila-doble { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.fila-cuatro { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }

.grupo { display: flex; flex-direction: column; gap: 0.4rem; }
.grupo label { font-size: 0.85rem; font-weight: 600; color: #333; }

.grupo input, .grupo select {
    padding: 0.6rem 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.9rem;
    outline: none;
    font-family: inherit;
    transition: border-color 0.2s;
}
.grupo input:focus, .grupo select:focus { border-color: #1d4f91; }

.ayuda-campos {
    font-size: 0.78rem;
    color: #999;
    background: #f8fafc;
    padding: 0.6rem 0.75rem;
    border-radius: 6px;
    border: 1px solid #e8edf2;
}

.modal-botones {
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

.btn-guardar {
    padding: 0.6rem 1.4rem;
    background: #1d4f91;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
.btn-guardar:hover { background: #163d72; }
.btn-guardar:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-eliminar-confirm {
    padding: 0.6rem 1.4rem;
    background: #dc2626;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
.btn-eliminar-confirm:hover { background: #b91c1c; }

@media (max-width: 640px) {
    .fila-doble { grid-template-columns: 1fr; }
    .fila-cuatro { grid-template-columns: repeat(2, 1fr); }
}
</style>