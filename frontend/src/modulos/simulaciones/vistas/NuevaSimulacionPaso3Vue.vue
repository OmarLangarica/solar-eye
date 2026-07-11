<template>
    <div class="contenedor">

        <nav class="navbar">
            <div class="navbar-brand">
                <img class="navbar-logo" :src="logoSolarEye" alt="Solar Eye" />
            </div>
            <div class="navbar-links">
                <button class="nav-link" @click="volver">← Volver</button>
            </div>
            <div class="navbar-user">
                <span class="navbar-user-name">{{ authStore.usuario?.nombre }} {{ authStore.usuario?.apellido }}</span>
                <button class="nav-link" @click="cambiarEmpresa" title="Cambiar de Empresa">
                    <i class="bi bi-building-down"></i>
                </button>
                <button class="nav-link nav-link--logout" @click="cerrarSesion" title="Cerrar sesión">
                    <i class="bi bi-box-arrow-right"></i>
                </button>
            </div>
        </nav>

        <!-- Encabezado -->
        <div class="encabezado">
            <div>
                <h1>Nueva Simulación</h1>
                <p>Cliente: <strong>{{ route.query.nombre }}</strong></p>
            </div>
        </div>

        <!-- Indicador de pasos -->
        <div class="pasos">
            <div class="paso completado">
                <div class="paso-numero">✓</div>
                <span>Datos generales</span>
            </div>
            <div class="paso-linea completado"></div>
            <div class="paso completado">
                <div class="paso-numero">✓</div>
                <span>Techo</span>
            </div>
            <div class="paso-linea completado"></div>
            <div class="paso activo">
                <div class="paso-numero">3</div>
                <span>Componentes</span>
            </div>
            <div class="paso-linea"></div>
            <div class="paso">
                <div class="paso-numero">4</div>
                <span>Consumo</span>
            </div>
            <div class="paso-linea"></div>
            <div class="paso">
                <div class="paso-numero">5</div>
                <span>Resultados</span>
            </div>
        </div>

        <!-- Card principal -->
        <div class="card">
            <h2>Paso 3 — Selección de componentes</h2>
            <p class="subtitulo">
                Elige el panel solar e inversor para tu sistema.
                El área útil disponible es <strong>{{ areaUtil }} m²</strong>.
            </p>

            <div v-if="cargando" class="estado-carga">
                Cargando catálogo de componentes...
            </div>

            <div v-else-if="error" class="error-msg-box">
                {{ error }}
            </div>

            <template v-else>
                <SelectorComponentesVue
                    :area-util-m2="areaUtil"
                    @seleccion="onSeleccion"
                />

                <div class="botones">
                    <button
                        class="btn-siguiente"
                        @click="avanzar"
                        :disabled="!seleccion || guardando">
                        {{ guardando ? 'Guardando...' : 'Siguiente →' }}
                    </button>
                </div>
            </template>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../../stores/authStore';
import { useAuth } from '../../auth/controladores/useAuth';
import { useSimulaciones } from '../controladores/useSimulaciones';
import SelectorComponentesVue from '../componentes/SelectorComponentesVue.vue';
import type { PanelSolar, InversorSolar } from '../interfaces/simulaciones-interface';
import logoSolarEye from '../../../assets/images/LogoSolarEye.png';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { cerrarSesion } = useAuth();
const { obtieneDatosTecho } = useSimulaciones();

const cliente_id = Number(route.params.cliente_id);
const simulacion_id = Number(route.params.simulacion_id);

const areaUtil = ref(0);
const cargando = ref(true);
const guardando = ref(false);
const error = ref('');

const seleccion = ref<{
    panel: PanelSolar;
    inversor: InversorSolar;
    cantidadPaneles: number;
    potenciaKwp: number;
} | null>(null);

const volver = () => {
    router.push({
        path: `/simulaciones/nueva/${cliente_id}/paso2/${simulacion_id}`,
        query: { nombre: route.query.nombre }
    });
};

const cambiarEmpresa = () => router.push('/seleccionar-empresa');

const onSeleccion = (payload: {
    panel: PanelSolar;
    inversor: InversorSolar;
    cantidadPaneles: number;
    potenciaKwp: number;
}) => {
    seleccion.value = payload;
};

const avanzar = () => {
    if (!seleccion.value) return;

    // Guardar selección en sessionStorage para usarla en resultados
    sessionStorage.setItem(
        `componentes_${simulacion_id}`,
        JSON.stringify({
            panel_id: seleccion.value.panel.id,
            panel_modelo: `${seleccion.value.panel.fabricante_nombre} ${seleccion.value.panel.modelo}`,
            panel_potencia_wp: seleccion.value.panel.potencia_wp,
            panel_eficiencia: seleccion.value.panel.eficiencia,
            panel_coef_temp: seleccion.value.panel.coef_temp_potencia,
            panel_area_m2: seleccion.value.panel.area_m2,
            inversor_id: seleccion.value.inversor.id,
            inversor_modelo: `${seleccion.value.inversor.fabricante_nombre} ${seleccion.value.inversor.modelo}`,
            inversor_potencia_kw: seleccion.value.inversor.potencia_nominal_kw,
            inversor_eficiencia: seleccion.value.inversor.eficiencia_maxima,
            cantidad_paneles: seleccion.value.cantidadPaneles,
            potencia_kwp: seleccion.value.potenciaKwp
        })
    );

    router.push({
        path: `/simulaciones/nueva/${cliente_id}/paso4/${simulacion_id}`,
        query: { nombre: route.query.nombre }
    });
};

onMounted(async () => {
    try {
        const techo = await obtieneDatosTecho(simulacion_id);
        const techoData = Array.isArray(techo) ? techo[0] : techo;
        if (techoData?.area_util_m2) {
            areaUtil.value = Number(techoData.area_util_m2);
        }
    } catch (err) {
        console.error('Error cargando techo:', err);
        error.value = 'No se pudo cargar el área del techo';
    } finally {
        cargando.value = false;
    }
});
</script>

<style scoped>
.contenedor {
    padding: 0 0 2rem;
    max-width: 900px;
    margin: 0 auto;
}

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

.navbar-brand { display: flex; align-items: center; gap: 0.75rem; flex: 0 0 auto; }
.navbar-logo { display: block; height: 36px; width: auto; object-fit: contain; }
.navbar-links, .navbar-user { display: flex; align-items: center; flex-wrap: wrap; gap: 1rem; }
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
    transition: opacity 0.2s ease;
}
.nav-link:hover { opacity: 0.8; }
.nav-link--logout { font-size: 1.15rem; display: inline-flex; align-items: center; }

.encabezado { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.encabezado h1 { font-size: 1.8rem; color: #333; margin: 0; }
.encabezado p { color: #666; font-size: 0.9rem; margin: 0.25rem 0 0; }

/* Pasos */
.pasos {
    display: flex;
    align-items: center;
    margin-bottom: 2rem;
    background: white;
    padding: 1.25rem 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.paso { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; flex: 1; }

.paso-numero {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: #e0e0e0;
    color: #999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.95rem;
}

.paso span { font-size: 0.8rem; color: #999; font-weight: 500; }
.paso.activo .paso-numero { background-color: #1d4f91; color: white; }
.paso.activo span { color: #1d4f91; font-weight: 700; }
.paso.completado .paso-numero { background-color: #4ade80; color: white; }
.paso.completado span { color: #16a34a; }

.paso-linea { flex: 1; height: 2px; background-color: #e0e0e0; margin-bottom: 1.2rem; }
.paso-linea.completado { background-color: #4ade80; }

/* Card */
.card {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.card h2 { font-size: 1.2rem; color: #333; margin: 0 0 0.5rem; }
.subtitulo { color: #666; font-size: 0.9rem; margin-bottom: 1.75rem; }

.estado-carga { text-align: center; padding: 2rem; color: #666; }

.error-msg-box {
    padding: 0.75rem;
    background: #fef2f2;
    color: #ef4444;
    border-radius: 6px;
    font-size: 0.9rem;
    margin-bottom: 1rem;
}

.botones { display: flex; justify-content: flex-end; margin-top: 2rem; }

.btn-siguiente {
    padding: 0.75rem 2rem;
    background-color: #1d4f91;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 1rem;
    transition: background-color 0.2s;
}
.btn-siguiente:hover { background-color: #163d72; }
.btn-siguiente:disabled { opacity: 0.6; cursor: not-allowed; }
</style>