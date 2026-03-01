<template>
    <div class="contenedor">

        <div class="encabezado">
            <div>
                <h1>Resultados de Simulación</h1>
                <p>Cliente: <strong>{{ route.query.nombre }}</strong></p>
            </div>
            <div class="acciones-header">
                <button class="btn-volver" @click="router.push({ path: `/simulaciones/${route.query.cliente_id}`, query: { nombre: route.query.nombre } })">
                    ← Volver a simulaciones
                </button>
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
            <div class="paso completado">
                <div class="paso-numero">✓</div>
                <span>Consumo</span>
            </div>
            <div class="paso-linea completado"></div>
            <div class="paso activo">
                <div class="paso-numero">4</div>
                <span>Resultados</span>
            </div>
        </div>

        <div v-if="cargando" class="cargando">
            <div class="spinner"></div>
            <span>Calculando simulación...</span>
        </div>

        <div v-else-if="resultados">

            <!-- Tarjetas resumen -->
            <div class="tarjetas-resumen">
                <div class="tarjeta tarjeta-produccion">
                    <div class="tarjeta-icono"><i class="bi bi-lightning-charge"></i></div>
                    <div class="tarjeta-info">
                        <span class="tarjeta-label">Producción anual</span>
                        <span class="tarjeta-valor">{{ resultados.produccion_anual_kwh.toLocaleString() }} kWh</span>
                    </div>
                </div>
                <div class="tarjeta tarjeta-ahorro">
                    <div class="tarjeta-icono"><i class="bi bi-cash-coin"></i></div>
                    <div class="tarjeta-info">
                        <span class="tarjeta-label">Ahorro mensual</span>
                        <span class="tarjeta-valor">$ {{ resultados.ahorro_mensual_mxn.toLocaleString('es-MX', { minimumFractionDigits: 2 }) }}</span>
                    </div>
                </div>
                <div class="tarjeta tarjeta-cobertura">
                    <div class="tarjeta-icono"><i class="bi bi-bar-chart"></i></div>
                    <div class="tarjeta-info">
                        <span class="tarjeta-label">Cobertura del consumo</span>
                        <span class="tarjeta-valor">{{ resultados.porcentaje_cobertura.toFixed(1) }}%</span>
                    </div>
                </div>
                <div class="tarjeta tarjeta-retorno">
                    <div class="tarjeta-icono"><i class="bi bi-calendar-event"></i></div>
                    <div class="tarjeta-info">
                        <span class="tarjeta-label">Retorno de inversión</span>
                        <span class="tarjeta-valor">{{ resultados.retorno_inversion_anios.toFixed(1) }} años</span>
                    </div>
                </div>
            </div>

            <div class="grid-resultados">

                <!-- Columna izquierda -->
                <div class="columna">

                    <!-- Económico -->
                    <div class="card">
                        <h3><i class="bi bi-cash-coin"></i> Análisis económico</h3>
                        <div class="tabla-datos">
                            <div class="fila-dato">
                                <span>Costo de instalación</span>
                                <span class="valor-destacado">$ {{ resultados.costo_total_instalacion_mxn.toLocaleString('es-MX', { minimumFractionDigits: 2 }) }} MXN</span>
                            </div>
                            <div class="fila-dato">
                                <span>Ahorro mensual estimado</span>
                                <span class="valor-positivo">$ {{ resultados.ahorro_mensual_mxn.toLocaleString('es-MX', { minimumFractionDigits: 2 }) }} MXN</span>
                            </div>
                            <div class="fila-dato">
                                <span>Ahorro anual estimado</span>
                                <span class="valor-positivo">$ {{ resultados.ahorro_anual_mxn.toLocaleString('es-MX', { minimumFractionDigits: 2 }) }} MXN</span>
                            </div>
                            <div class="fila-dato destacada">
                                <span>Ahorro en 25 años</span>
                                <span class="valor-positivo grande">$ {{ resultados.ahorro_vida_util_mxn.toLocaleString('es-MX', { minimumFractionDigits: 2 }) }} MXN</span>
                            </div>
                            <div class="fila-dato">
                                <span>Retorno de inversión</span>
                                <span class="valor-destacado">{{ resultados.retorno_inversion_anios.toFixed(1) }} años</span>
                            </div>
                        </div>
                    </div>

                    <!-- Proyección tarifaria -->
                    <div class="card">
                        <h3><i class="bi bi-bar-chart"></i> Proyección tarifaria CFE</h3>
                        <p class="card-subtitulo">Con un incremento estimado del {{ resultados.tasa_incremento_tarifa_pct }}% anual:</p>
                        <div class="tabla-datos">
                            <div class="fila-dato">
                                <span>Precio actual kWh</span>
                                <span>$ {{ Number(consumo?.tarifa_kwh_mxn ?? 0).toFixed(4) }} MXN</span>
                            </div>
                            <div class="fila-dato">
                                <span>Precio en 5 años</span>
                                <span class="valor-advertencia">$ {{ resultados.precio_kwh_proyectado_anio5.toFixed(4) }} MXN</span>
                            </div>
                            <div class="fila-dato">
                                <span>Precio en 10 años</span>
                                <span class="valor-advertencia">$ {{ resultados.precio_kwh_proyectado_anio10.toFixed(4) }} MXN</span>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- Columna derecha -->
                <div class="columna">

                    <!-- Energía -->
                    <div class="card">
                        <h3><i class="bi bi-lightning-charge"></i> Producción energética</h3>
                        <div class="tabla-datos">
                            <div class="fila-dato">
                                <span>Producción anual</span>
                                <span class="valor-destacado">{{ resultados.produccion_anual_kwh.toLocaleString() }} kWh</span>
                            </div>
                            <div class="fila-dato">
                                <span>Producción mensual promedio</span>
                                <span>{{ resultados.produccion_mensual_promedio_kwh.toLocaleString() }} kWh</span>
                            </div>
                            <div class="fila-dato">
                                <span>Cobertura del consumo</span>
                                <span class="valor-positivo">{{ resultados.porcentaje_cobertura.toFixed(1) }}%</span>
                            </div>
                            <div class="fila-dato">
                                <span>Excedente a la red</span>
                                <span>{{ resultados.excedente_kwh.toLocaleString() }} kWh</span>
                            </div>
                        </div>

                        <!-- Barra de cobertura -->
                        <div class="barra-container">
                            <div class="barra-label">
                                <span>Cobertura solar</span>
                                <span>{{ resultados.porcentaje_cobertura.toFixed(1) }}%</span>
                            </div>
                            <div class="barra-fondo">
                                <div class="barra-relleno" :style="{ width: `${Math.min(resultados.porcentaje_cobertura, 100)}%` }"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Ambiental -->
                    <div class="card card-verde">
                        <h3><i class="bi bi-leaf"></i> Impacto ambiental</h3>
                        <div class="impacto-grid">
                            <div class="impacto-item">
                                <span class="impacto-icono"><i class="bi bi-car-front"></i></span>
                                <span class="impacto-valor">{{ resultados.co2_evitado_anual_kg.toLocaleString() }} kg</span>
                                <span class="impacto-label">CO₂ evitado al año</span>
                            </div>
                            <div class="impacto-item">
                                <span class="impacto-icono"><i class="bi bi-globe-americas"></i></span>
                                <span class="impacto-valor">{{ (resultados.co2_evitado_vida_util_kg / 1000).toFixed(1) }} ton</span>
                                <span class="impacto-label">CO₂ evitado en 25 años</span>
                            </div>
                            <div class="impacto-item">
                                <span class="impacto-icono"><i class="bi bi-tree"></i></span>
                                <span class="impacto-valor">{{ resultados.arboles_equivalentes.toLocaleString() }}</span>
                                <span class="impacto-label">Árboles equivalentes</span>
                            </div>
                        </div>
                    </div>

                    <!-- Datos del sistema -->
                    <div class="card">
                        <h3><i class="bi bi-wrench"></i> Sistema propuesto</h3>
                        <div class="tabla-datos">
                            <div class="fila-dato">
                                <span>Área del techo</span>
                                <span>{{ techo?.area_m2 }} m²</span>
                            </div>
                            <div class="fila-dato">
                                <span>Área útil</span>
                                <span>{{ techo?.area_util_m2 }} m²</span>
                            </div>
                            <div class="fila-dato">
                                <span>Horas sol pico</span>
                                <span>{{ geo?.horas_sol_pico_diarias }} HSP/día</span>
                            </div>
                            <div class="fila-dato">
                                <span>Zona climática</span>
                                <span>{{ geo?.zona_climatica }}</span>
                            </div>
                            <div class="fila-dato">
                                <span>Consumo mensual</span>
                                <span>{{ consumo?.consumo_mensual_kwh }} kWh</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </div>

        <div v-else class="sin-datos">
            No se encontraron resultados para esta simulación.
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useSimulaciones } from '../controladores/useSimulaciones';
import type { ResultadosCalculo, DatosTecho, DatosGeograficos, ConsumoElectrico } from '../interfaces/simulaciones-interface';

const router = useRouter();
const route = useRoute();
const {
    cargando, error,
    obtieneDatosTecho,
    obtieneDatosGeograficos,
    obtieneConsumoElectrico,
    obtieneResultados,
    calcularResultados,
    guardarResultados
} = useSimulaciones();

const simulacion_id = Number(route.params.simulacion_id);

const resultados = ref<ResultadosCalculo | null>(null);
const techo = ref<DatosTecho | null>(null);
const geo = ref<DatosGeograficos | null>(null);
const consumo = ref<ConsumoElectrico | null>(null);

onMounted(async () => {
    const resultadosExistentes = await obtieneResultados(simulacion_id);

    if (resultadosExistentes && !resultadosExistentes.error) {
        resultados.value = resultadosExistentes;
        techo.value = await obtieneDatosTecho(simulacion_id);
        geo.value = await obtieneDatosGeograficos(simulacion_id);
        consumo.value = await obtieneConsumoElectrico(simulacion_id);
        return;
    }

    techo.value = await obtieneDatosTecho(simulacion_id);
    geo.value = await obtieneDatosGeograficos(simulacion_id);
    consumo.value = await obtieneConsumoElectrico(simulacion_id);

    console.log('techo:', techo.value);
    console.log('geo:', geo.value);
    console.log('consumo:', consumo.value);

    if (!techo.value || !geo.value || !consumo.value) {
        error.value = 'Faltan datos para calcular la simulación';
        return;
    }

    // Convierte strings a números antes de calcular
    const techoParseado = {
        ...techo.value,
        area_m2: Number(techo.value.area_m2),
        area_util_m2: Number(techo.value.area_util_m2),
        factor_sombra: Number(techo.value.factor_sombra),
        angulo_inclinacion_deg: Number(techo.value.angulo_inclinacion_deg),
        latitud: Number(techo.value.latitud),
        longitud: Number(techo.value.longitud),
    };

    const geoParseado = {
        ...geo.value,
        horas_sol_pico_diarias: Number(geo.value.horas_sol_pico_diarias),
        irradiacion_anual_kwh_m2: Number(geo.value.irradiacion_anual_kwh_m2),
        temperatura_promedio_anual: Number(geo.value.temperatura_promedio_anual),
        altitud_msnm: Number(geo.value.altitud_msnm),
        velocidad_viento_promedio: Number(geo.value.velocidad_viento_promedio),
    };

    const consumoParseado = {
        ...consumo.value,
        consumo_mensual_kwh: Number(consumo.value.consumo_mensual_kwh),
        consumo_anual_kwh: Number(consumo.value.consumo_anual_kwh),
        tarifa_kwh_mxn: Number(consumo.value.tarifa_kwh_mxn),
        costo_mensual_mxn: Number(consumo.value.costo_mensual_mxn),
    };

    const calculados = calcularResultados(consumoParseado, techoParseado, geoParseado, simulacion_id);
    console.log('calculados:', calculados);
    await guardarResultados(calculados);
    resultados.value = calculados;
});
</script>

<style scoped>
.contenedor { padding: 2rem; max-width: 1200px; margin: 0 auto; }

.encabezado {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.encabezado h1 { font-size: 1.8rem; color: #333; margin: 0; }
.encabezado p { color: #666; font-size: 0.9rem; margin: 0.25rem 0 0; }

.acciones-header { display: flex; gap: 1rem; }

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

/* Cargando */
.cargando {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 4rem;
    color: #666;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f0f0f0;
    border-top-color: #FF7043;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Tarjetas resumen */
.tarjetas-resumen {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.tarjeta {
    background: white;
    border-radius: 8px;
    padding: 1.25rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    display: flex;
    align-items: center;
    gap: 1rem;
    border-left: 4px solid transparent;
}

.tarjeta-produccion { border-left-color: #3b82f6; }
.tarjeta-ahorro { border-left-color: #22c55e; }
.tarjeta-cobertura { border-left-color: #FF7043; }
.tarjeta-retorno { border-left-color: #a855f7; }

.tarjeta-icono { font-size: 2rem; }
.tarjeta-info { display: flex; flex-direction: column; gap: 0.2rem; }
.tarjeta-label { font-size: 0.75rem; color: #999; }
.tarjeta-valor { font-size: 1.1rem; font-weight: 700; color: #333; }

/* Grid resultados */
.grid-resultados {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.columna { display: flex; flex-direction: column; gap: 1.5rem; }

.card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.card h3 { font-size: 1rem; color: #333; margin: 0 0 1rem; }
.card-subtitulo { font-size: 0.82rem; color: #666; margin: -0.5rem 0 1rem; }

.card-verde { border-top: 3px solid #22c55e; }

/* Tabla de datos */
.tabla-datos { display: flex; flex-direction: column; }

.fila-dato {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6rem 0;
    border-bottom: 1px solid #f0f0f0;
    font-size: 0.875rem;
    color: #555;
}

.fila-dato:last-child { border-bottom: none; }
.fila-dato.destacada { background: #fff7ed; padding: 0.6rem 0.5rem; border-radius: 6px; }

.valor-positivo { color: #16a34a; font-weight: 600; }
.valor-positivo.grande { font-size: 1.05rem; }
.valor-destacado { color: #FF7043; font-weight: 600; }
.valor-advertencia { color: #d97706; font-weight: 600; }

/* Barra cobertura */
.barra-container { margin-top: 1rem; }
.barra-label {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 0.4rem;
}

.barra-fondo {
    height: 12px;
    background: #f0f0f0;
    border-radius: 999px;
    overflow: hidden;
}

.barra-relleno {
    height: 100%;
    background: linear-gradient(90deg, #FF7043, #f59e0b);
    border-radius: 999px;
    transition: width 1s ease;
}

/* Impacto ambiental */
.impacto-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    text-align: center;
}

.impacto-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    padding: 0.75rem;
    background: #f0fdf4;
    border-radius: 8px;
}

.impacto-icono { font-size: 1.5rem; }
.impacto-valor { font-size: 1rem; font-weight: 700; color: #166534; }
.impacto-label { font-size: 0.72rem; color: #4ade80; text-align: center; line-height: 1.3; }

.sin-datos { text-align: center; padding: 4rem; color: #999; }
</style>