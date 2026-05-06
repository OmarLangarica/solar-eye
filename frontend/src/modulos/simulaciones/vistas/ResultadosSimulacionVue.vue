<template>
    <div class="contenedor">

        <div class="encabezado">
            <div>
                <h1>Resultados de Simulación</h1>
                <p>Cliente: <strong>{{ route.query.nombre }}</strong></p>
            </div>
            <div class="acciones-header">
                <button class="btn-secundario" @click="imprimirReporte" v-if="resultados">
                    <i class="bi bi-printer"></i> Imprimir
                </button>
                <button class="btn-primario" @click="descargarPDF" v-if="resultados">
                    <i class="bi bi-file-earmark-pdf"></i> Descargar PDF
                </button>
                <button class="btn-volver" @click="volver">
                    ← Volver a simulaciones
                </button>
            </div>
        </div>

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

        <div v-else-if="resultados" id="reporte-area">

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

            <div class="graficas-grid" v-if="resultados && consumo">
                <div class="card card-grafica">
                    <h3><i class="bi bi-bar-chart-line"></i> Comparativa de consumo vs generación</h3>
                    <p class="card-subtitulo">Consumo mensual del cliente frente a la producción mensual estimada del sistema.</p>
                    <div class="canvas-wrap">
                        <canvas ref="comparativaCanvas"></canvas>
                    </div>
                </div>

                <div class="card card-grafica">
                    <h3><i class="bi bi-graph-up-arrow"></i> Proyección de ahorro acumulado a 25 años</h3>
                    <p class="card-subtitulo">Se compara el costo acumulado de seguir con CFE contra la inversión solar fija.</p>
                    <div class="payback-banner" v-if="textoPaybackEstimado">
                        Retorno estimado en {{ textoPaybackEstimado }} años.
                    </div>
                    <div class="payback-banner sin-retorno" v-else>
                        Con los datos actuales, el retorno no cruza la inversión en 25 años.
                    </div>
                    <div class="canvas-wrap">
                        <canvas ref="proyeccionCanvas"></canvas>
                    </div>
                </div>
            </div>

            <div class="grid-resultados">

                <div class="columna">

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
                            <div class="fila-dato destacada fila-ahorro-25">
                                <span>Ahorro en 25 años</span>
                                <span class="valor-positivo grande valor-ahorro-25">$ {{ resultados.ahorro_vida_util_mxn.toLocaleString('es-MX', { minimumFractionDigits: 2 }) }} MXN</span>
                            </div>
                            <div class="fila-dato">
                                <span>Retorno de inversión</span>
                                <span class="valor-destacado">{{ resultados.retorno_inversion_anios.toFixed(1) }} años</span>
                            </div>
                        </div>
                    </div>

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

                <div class="columna">

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

                    <div class="card">
                        <h3><i class="bi bi-wrench"></i> Sistema propuesto</h3>
                        <div class="tabla-datos">
                            <div class="fila-dato">
                                <span>Área del techo</span>
                                <span>{{ techo?.area_m2 }} m²</span>
                            </div>
                            <div class="fila-dato">
                                <span>Paneles a instalar</span>
                                <span class="">{{ resultados.numero_paneles }} módulos (410W)</span>
                            </div>
                            
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
import { ref, onMounted, nextTick, watch, onBeforeUnmount, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
// Importaciones nuevas para el PDF
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Chart, registerables } from 'chart.js';

import { useSimulaciones } from '../controladores/useSimulaciones';
import type { ResultadosCalculo, DatosTecho, DatosGeograficos, ConsumoElectrico } from '../interfaces/simulaciones-interface';

const router = useRouter();
const route = useRoute();
Chart.register(...registerables);
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
const comparativaCanvas = ref<HTMLCanvasElement | null>(null);
const proyeccionCanvas = ref<HTMLCanvasElement | null>(null);
const comparativaChart = ref<Chart<'bar'> | null>(null);
const proyeccionChart = ref<Chart<'line'> | null>(null);

const TOTAL_ANIOS_PROYECCION = 25;

const redondeaMoneda = (valor: number) => Number(valor.toFixed(2));

const obtienePaletaGrafica = () => {
    const oscuro = document.documentElement.classList.contains('theme-dark');
    if (oscuro) {
        return {
            texto: '#f8fafc',
            textoSuave: '#cbd5e1',
            rejilla: 'rgba(148, 163, 184, 0.22)'
        };
    }

    return {
        texto: '#374151',
        textoSuave: '#6b7280',
        rejilla: 'rgba(148, 163, 184, 0.28)'
    };
};

const normalizaResultados = (data: Partial<ResultadosCalculo>): ResultadosCalculo => {
    const ahorroAnual = Number(data.ahorro_anual_mxn || 0);
    const costoInstalacion = Number(data.costo_total_instalacion_mxn || 0);
    const retornoConsistente = ahorroAnual > 0 ? costoInstalacion / ahorroAnual : 0;

    return {
        simulacion_id,
        numero_paneles: Number(data.numero_paneles || 0),
        produccion_anual_kwh: Number(data.produccion_anual_kwh || 0),
        produccion_mensual_promedio_kwh: Number(data.produccion_mensual_promedio_kwh || 0),
        porcentaje_cobertura: Number(data.porcentaje_cobertura || 0),
        excedente_kwh: Number(data.excedente_kwh || 0),
        ahorro_mensual_mxn: redondeaMoneda(ahorroAnual / 12),
        ahorro_anual_mxn: ahorroAnual,
        ahorro_vida_util_mxn: Number(data.ahorro_vida_util_mxn || 0),
        costo_total_instalacion_mxn: costoInstalacion,
        retorno_inversion_anios: redondeaMoneda(retornoConsistente),
        co2_evitado_anual_kg: Number(data.co2_evitado_anual_kg || 0),
        co2_evitado_vida_util_kg: Number(data.co2_evitado_vida_util_kg || 0),
        arboles_equivalentes: Number(data.arboles_equivalentes || 0),
        precio_kwh_proyectado_anio5: Number(data.precio_kwh_proyectado_anio5 || 0),
        precio_kwh_proyectado_anio10: Number(data.precio_kwh_proyectado_anio10 || 0),
        tasa_incremento_tarifa_pct: Number(data.tasa_incremento_tarifa_pct || 0)
    };
};

const calcularProyeccion = () => {
    if (!resultados.value) return null;

    const ahorroVidaUtil = Number(resultados.value.ahorro_vida_util_mxn || 0);
    const tasaIncremento = Number(resultados.value.tasa_incremento_tarifa_pct || 0) / 100;
    const inversion = Number(resultados.value.costo_total_instalacion_mxn || 0);

    let costoAcumuladoSinSolar = 0;
    let anioPayback: number | null = null;

    const etiquetas: string[] = [];
    const serieSinSolar: number[] = [];
    const serieConSolar: number[] = [];

    if (ahorroVidaUtil <= 0) {
        for (let anio = 1; anio <= TOTAL_ANIOS_PROYECCION; anio++) {
            etiquetas.push(`Año ${anio}`);
            serieSinSolar.push(0);
            serieConSolar.push(redondeaMoneda(inversion));
        }

        return {
            etiquetas,
            serieSinSolar,
            serieConSolar,
            anioPayback
        };
    }

    const pesosAnuales = Array.from({ length: TOTAL_ANIOS_PROYECCION }, (_, indice) => Math.pow(1 + tasaIncremento, indice));
    const sumaPesos = pesosAnuales.reduce((acc, valor) => acc + valor, 0);
    const ahorroBaseEscalado = ahorroVidaUtil / sumaPesos;

    let acumuladoPrevio = 0;

    for (let anio = 1; anio <= TOTAL_ANIOS_PROYECCION; anio++) {
        const pesoAnual = pesosAnuales[anio - 1] ?? 0;
        const gastoAnualSinSolar = ahorroBaseEscalado * pesoAnual;
        costoAcumuladoSinSolar += gastoAnualSinSolar;

        if (anioPayback === null && costoAcumuladoSinSolar >= inversion && gastoAnualSinSolar > 0) {
            const fraccion = (inversion - acumuladoPrevio) / gastoAnualSinSolar;
            anioPayback = (anio - 1) + Math.max(0, Math.min(fraccion, 1));
        }

        etiquetas.push(`Año ${anio}`);
        serieSinSolar.push(redondeaMoneda(costoAcumuladoSinSolar));
        serieConSolar.push(redondeaMoneda(inversion));
        acumuladoPrevio = costoAcumuladoSinSolar;
    }

    return {
        etiquetas,
        serieSinSolar,
        serieConSolar,
        anioPayback
    };
};

const anioPaybackEstimado = computed(() => {
    const proyeccion = calcularProyeccion();
    return proyeccion?.anioPayback ?? null;
});

const textoPaybackEstimado = computed(() => {
    if (!anioPaybackEstimado.value) return null;
    return anioPaybackEstimado.value.toFixed(1);
});

const volver = () => {
    const returnTo = route.query.returnTo;
    if (typeof returnTo === 'string' && returnTo.trim()) {
        router.push(returnTo);
        return;
    }

    router.push({ path: `/simulaciones/${route.query.cliente_id}`, query: { nombre: route.query.nombre } });
};

const limpiarGraficas = () => {
    comparativaChart.value?.destroy();
    comparativaChart.value = null;

    proyeccionChart.value?.destroy();
    proyeccionChart.value = null;
};

const renderGraficaComparativa = () => {
    if (!comparativaCanvas.value || !resultados.value || !consumo.value) return;

    const paleta = obtienePaletaGrafica();

    comparativaChart.value?.destroy();

    comparativaChart.value = new Chart(comparativaCanvas.value, {
        type: 'bar',
        data: {
            labels: ['Mensual'],
            datasets: [
                {
                    label: 'Consumo (kWh)',
                    data: [Number(consumo.value.consumo_mensual_kwh || 0)],
                    backgroundColor: '#ef4444',
                    borderRadius: 8,
                    maxBarThickness: 58
                },
                {
                    label: 'Generación solar (kWh)',
                    data: [Number(resultados.value.produccion_mensual_promedio_kwh || 0)],
                    backgroundColor: '#22c55e',
                    borderRadius: 8,
                    maxBarThickness: 58
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: paleta.texto
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${Number(context.raw).toLocaleString('es-MX')} kWh`
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: paleta.textoSuave
                    },
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: paleta.rejilla
                    },
                    ticks: {
                        color: paleta.textoSuave,
                        callback: (valor) => `${Number(valor).toLocaleString('es-MX')} kWh`
                    }
                }
            }
        }
    });
};

const renderGraficaProyeccion = () => {
    if (!proyeccionCanvas.value || !resultados.value) return;

    const paleta = obtienePaletaGrafica();

    const proyeccion = calcularProyeccion();
    if (!proyeccion) return;

    proyeccionChart.value?.destroy();

    const puntosPayback = proyeccion.etiquetas.map((_, indice) => {
        if (!proyeccion.anioPayback) return null;
        const indicePayback = Math.max(1, Math.min(TOTAL_ANIOS_PROYECCION, Math.round(proyeccion.anioPayback)));
        if (indice + 1 === indicePayback) {
            return proyeccion.serieSinSolar[indice] ?? null;
        }
        return null;
    });

    proyeccionChart.value = new Chart(proyeccionCanvas.value, {
        type: 'line',
        data: {
            labels: proyeccion.etiquetas,
            datasets: [
                {
                    label: 'Costo acumulado sin solar (CFE)',
                    data: proyeccion.serieSinSolar,
                    borderColor: '#f97316',
                    backgroundColor: 'rgba(249, 115, 22, 0.16)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0
                },
                {
                    label: 'Costo acumulado con solar',
                    data: proyeccion.serieConSolar,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.12)',
                    fill: true,
                    tension: 0,
                    pointRadius: 0,
                    borderDash: [8, 6]
                },
                {
                    label: proyeccion.anioPayback ? `Payback estimado (${proyeccion.anioPayback.toFixed(1)} años)` : 'Payback estimado',
                    data: puntosPayback,
                    borderColor: '#16a34a',
                    backgroundColor: '#16a34a',
                    pointRadius: 6,
                    pointHoverRadius: 7,
                    showLine: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: paleta.texto
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.dataset.label}: $${Number(context.raw).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`
                    }
                },
                subtitle: {
                    display: !!proyeccion.anioPayback,
                    color: paleta.textoSuave,
                    text: proyeccion.anioPayback
                        ? `Punto de retorno estimado: ${proyeccion.anioPayback.toFixed(1)} años`
                        : 'Con los datos actuales no se alcanza retorno en 25 años'
                }
            },
            scales: {
                x: {
                    grid: {
                        color: paleta.rejilla
                    },
                    ticks: {
                        color: paleta.textoSuave,
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 8
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: paleta.rejilla
                    },
                    ticks: {
                        color: paleta.textoSuave,
                        callback: (valor) => `$${Number(valor).toLocaleString('es-MX')}`
                    }
                }
            }
        }
    });
};

onMounted(async () => {
    // ─── Función helper para extraer el primer elemento de un array ───
    const extraer = (data: any) => {
        if (!data) return null;
        if (Array.isArray(data)) return data.length > 0 ? data[0] : null;
        if (data.error) return null;
        return data;
    };

    let resultadosRaw = await obtieneResultados(simulacion_id);
    let resultadosExistentes = extraer(resultadosRaw);

    if (resultadosExistentes) {
        resultados.value = normalizaResultados(resultadosExistentes);
        techo.value = extraer(await obtieneDatosTecho(simulacion_id));
        geo.value = extraer(await obtieneDatosGeograficos(simulacion_id));
        consumo.value = extraer(await obtieneConsumoElectrico(simulacion_id));
        return;
    }

    // No hay resultados → calcular
    techo.value = extraer(await obtieneDatosTecho(simulacion_id));
    geo.value = extraer(await obtieneDatosGeograficos(simulacion_id));
    consumo.value = extraer(await obtieneConsumoElectrico(simulacion_id));

    if (!techo.value || !geo.value || !consumo.value) {
        error.value = 'Faltan datos para calcular la simulación';
        return;
    }

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
    await guardarResultados(calculados);
    resultados.value = normalizaResultados(calculados);
});

watch([resultados, consumo], async () => {
    await nextTick();
    renderGraficaComparativa();
    renderGraficaProyeccion();
});

onBeforeUnmount(() => {
    window.removeEventListener('solar-eye-theme-changed', onThemeChanged);
    limpiarGraficas();
});

const onThemeChanged = async () => {
    await nextTick();
    renderGraficaComparativa();
    renderGraficaProyeccion();
};

const imprimirReporte = () => {
    window.print();
};

const descargarPDF = async () => {
    const elemento = document.getElementById('reporte-area');
    if (!elemento) return;

    try {
        const canvas = await html2canvas(elemento, { 
            scale: 2, 
            useCORS: true 
        }); 
        
        const dataFormatoImagen = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const margin = 10;
        const innerWidth = pdfWidth - (margin * 2);
        const pdfHeight = (canvas.height * innerWidth) / canvas.width;
        
        pdf.addImage(dataFormatoImagen, 'PNG', margin, margin, innerWidth, pdfHeight);
        
        const nombreCliente = route.query.nombre ? String(route.query.nombre).replace(/\s+/g, '_') : 'Cliente';
        pdf.save(`Reporte_Solar_${nombreCliente}.pdf`);
        
    } catch (error) {
        console.error("Error al generar el PDF:", error);
        alert("Hubo un problema al generar el PDF. Revisa la consola.");
    }
};
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

/* Estilos de los botones nuevos */
.btn-primario {
    padding: 0.6rem 1.2rem;
    background-color: #FF7043;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: background-color 0.2s;
}
.btn-primario:hover { background-color: #f45b2c; }

.btn-secundario {
    padding: 0.6rem 1.2rem;
    background-color: white;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: background-color 0.2s;
}
.btn-secundario:hover { background-color: #f5f5f5; }

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

.graficas-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}

.card-grafica {
    min-height: 380px;
}

.canvas-wrap {
    position: relative;
    height: 290px;
    margin-top: 0.8rem;
}

.payback-banner {
    margin-top: 0.5rem;
    padding: 0.55rem 0.75rem;
    border-radius: 6px;
    background: #ecfdf5;
    color: #166534;
    font-size: 0.82rem;
    font-weight: 600;
}

.payback-banner.sin-retorno {
    background: #fff7ed;
    color: #9a3412;
}

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

/* Contraste fino para modo oscuro en esta vista */
:global(html.theme-dark) .contenedor .card,
:global(html.theme-dark) .contenedor .tarjeta,
:global(html.theme-dark) .contenedor .pasos,
:global(html.theme-dark) .contenedor .tabla-container {
    background: #152236 !important;
    border-color: #2c3f5c !important;
}

:global(html.theme-dark) .contenedor .tarjeta-label,
:global(html.theme-dark) .contenedor .card-subtitulo,
:global(html.theme-dark) .contenedor .fila-dato,
:global(html.theme-dark) .contenedor .barra-label,
:global(html.theme-dark) .contenedor .sin-datos {
    color: #ffffff !important;
}

:global(html.theme-dark) .contenedor .tarjeta-valor,
:global(html.theme-dark) .contenedor .card h3,
:global(html.theme-dark) .contenedor .fila-dato span,
:global(html.theme-dark) .contenedor .encabezado h1,
:global(html.theme-dark) .contenedor .encabezado p,
:global(html.theme-dark) .contenedor .paso span {
    color: #ffffff !important;
}

:global(html.theme-dark) .contenedor .fila-dato.destacada {
    background: #12324f !important;
    border: 1px solid #2f6aa3 !important;
}

:global(html.theme-dark) .contenedor .fila-dato.destacada span {
    color: #ffffff !important;
}

:global(html.theme-dark) .contenedor .valor-positivo.grande {
    color: #7dd3fc !important;
}

:global(html.theme-dark) .contenedor .fila-ahorro-25 {
    background: #0f3b57 !important;
    border: 1px solid #2f7baa !important;
}

:global(html.theme-dark) .contenedor .fila-ahorro-25 span {
    color: #ffffff !important;
}

:global(html.theme-dark) .contenedor .fila-ahorro-25 .valor-ahorro-25 {
    color: #67e8f9 !important;
    font-weight: 700;
}

:global(html.theme-dark) .contenedor .valor-positivo {
    color: #86efac !important;
}

:global(html.theme-dark) .contenedor .valor-destacado {
    color: #fdba74 !important;
}

:global(html.theme-dark) .contenedor .valor-advertencia {
    color: #fcd34d !important;
}

/* REGLAS MÁGICAS PARA IMPRESIÓN */
@media print {
    /* Ocultar botones, encabezados y barras de navegación al imprimir */
    .acciones-header, .pasos, .encabezado {
        display: none !important;
    }
    
    /* Quitar sombras y adaptar el contenedor a la hoja */
    .contenedor {
        padding: 0;
        margin: 0;
        max-width: 100%;
    }
    
    .card, .tarjeta {
        box-shadow: none !important;
        border: 1px solid #eee;
        break-inside: avoid;
    }

    body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
}

@media (max-width: 780px) {

.contenedor{
    padding: 1rem;
}

/* Encabezado */
.encabezado{
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
}

.encabezado h1{
    font-size: 1.4rem;
}

/* Botones */
.acciones-header{
    width: 100%;
    flex-wrap: wrap;
}

.acciones-header button{
    flex: 1;
    justify-content: center;
}


/* PASOS */
.pasos{
    overflow-x: auto;
    padding: 1rem;
    gap: .5rem;
}

.paso span{
    font-size: .7rem;
    text-align: center;
}

.paso-linea{
    min-width: 30px;
}


/* TARJETAS RESUMEN */
.tarjetas-resumen{
    grid-template-columns: repeat(2, 1fr);
}

/* GRID RESULTADOS */
.grid-resultados{
    grid-template-columns: 1fr;
}

.graficas-grid {
    grid-template-columns: 1fr;
}

/* TARJETAS */
.card{
    padding: 1.2rem;
}

.card-grafica {
    min-height: 340px;
}

.canvas-wrap {
    height: 250px;
}

/* TABLAS */
.fila-dato{
    font-size: .82rem;
}

/* IMPACTO AMBIENTAL */
.impacto-grid{
    grid-template-columns: 1fr;
}

/* ICONOS TARJETAS */
.tarjeta-icono{
    font-size: 1.6rem;
}

.tarjeta-valor{
    font-size: 1rem;
}

}
</style>