<template>
    <div class="contenedor">

        <div class="encabezado">
            <div>
                <h1>Nueva Simulación</h1>
                <p>Cliente: <strong>{{ route.query.nombre }}</strong></p>
            </div>
            <div class="botones">
                <button class="btn-volver" @click="router.push({ 
                    path: `/simulaciones/nueva/${cliente_id}/${simulacion_id}`, 
                    query: { nombre: route.query.nombre } 
                })">← Volver</button>

                <button class="btn-volver" @click="router.push({ 
                    path: `/simulaciones/${cliente_id}`, 
                    query: { nombre: route.query.nombre } 
                })">↩ Volver a simulaciones</button>
            </div>
        </div>

        <!-- Indicador de pasos -->
        <div class="pasos">
            <div class="paso completado">
                <div class="paso-numero">✓</div>
                <span>Datos generales</span>
            </div>
            <div class="paso-linea completado"></div>
            <div class="paso activo">
                <div class="paso-numero">2</div>
                <span>Techo</span>
            </div>
            <div class="paso-linea"></div>
            <div class="paso">
                <div class="paso-numero">3</div>
                <span>Consumo</span>
            </div>
            <div class="paso-linea"></div>
            <div class="paso">
                <div class="paso-numero">4</div>
                <span>Resultados</span>
            </div>
        </div>

        <!-- Layout principal: mapa + panel -->
        <div class="layout">

            <!-- Panel izquierdo: mapa -->
            <div class="panel-mapa">
                <div class="panel-header">
                    <h2>Traza el área del techo</h2>
                    <p>Usa las herramientas del mapa para dibujar el polígono del techo de la propiedad.</p>
                </div>
                <div id="mapa" ref="mapaRef"></div>
                <div class="instrucciones">
                    <span>Haz clic en el ícono de polígono para comenzar a trazar</span>
                    <span>Cierra el polígono haciendo clic en el primer punto</span>
                    <span>Usa el ícono de papelera para borrar y volver a trazar</span>
                </div>
            </div>

            <!-- Panel derecho: datos -->
            <div class="panel-datos">

                <!-- Datos calculados del techo -->
                <div class="card-datos" :class="{ 'card-activa': datosTecho.area_m2 > 0 }">
                    <h3>Datos del techo</h3>
                    <div v-if="datosTecho.area_m2 > 0" class="datos-grid">
                        <div class="dato">
                            <span class="dato-label">Área total</span>
                            <span class="dato-valor" :class="{ 'error-text': datosTecho.area_m2 > AREA_MAXIMA_M2 }">
                                {{ datosTecho.area_m2.toFixed(2) }} m²
                            </span>
                        </div>
                        <p v-if="datosTecho.area_m2 > AREA_MAXIMA_M2" class="error-msg-area">
                            ⚠️ El área es demasiado grande (Máx. {{ AREA_MAXIMA_M2 }} m²). Por favor, ajusta el trazo.
                        </p>
                        <div class="dato">
                            <span class="dato-label">Área útil</span>
                            <span class="dato-valor">{{ datosTecho.area_util_m2?.toFixed(2) }} m²</span>
                        </div>
                        <div class="dato">
                            <span class="dato-label">Coordenadas</span>
                            <span class="dato-valor">{{ datosTecho.latitud.toFixed(4) }}, {{ datosTecho.longitud.toFixed(4) }}</span>
                        </div>
                    </div>
                    <p v-else class="sin-datos-card">Traza el techo en el mapa para ver los datos.</p>
                </div>

                <!-- Configuración del techo -->
                <div class="card-datos" v-if="datosTecho.area_m2 > 0">
                    <h3>Configuración del techo</h3>
                    <div class="formulario">
                        <div class="grupo">
                            <label>Tipo de techo</label>
                            <select v-model="datosTecho.tipo_techo">
                                <option value="inclinado">Inclinado</option>
                                <option value="plano">Plano</option>
                                <option value="mixto">Mixto</option>
                            </select>
                        </div>
                        <div class="grupo">
                            <label>Ángulo de inclinación (°)</label>
                            <input v-model.number="datosTecho.angulo_inclinacion_deg" type="number" min="0" max="90" />
                        </div>
                        <div class="grupo">
                            <label>Factor de sombra (0-1)</label>
                            <input v-model.number="datosTecho.factor_sombra" type="number" min="0" max="1" step="0.05" />
                            <span class="ayuda">1 = sin sombra, 0.8 = sombra moderada</span>
                        </div>
                    </div>
                </div>

                <!-- Datos geográficos NASA -->
                <div class="card-datos" :class="{ 'card-activa': datosGeo !== null }">
                    <h3>Datos geográficos</h3>
                    <div v-if="cargandoNasa" class="cargando-nasa">
                        <div class="spinner"></div>
                        <span>Consultando NASA POWER...</span>
                    </div>
                    <div v-else-if="datosGeo" class="datos-grid">
                        <div class="dato">
                            <span class="dato-label">Horas sol pico</span>
                            <span class="dato-valor">{{ datosGeo.horas_sol_pico_diarias }} HSP/día</span>
                        </div>
                        <div class="dato">
                            <span class="dato-label">Irradiación anual</span>
                            <span class="dato-valor">{{ datosGeo.irradiacion_anual_kwh_m2 }} kWh/m²</span>
                        </div>
                        <div class="dato">
                            <span class="dato-label">Temp. promedio</span>
                            <span class="dato-valor">{{ datosGeo.temperatura_promedio_anual }}°C</span>
                        </div>
                        <div class="dato">
                            <span class="dato-label">Altitud</span>
                            <span class="dato-valor">{{ datosGeo.altitud_msnm }} msnm</span>
                        </div>
                        <div class="dato">
                            <span class="dato-label">Zona climática</span>
                            <span class="dato-valor">{{ datosGeo.zona_climatica }}</span>
                        </div>
                        <div class="dato">
                            <span class="dato-label">Velocidad viento</span>
                            <span class="dato-valor">{{ datosGeo.velocidad_viento_promedio }} m/s</span>
                        </div>
                    </div>
                    <p v-else class="sin-datos-card">Se obtendrán automáticamente al trazar el techo.</p>
                </div>

                <!-- Botón siguiente -->
                <button
                    class="btn-siguiente"
                    :disabled="!puedeAvanzar || cargando"
                    @click="guardarYAvanzar"
                >
                    {{ cargando ? 'Guardando...' : 'Siguiente →' }}
                </button>

                <div class="mensaje error-msg-box" v-if="error">{{ error }}</div>

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import { useSimulaciones } from '../controladores/useSimulaciones';
import type { DatosTecho, DatosGeograficos } from '../interfaces/simulaciones-interface';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';
import simulacionesApi from '../api/simulacionesApi';


const router = useRouter();
const route = useRoute();
const { cargando, error, guardarDatosTecho, consultarNasa, guardarDatosGeograficos, obtieneConsumoElectrico,obtieneDatosGeograficos,obtieneDatosTecho } = useSimulaciones();

const AREA_MAXIMA_M2 = 1000; 

const cliente_id = Number(route.params.cliente_id);
const simulacion_id = Number(route.params.simulacion_id);

const mapaRef = ref<HTMLElement | null>(null);
const cargandoNasa = ref(false);
const datosGeo = ref<DatosGeograficos | null>(null);

const datosTecho = reactive<DatosTecho>({
    simulacion_id,
    geojson: '',
    area_m2: 0,
    perimetro_m: null,
    latitud: 0,
    longitud: 0,
    tipo_techo: 'inclinado',
    angulo_inclinacion_deg: 15,
    azimut_deg: 180,
    factor_sombra: 0.95,
    area_util_m2: null
});

let mapa: L.Map | null = null;
let capaEdicion: L.FeatureGroup | null = null;

// Calcula área en m² de un polígono usando la fórmula de Gauss
const calcularAreaM2 = (coordenadas: [number, number][]): number => {
    const R = 6371000;
    const toRad = (deg: number) => deg * Math.PI / 180;
    let area = 0;
    const n = coordenadas.length;
    for (let i = 0; i < n; i++) {
        const actual = coordenadas[i];
        const siguiente = coordenadas[(i + 1) % n];

        if (!actual || !siguiente) continue; // ← resuelve el undefined

        const lat1 = actual[0];
        const lng1 = actual[1];
        const lat2 = siguiente[0];
        const lng2 = siguiente[1];

        area += toRad(lng2 - lng1) * (2 + Math.sin(toRad(lat1)) + Math.sin(toRad(lat2)));
    }
    return Math.abs(area * R * R / 2);
};

// Calcula perímetro en metros
const calcularPerimetroM = (coordenadas: [number, number][]): number => {
    let perimetro = 0;
    for (let i = 0; i < coordenadas.length; i++) {
        const actual = coordenadas[i];
        const siguiente = coordenadas[(i + 1) % coordenadas.length];

        if (!actual || !siguiente) continue; // ← esto resuelve el undefined

        const p1 = L.latLng(actual[0], actual[1]);
        const p2 = L.latLng(siguiente[0], siguiente[1]);
        perimetro += p1.distanceTo(p2);
    }
    return parseFloat(perimetro.toFixed(2));
};

const puedeAvanzar = computed(() => 
    datosTecho.area_m2 > 0 && 
    datosTecho.area_m2 <= AREA_MAXIMA_M2 &&
    datosGeo.value !== null
);

onMounted(() => {
    // Inicializa el mapa centrado en México
    mapa = L.map(mapaRef.value!, {
        center: [23.6345, -102.5528],
        zoom: 5,
    });

    const buscador = (L.Control as any).geocoder({
        defaultMarkGeocode: false, 
        placeholder: 'Buscar dirección...',
        errorMessage: 'No se encontró la ubicación.'
    })
    .on('markgeocode', function(e: any) {
        const bbox = e.geocode.bbox;
        const poly = L.polygon([
            [bbox.getSouthEast().lat, bbox.getSouthEast().lng],
            [bbox.getNorthEast().lat, bbox.getNorthEast().lng],
            [bbox.getNorthWest().lat, bbox.getNorthWest().lng],
            [bbox.getSouthWest().lat, bbox.getSouthWest().lng]
        ]);
        
        // Ajustar el mapa a la ubicación encontrada con un zoom cercano
        mapa?.fitBounds(poly.getBounds(), { maxZoom: 22 });
    })
    .addTo(mapa);

    // Capa de satélite
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri',
        maxNativeZoom: 18,
        maxZoom: 22
    }).addTo(mapa);

    // Capa de etiquetas encima del satélite
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        attribution: '',
        maxNativeZoom: 18,
        maxZoom: 22
    }).addTo(mapa);

    // Capa editable para el dibujo
    capaEdicion = new L.FeatureGroup();
    mapa.addLayer(capaEdicion);

    // Controles de dibujo — solo polígono
    const controles = new (L as any).Control.Draw({
        edit: { featureGroup: capaEdicion },
        draw: {
            polygon: {
                allowIntersection: false,
                showArea: true,
                shapeOptions: {
                    color: '#FF7043',
                    fillOpacity: 0.3
                },
                maxPoints: 4,
            },
            polyline: false,
            circle: false,
            marker: false,
            circlemarker: false,
            rectangle: false
        }
    });
    mapa.addControl(controles);

    // Evento cuando se termina de dibujar
    mapa.on((L as any).Draw.Event.CREATED, async (e: any) => {
        capaEdicion!.clearLayers();
        capaEdicion!.addLayer(e.layer);

        const geojson = e.layer.toGeoJSON();
        const coordenadas: [number, number][] = geojson.geometry.coordinates[0].map(
            ([lng, lat]: [number, number]) => [lat, lng]
        );

        const centroide = e.layer.getBounds().getCenter();
        const area = calcularAreaM2(coordenadas);
        const perimetro = calcularPerimetroM(coordenadas);

        datosTecho.geojson = JSON.stringify(geojson);
        datosTecho.area_m2 = parseFloat(area.toFixed(2));
        datosTecho.perimetro_m = perimetro;
        datosTecho.latitud = parseFloat(centroide.lat.toFixed(7));
        datosTecho.longitud = parseFloat(centroide.lng.toFixed(7));
        datosTecho.area_util_m2 = parseFloat((area * 0.85).toFixed(2));

        // Consulta NASA automáticamente
        cargandoNasa.value = true;
        const geo = await consultarNasa(datosTecho.latitud, datosTecho.longitud);
        if (geo) datosGeo.value = geo;
        cargandoNasa.value = false;
    });

    // Evento cuando se elimina el dibujo
    mapa.on((L as any).Draw.Event.DELETED, () => {
        datosTecho.geojson = '';
        datosTecho.area_m2 = 0;
        datosTecho.perimetro_m = null;
        datosTecho.latitud = 0;
        datosTecho.longitud = 0;
        datosTecho.area_util_m2 = null;
        datosGeo.value = null;
    });
});

onUnmounted(() => {
    mapa?.remove();
});

const guardarYAvanzar = async () => {
    if (!datosGeo.value) return;

    try {
        const techoExistente = await obtieneDatosTecho(simulacion_id);
        const geoExistente = await obtieneDatosGeograficos(simulacion_id);

        if (techoExistente && !techoExistente.error && techoExistente.id) {
            await simulacionesApi.put('/techo', { 
                ...datosTecho, 
                id: Number(techoExistente.id)
            });
        } else {
            await guardarDatosTecho({ ...datosTecho });
        }

        if (geoExistente && !geoExistente.error && geoExistente.id) {
            await simulacionesApi.put('/geograficos', { 
                ...datosGeo.value, 
                simulacion_id,
                id: Number(geoExistente.id)
            });
        } else {
            await guardarDatosGeograficos({ ...datosGeo.value, simulacion_id });
        }

        // Navega independientemente del error.value del composable
        router.push({
            path: `/simulaciones/nueva/${cliente_id}/paso3/${simulacion_id}`,
            query: { nombre: route.query.nombre }
        });

    } catch (err) {
        console.error('Error al guardar:', err);
        error.value = 'Error al guardar los datos';
    }
};
</script>

<style scoped>
.contenedor { padding: 2rem; max-width: 1400px; margin: 0 auto; }

.encabezado {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.encabezado h1 { font-size: 1.8rem; color: #333; margin: 0; }
.encabezado p { color: #666; font-size: 0.9rem; margin: 0.25rem 0 0; }

.btn-volver {
    padding: 0.6rem 1.2rem;
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
.btn-volver:hover { background-color: #e0e0e0; }

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

.paso {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    flex: 1;
}

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

.paso.activo .paso-numero { background-color: #FF7043; color: white; }
.paso.activo span { color: #FF7043; font-weight: 700; }
.paso.completado .paso-numero { background-color: #4ade80; color: white; }
.paso.completado span { color: #16a34a; }

.paso-linea {
    flex: 1;
    height: 2px;
    background-color: #e0e0e0;
    margin-bottom: 1.2rem;
}
.paso-linea.completado { background-color: #4ade80; }

/* Layout */
.layout {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 1.5rem;
    align-items: start;
}

/* Panel mapa */
.panel-mapa {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    overflow: hidden;
}

.panel-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #f0f0f0;
}

.panel-header h2 { font-size: 1.1rem; color: #333; margin: 0 0 0.25rem; }
.panel-header p { color: #666; font-size: 0.85rem; margin: 0; }

#mapa { height: 520px; width: 100%; }

.instrucciones {
    padding: 1rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    background: #fafafa;
    border-top: 1px solid #f0f0f0;
}

.instrucciones span { font-size: 0.82rem; color: #666; }

/* Panel datos */
.panel-datos {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.card-datos {
    background: white;
    border-radius: 8px;
    padding: 1.25rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    border: 2px solid transparent;
    transition: border-color 0.3s;
}

.card-activa { border-color: #FF7043; }

.card-datos h3 { font-size: 0.95rem; color: #333; margin: 0 0 1rem; }

.datos-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
}

.dato {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
}

.dato-label { font-size: 0.75rem; color: #999; }
.dato-valor { font-size: 0.9rem; font-weight: 600; color: #333; }

.sin-datos-card { color: #999; font-size: 0.85rem; margin: 0; }

.formulario { display: flex; flex-direction: column; gap: 0.75rem; }

.grupo { display: flex; flex-direction: column; gap: 0.3rem; }

.grupo label { font-size: 0.8rem; font-weight: 600; color: #333; }

.grupo input, .grupo select {
    padding: 7px 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.2s;
}

.grupo input:focus, .grupo select:focus { border-color: #FF7043; }

.ayuda { font-size: 0.75rem; color: #999; }

/* Cargando NASA */
.cargando-nasa {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0;
}

.spinner {
    width: 20px;
    height: 20px;
    border: 3px solid #f0f0f0;
    border-top-color: #FF7043;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.cargando-nasa span { font-size: 0.85rem; color: #666; }

.btn-siguiente {
    width: 100%;
    padding: 0.85rem;
    background-color: #FF7043;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 1rem;
    transition: background-color 0.2s;
}

.btn-siguiente:hover { background-color: #F4511E; }
.btn-siguiente:disabled { opacity: 0.6; cursor: not-allowed; }

.error-msg-box {
    padding: 0.75rem;
    background: #fef2f2;
    color: #ef4444;
    border-radius: 6px;
    font-size: 0.9rem;
}

.error-text {
    color: #ef4444 !important;
}

.error-msg-area {
    color: #ef4444;
    font-size: 0.75rem;
    font-weight: 600;
    margin-top: 0.5rem;
    background: #fef2f2;
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid #fee2e2;
}

.card-datos.error-border {
    border-color: #ef4444;
}

:deep(.leaflet-control-geocoder) {
    border: none !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
    border-radius: 8px !important;
    width: 300px; /* Ancho fijo para que parezca buscador real */
    background: white;
    display: flex;
    align-items: center;
    overflow: hidden;
}

:deep(.leaflet-control-geocoder-form) {
    display: block !important;
    width: 100%;
}

:deep(.leaflet-control-geocoder-form input) {
    width: 100% !important;
    height: 40px;
    border: none !important;
    padding: 0 12px 0 40px !important;
    font-size: 0.95rem !important;
    color: #333;
    background-color: transparent;
}

:deep(.leaflet-control-geocoder-icon) {
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    background-color: transparent !important;
    border: none !important;
    opacity: 0.6;
}

:deep(.leaflet-control-geocoder-form input:focus) {
    outline: none;
    background-color: #fff;
}



@media (max-width: 900px) {
    .contenedor {
        padding: 1rem;
    }

    /* 1. Apilamos el Mapa y el Panel de Datos */
    .layout {
        grid-template-columns: 1fr; /* Una sola columna centrada */
        gap: 1.5rem;
    }

    /* 2. Ajustamos la altura del mapa para que no sea eterno en cel */
    #mapa {
        height: 350px; 
    }

    /* 3. Centramos el indicador de pasos */
    .pasos {
        padding: 1rem;
        overflow-x: auto; /* Por si los pasos no caben, que se puedan deslizar */
        justify-content: flex-start;
    }

    .paso span {
        font-size: 0.7rem;
        white-space: nowrap;
    }

    /* 4. Forzamos que las tarjetas de datos ocupen el 100% y se centren */
    .panel-datos {
        width: 100%;
        margin: 0 auto;
    }

    .card-datos {
        padding: 1rem;
    }

    /* 5. En el grid de datos (m2, coordenadas, etc), mejor una sola columna */
    .datos-grid {
        grid-template-columns: 1fr;
        gap: 0.5rem;
    }
}

</style>