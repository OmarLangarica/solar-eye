<template>
    <div class="contenedor">

        <div class="encabezado">
            <div>
                <h1>Nueva Simulación</h1>
                <p>Cliente: <strong>{{ route.query.nombre }}</strong></p>
            </div>
            <div class="botones">
                <button class="btn-volver" @click="router.push({ 
                    path: `/simulaciones/nueva/${cliente_id}/paso2/${simulacion_id}`, 
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
                    <div class="grupo">
                        <label>Foto del recibo <span class="opcional">(opcional para consulta)</span></label>
                        <div 
                            class="dropzone" 
                            :class="{ 'dropzone-active': dragging, 'dropzone-loading': cargandoIA }"
                            @dragover.prevent="dragging = true"
                            @dragleave.prevent="dragging = false"
                            @drop.prevent="onDrop"
                            @click="fileInput?.click()"
                        >
                        <input 
                            type="file" 
                            ref="fileInput" 
                            class="hidden-input" 
                            accept="image/*,application/pdf" 
                            @change="onFileSelect"
                        />
        <div v-if="!imagenPreview && !cargandoIA" class="dropzone-info">
            <span class="icono-upload">📄</span>
            <p>Arrastra el recibo aquí o <strong>haz clic para buscar</strong></p>
            <span class="formato-info">JPG, PNG o PDF (Máx. 5MB)</span>
        </div>

        <div v-else-if="cargandoIA" class="dropzone-info">
            <p><strong>Analizando el archivo...</strong></p>
            <span class="formato-info">Extrayendo datos automáticamente</span>
        </div>

        <div v-else class="preview-container">
            <img v-if="imagenPreview" :src="imagenPreview" class="preview-img" />
            <div v-else class="pdf-preview">
                <span class="pdf-icon">📄</span>
                <p>PDF cargado</p>
            </div>
            <button type="button" class="btn-quitar" @click.stop="quitarImagen">✕</button>
        </div>
    </div>

</div>
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
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import { paso3Schema } from '../schemas/simulacionesSchema';
import { useSimulaciones } from '../controladores/useSimulaciones';
import simulacionesApi from '../api/simulacionesApi';

const router = useRouter();
const route = useRoute();
const { cargando, error, guardarConsumoElectrico, guardarResultados, calcularResultados, obtieneConsumoElectrico, cargandoIA, extraerDatosConIA } = useSimulaciones();

const cliente_id = Number(route.params.cliente_id);
const simulacion_id = Number(route.params.simulacion_id);

const { handleSubmit } = useForm({ validationSchema: paso3Schema });
const { value: consumoValue, errorMessage: consumoError } = useField<number>('consumo_mensual_kwh');
const { value: costoValue, errorMessage: costoError } = useField<number>('costo_mensual_mxn');
const { value: tarifaValue, errorMessage: tarifaError } = useField<string>('tipo_tarifa');
const { value: periodoValue, errorMessage: periodoError } = useField<string>('periodo_facturacion');
const { value: reciboValue } = useField<string>('numero_recibo');

const dragging = ref(false);
const imagenPreview = ref<string | undefined>(undefined);
const archivoRecibo = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);


// Calcula la tarifa por kWh automáticamente
const tarifaKwh = computed(() => {
    if (consumoValue.value > 0 && costoValue.value > 0) {
        return costoValue.value / consumoValue.value;
    }
    return 0;
});

const onSubmit = handleSubmit(async (values) => {
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

    const consumoExistente = await obtieneConsumoElectrico(simulacion_id);

    if (consumoExistente && consumoExistente.id) {
        // Ya existe → PUT
        await simulacionesApi.put('/consumo', { 
            ...consumo, 
            id: Number(consumoExistente.id) 
        });
    } else {
        // No existe → POST
        await guardarConsumoElectrico(consumo);
    }

    if (!error.value) {
        router.push({
            path: `/simulaciones/resultados/${simulacion_id}`,
            query: { nombre: route.query.nombre, cliente_id }
        });
    }
});

const onDrop = (e: DragEvent) => {
    dragging.value = false;
    const files = e.dataTransfer?.files;
    // Agregamos la validación de que files[0] existe
    if (files && files.length > 0 && files[0]) {
        procesarArchivo(files[0]);
    }
};

const onFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement;
    // Lo mismo aquí, aseguramos que target.files[0] no sea undefined
    if (target.files && target.files.length > 0 && target.files[0]) {
        procesarArchivo(target.files[0]);
    }
};

const procesarArchivo = async (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        alert('Por favor, sube una imagen válida (JPG, PNG) o un PDF');
        return;
    }

    archivoRecibo.value = file;
    // Crear URL para la vista previa solo si es imagen
    if (file.type.startsWith('image/')) {
        imagenPreview.value = URL.createObjectURL(file);
    } else {
        imagenPreview.value = undefined; // Para PDFs no mostrar preview
    }

    // Extraer datos con IA
    const resultado = await extraerDatosConIA(file);
    if (resultado) {
        // Llenado automático de los campos
        if (resultado.consumoKwh) {
            consumoValue.value = resultado.consumoKwh;
        }
        if (resultado.costoMx) {
            costoValue.value = resultado.costoMx;
        }
        if (resultado.tarifaCfe) {
            tarifaValue.value = resultado.tarifaCfe;
        }
        if (resultado.numRecibo) {
            reciboValue.value = resultado.numRecibo;
        }
        if (resultado.periodo_facturacion) {
            periodoValue.value = resultado.periodo_facturacion;
        }
        console.log("Datos extraídos exitosamente del recibo");
    }
};

const quitarImagen = () => {
    if (imagenPreview.value) {
        URL.revokeObjectURL(imagenPreview.value);
    }
    imagenPreview.value = undefined;
    archivoRecibo.value = null;
    if (fileInput.value) fileInput.value.value = '';
};
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

@media (max-width: 900px) {
    .contenedor {
        padding: 1rem;
    }

    /* 1. Apilamos los pasos verticalmente o los hacemos deslizables */
    .pasos {
        padding: 1rem;
        flex-wrap: nowrap;
        overflow-x: auto; /* Permite deslizar los pasos si no caben */
        justify-content: flex-start;
        gap: 1rem;
        -webkit-overflow-scrolling: touch;
    }

    .paso {
        min-width: 80px; /* Asegura que el texto no se encime */
    }

    .paso-linea {
        min-width: 20px;
    }

    /* 2. Layout de una sola columna */
    .layout {
        grid-template-columns: 1fr; /* El panel de ayuda se va abajo */
    }

    /* 3. Inputs de uno por uno */
    .fila-doble {
        grid-template-columns: 1fr;
        gap: 1.25rem;
    }

    /* 4. Botón de acción al 100% */
    .botones {
        justify-content: center;
    }

    .btn-siguiente {
        width: 100%;
    }
}

@media (max-width: 480px) {
    .encabezado {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .btn-volver {
        width: 100%;
        text-align: center;
    }

    .card {
        padding: 1.25rem;
    }

    .tarifa-calculada {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
}
/* --- DISEÑO RESPONSIVO PARA LOS PASOS EN MÓVIL --- */

@media (max-width: 600px) {
    .pasos {
        padding: 0.75rem 0.5rem; /* Menos espacio interno */
        gap: 0.2rem; /* Espacio mínimo entre elementos */
        justify-content: space-between;
    }

    .paso {
        min-width: 60px; /* Ancho reducido para que quepan los 4 */
    }

    .paso-numero {
        width: 24px;  /* Círculos más chicos (antes 36px) */
        height: 24px;
        font-size: 0.75rem; /* Número más pequeño */
    }

    .paso span {
        font-size: 0.65rem; /* Texto más chico */
        text-align: center;
        white-space: nowrap; /* Evita que el texto salte de línea */
    }

    .paso-linea {
        margin-bottom: 1.1rem; /* Alinea la línea con los círculos más chicos */
        height: 1px; /* Línea más fina */
    }
    
}

/* Ajuste extra para teléfonos muy delgados */
@media (max-width: 380px) {
    .paso span {
        display: none; /* En pantallas minúsculas, solo dejamos los números para que no se encimen */
    }
    
    .paso-linea {
        margin-bottom: 0.7rem;
    }
}

.dropzone {
    border: 2px dashed #ddd;
    border-radius: 8px;
    padding: 1.5rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #fafafa;
    position: relative;
    min-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.dropzone:hover, .dropzone-active {
    border-color: #FF7043;
    background: #fff5f2;
}

.dropzone-loading {
    border-color: #FF7043;
    background: #fff5f2;
    opacity: 0.8;
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 1; }
}

.hidden-input { display: none; }

.dropzone-info p {
    font-size: 0.9rem;
    margin: 0.5rem 0;
    color: #444;
}

.formato-info {
    font-size: 0.75rem;
    color: #999;
}

.icono-upload { font-size: 2rem; }

.preview-container {
    position: relative;
    width: 100%;
    max-height: 200px;
    overflow: hidden;
    border-radius: 4px;
}

.preview-img {
    width: 100%;
    height: auto;
    object-fit: contain;
}

.pdf-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 150px;
    background: #f8f9fa;
    border: 2px dashed #dee2e6;
    border-radius: 4px;
}

.pdf-icon {
    font-size: 3rem;
    margin-bottom: 0.5rem;
}

.pdf-preview p {
    margin: 0;
    font-size: 0.9rem;
    color: #666;
}

.btn-quitar {
    position: absolute;
    top: 5px;
    right: 5px;
    background: rgba(239, 68, 68, 0.9);
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>