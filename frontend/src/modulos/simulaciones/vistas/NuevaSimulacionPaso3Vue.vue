<template>
    <div class="contenedor">

        <div class="encabezado">
            <div>
                <h1>Nueva Simulación</h1>
                <p>Cliente: <strong>{{ route.query.nombre }}</strong></p>
            </div>
            <button class="btn-volver" @click="router.back()">← Volver</button>
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
                <span>Consumo</span>
            </div>
            <div class="paso-linea"></div>
            <div class="paso">
                <div class="paso-numero">4</div>
                <span>Resultados</span>
            </div>
        </div>

        <div class="layout">

            <!-- Formulario consumo -->
            <div class="card">
                <h2>Paso 3 — Consumo eléctrico</h2>
                <p class="subtitulo">Ingresa los datos del recibo de luz del cliente.</p>

                <form @submit="onSubmit" class="formulario">

                    <div class="fila-doble">
                        <div class="grupo">
                            <label>Consumo mensual (kWh) *</label>
                            <input
                                v-model.number="consumoValue"
                                type="number"
                                placeholder="350"
                                min="0"
                                :class="{ 'input-error': consumoError }"
                            />
                            <span class="error-msg" v-if="consumoError">{{ consumoError }}</span>
                        </div>
                        <div class="grupo">
                            <label>Costo mensual (MXN) *</label>
                            <input
                                v-model.number="costoValue"
                                type="number"
                                placeholder="850.00"
                                min="0"
                                step="0.01"
                                :class="{ 'input-error': costoError }"
                            />
                            <span class="error-msg" v-if="costoError">{{ costoError }}</span>
                        </div>
                    </div>

                    <div class="fila-doble">
                        <div class="grupo">
                            <label>Tarifa CFE *</label>
                            <select v-model="tarifaValue" :class="{ 'input-error': tarifaError }">
                                <option value="">Selecciona una tarifa</option>
                                <option value="1">1 - Uso doméstico básico</option>
                                <option value="1A">1A - Clima cálido</option>
                                <option value="1B">1B - Clima muy cálido</option>
                                <option value="1C">1C - Clima extremoso</option>
                                <option value="1D">1D - Clima muy extremoso</option>
                                <option value="1E">1E - Clima desértico</option>
                                <option value="1F">1F - Clima desértico extremo</option>
                                <option value="DAC">DAC - Alto consumo</option>
                            </select>
                            <span class="error-msg" v-if="tarifaError">{{ tarifaError }}</span>
                        </div>
                        <div class="grupo">
                            <label>Periodo de facturación *</label>
                            <select v-model="periodoValue" :class="{ 'input-error': periodoError }">
                                <option value="">Selecciona un periodo</option>
                                <option value="mensual">Mensual</option>
                                <option value="bimestral">Bimestral</option>
                            </select>
                            <span class="error-msg" v-if="periodoError">{{ periodoError }}</span>
                        </div>
                    </div>

                    <div class="grupo">
                        <label>Número de recibo <span class="opcional">(opcional)</span></label>
                        <input
                            v-model="reciboValue"
                            type="text"
                            placeholder="REC-2026-001"
                        />
                    </div>

                    <!-- Tarifa calculada automáticamente -->
                    <div class="tarifa-calculada" v-if="tarifaKwh > 0">
                        <span class="tarifa-label">Tarifa por kWh calculada:</span>
                        <span class="tarifa-valor">$ {{ tarifaKwh.toFixed(4) }} MXN/kWh</span>
                    </div>

                    <div class="mensaje error-msg-box" v-if="error">{{ error }}</div>

                    <div class="botones">
                        <button type="submit" class="btn-siguiente" :disabled="cargando">
                            {{ cargando ? 'Calculando...' : 'Calcular y ver resultados →' }}
                        </button>
                    </div>

                </form>
            </div>

            <!-- Panel de ayuda -->
            <div class="panel-ayuda">
                <div class="card-ayuda">
                    <h3>¿Dónde encuentro estos datos?</h3>
                    <div class="ayuda-item">
                        <span class="ayuda-icono"></span>
                        <div>
                            <strong>Consumo mensual (kWh)</strong>
                            <p>En tu recibo de CFE aparece como "kWh consumidos" o "energía consumida".</p>
                        </div>
                    </div>
                    <div class="ayuda-item">
                        <span class="ayuda-icono"></span>
                        <div>
                            <strong>Costo mensual</strong>
                            <p>El total a pagar que aparece en el recibo. Si es bimestral divídelo entre 2.</p>
                        </div>
                    </div>
                    <div class="ayuda-item">
                        <span class="ayuda-icono"></span>
                        <div>
                            <strong>Tarifa CFE</strong>
                            <p>Aparece en la parte superior de tu recibo como "tarifa".</p>
                        </div>
                    </div>
                </div>

                <div class="card-ayuda">
                    <h3>Consumo promedio en México</h3>
                    <div class="promedio-item">
                        <span>Casa pequeña</span>
                        <span class="promedio-valor">150 - 250 kWh/mes</span>
                    </div>
                    <div class="promedio-item">
                        <span>Casa mediana</span>
                        <span class="promedio-valor">250 - 500 kWh/mes</span>
                    </div>
                    <div class="promedio-item">
                        <span>Casa grande</span>
                        <span class="promedio-valor">500 - 1000 kWh/mes</span>
                    </div>
                    <div class="promedio-item">
                        <span>Local comercial</span>
                        <span class="promedio-valor">1000+ kWh/mes</span>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import { paso3Schema } from '../schemas/simulacionesSchema';
import { useSimulaciones } from '../controladores/useSimulaciones';

const router = useRouter();
const route = useRoute();
const { cargando, error, guardarConsumoElectrico, guardarResultados, calcularResultados } = useSimulaciones();

const cliente_id = Number(route.params.cliente_id);
const simulacion_id = Number(route.params.simulacion_id);

const { handleSubmit } = useForm({ validationSchema: paso3Schema });
const { value: consumoValue, errorMessage: consumoError } = useField<number>('consumo_mensual_kwh');
const { value: costoValue, errorMessage: costoError } = useField<number>('costo_mensual_mxn');
const { value: tarifaValue, errorMessage: tarifaError } = useField<string>('tipo_tarifa');
const { value: periodoValue, errorMessage: periodoError } = useField<string>('periodo_facturacion');
const { value: reciboValue } = useField<string>('numero_recibo');

// Calcula la tarifa por kWh automáticamente
const tarifaKwh = computed(() => {
    if (consumoValue.value > 0 && costoValue.value > 0) {
        return costoValue.value / consumoValue.value;
    }
    return 0;
});

const onSubmit = handleSubmit(async (values) => {
    console.log('values:', values);
    console.log('simulacion_id:', simulacion_id);
    console.log('error antes:', error.value);

    const consumoAnual = values.consumo_mensual_kwh * 12;
    const tarifa = tarifaKwh.value;

    const consumo = {
        simulacion_id,
        consumo_mensual_kwh: values.consumo_mensual_kwh,
        consumo_anual_kwh: consumoAnual,
        tarifa_kwh_mxn: parseFloat(tarifa.toFixed(4)),
        costo_mensual_mxn: values.costo_mensual_mxn,
        tipo_tarifa: values.tipo_tarifa,
        numero_recibo: values.numero_recibo ?? null,
        periodo_facturacion: values.periodo_facturacion
    };

    console.log('consumo a guardar:', consumo);
    await guardarConsumoElectrico(consumo);
    console.log('error después:', error.value);

    if (!error.value) {
        console.log('redirigiendo a resultados...');
        router.push({
            path: `/simulaciones/resultados/${simulacion_id}`,
            query: { nombre: route.query.nombre, cliente_id }
        });
    }
});
</script>

<style scoped>
.contenedor { padding: 2rem; max-width: 1100px; margin: 0 auto; }

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
    grid-template-columns: 1fr 320px;
    gap: 1.5rem;
    align-items: start;
}

.card {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.card h2 { font-size: 1.2rem; color: #333; margin: 0 0 0.5rem; }
.subtitulo { color: #666; font-size: 0.9rem; margin-bottom: 1.5rem; }

.formulario { display: flex; flex-direction: column; gap: 1.25rem; }

.fila-doble {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.grupo { display: flex; flex-direction: column; gap: 0.4rem; }
.grupo label { font-size: 0.875rem; font-weight: 600; color: #333; }
.opcional { font-weight: 400; color: #999; font-size: 0.8rem; }

.grupo input, .grupo select {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.2s;
    font-family: inherit;
    background: white;
}

.grupo input:focus, .grupo select:focus { border-color: #FF7043; }
.input-error { border-color: #ef4444 !important; }
.error-msg { font-size: 0.8rem; color: #ef4444; }

/* Tarifa calculada */
.tarifa-calculada {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff7ed;
    border: 1px solid #fed7aa;
    border-radius: 8px;
    padding: 0.75rem 1rem;
}

.tarifa-label { font-size: 0.875rem; color: #9a3412; font-weight: 500; }
.tarifa-valor { font-size: 1rem; font-weight: 700; color: #FF7043; }

.error-msg-box {
    padding: 0.75rem;
    background: #fef2f2;
    color: #ef4444;
    border-radius: 6px;
    font-size: 0.9rem;
}

.botones { display: flex; justify-content: flex-end; margin-top: 0.5rem; }

.btn-siguiente {
    padding: 0.75rem 2rem;
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

/* Panel ayuda */
.panel-ayuda { display: flex; flex-direction: column; gap: 1rem; }

.card-ayuda {
    background: white;
    border-radius: 8px;
    padding: 1.25rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.card-ayuda h3 { font-size: 0.95rem; color: #333; margin: 0 0 1rem; }

.ayuda-item {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.ayuda-item:last-child { margin-bottom: 0; }

.ayuda-icono { font-size: 1.5rem; }

.ayuda-item strong { font-size: 0.875rem; color: #333; display: block; margin-bottom: 0.2rem; }
.ayuda-item p { font-size: 0.8rem; color: #666; margin: 0; line-height: 1.4; }

.promedio-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #f0f0f0;
    font-size: 0.875rem;
    color: #555;
}

.promedio-item:last-child { border-bottom: none; }
.promedio-valor { font-weight: 600; color: #FF7043; }
</style>