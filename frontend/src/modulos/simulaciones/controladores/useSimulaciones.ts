import { ref } from 'vue';
import simulacionesApi, { nasaApi } from '../api/simulacionesApi';
// Importa la nueva función de la API de IA
import { analizarReciboConIA } from '../api/simulacionesApi'; 
import type {
    Simulacion, SimulacionNueva,
    DatosTecho, DatosGeograficos,
    ConsumoElectrico, ResultadosCalculo
} from '../interfaces/simulaciones-interface';

export const useSimulaciones = () => {
    const simulaciones = ref<Simulacion[]>([]);
    const simulacionActual = ref<Simulacion | null>(null);
    const cargando = ref(false);
    // Nuevo estado para el proceso de visión
    const cargandoIA = ref(false); 
    const error = ref<string | null>(null);
    const mensaje = ref<string | null>(null);

    // --- NUEVA FUNCIONALIDAD: EXTRACCIÓN CON IA ---
    
    /**
     * Procesa la imagen del recibo, la envía a la IA y 
     * devuelve los datos para llenar el formulario automáticamente.
     */
    const extraerDatosConIA = async (archivo: File): Promise<any> => {
        if (!archivo) return null;
        
        cargandoIA.value = true;
        error.value = null;

        return new Promise((resolve) => {
            const lector = new FileReader();
            lector.readAsDataURL(archivo);
            
            lector.onload = async () => {
                try {
                    const base64 = lector.result as string;
                    console.log('Imagen convertida a base64, enviando a IA...');
                    // Llamada al endpoint /ia/analizar-recibo que configuramos en el backend
                    const datos = await analizarReciboConIA(base64);
                    console.log('Datos recibidos de IA:', datos);
                    resolve(datos);
                } catch (err) {
                    error.value = 'No se pudo leer el recibo automáticamente';
                    resolve(null);
                } finally {
                    cargandoIA.value = false;
                }
            };

            lector.onerror = () => {
                error.value = 'Error al leer el archivo de imagen';
                cargandoIA.value = false;
                resolve(null);
            };
        });
    };

    // --- MÉTODOS EXISTENTES (Mantenidos intactos) ---

    const traeSimulacionesPorCliente = async (cliente_id: number) => {
        try {
            cargando.value = true;
            const respuesta = await simulacionesApi.get<Simulacion[]>(`/cliente/${cliente_id}`);
            simulaciones.value = respuesta.data;
        } catch (err) {
            error.value = 'No se pudieron obtener las simulaciones';
        } finally {
            cargando.value = false;
        }
    };

    const agregarSimulacion = async (nueva: SimulacionNueva): Promise<number | null> => {
        try {
            cargando.value = true;
            const respuesta = await simulacionesApi.post('/', nueva);
            return respuesta.data.insertId ?? null;
        } catch (err) {
            error.value = 'No se pudo crear la simulación';
            return null;
        } finally {
            cargando.value = false;
        }
    };

    const borrarSimulacion = async (id: number) => {
        try {
            cargando.value = true;
            const respuesta = await simulacionesApi.delete('/', { data: { id } });
            if (respuesta.data.affectedRows >= 1) {
                mensaje.value = 'Simulación eliminada correctamente';
            }
        } catch (err) {
            error.value = 'No se pudo eliminar la simulación';
        } finally {
            cargando.value = false;
        }
    };

    const guardarDatosTecho = async (datos: DatosTecho) => {
        try {
            const respuesta = await simulacionesApi.post('/techo', datos);
            return respuesta.data;
        } catch (err) {
            error.value = 'No se pudieron guardar los datos del techo';
            return null;
        }
    };

    const consultarNasa = async (latitud: number, longitud: number): Promise<DatosGeograficos | null> => {
        try {
            const respuesta = await nasaApi.post('/', { latitud, longitud });
            return respuesta.data;
        } catch (err) {
            error.value = 'No se pudo consultar NASA POWER';
            return null;
        }
    };

    const guardarDatosGeograficos = async (datos: DatosGeograficos) => {
        try {
            const respuesta = await simulacionesApi.post('/geograficos', datos);
            return respuesta.data;
        } catch (err) {
            error.value = 'No se pudieron guardar los datos geográficos';
            return null;
        }
    };

    const guardarConsumoElectrico = async (datos: ConsumoElectrico) => {
        try {
            const respuesta = await simulacionesApi.post('/consumo', datos);
            return respuesta.data;
        } catch (err) {
            error.value = 'No se pudo guardar el consumo eléctrico';
            return null;
        }
    };

    const guardarResultados = async (datos: ResultadosCalculo) => {
        try {
            const respuesta = await simulacionesApi.post('/resultados', datos);
            await simulacionesApi.patch('/estado', {
                id: datos.simulacion_id,
                estado: 'completada'
            });
            return respuesta.data;
        } catch (err) {
            error.value = 'No se pudieron guardar los resultados';
            return null;
        }
    };

    const calcularResultados = (
        consumo: ConsumoElectrico,
        techo: DatosTecho,
        geo: DatosGeograficos,
        simulacion_id: number
    ): ResultadosCalculo => {
        const COSTO_POR_WP = 17.50;
        const CO2_POR_KWH = 0.45;
        const VIDA_UTIL = 25;
        const DEGRADACION = 0.005;
        const EFICIENCIA_INVERSOR = 0.97;
        const TASA_INCREMENTO = 0.05;

        const hsp = geo.horas_sol_pico_diarias;
        const areaUtil = techo.area_util_m2 ?? techo.area_m2 * 0.85;

        const cantidadPaneles = Math.floor(areaUtil / 1.96);
        const consumoDiarioKwh = consumo.consumo_anual_kwh / 365;
        const potenciaNecesariaKwp = consumoDiarioKwh / (hsp * EFICIENCIA_INVERSOR * techo.factor_sombra);
        const maxPanelesTecho = Math.floor(areaUtil / 1.96);
        const maxKwpTecho = (maxPanelesTecho * 410) / 1000;
        const potenciaFinalKwp = Math.min(potenciaNecesariaKwp * 1.05, maxKwpTecho);
        const produccionAnio1 = potenciaFinalKwp * hsp * 365 * EFICIENCIA_INVERSOR * techo.factor_sombra;
        const numeroPanelesInstalar = Math.ceil((potenciaFinalKwp * 1000) / 410);
        const produccionAnual = produccionAnio1 * (1 - (DEGRADACION * (VIDA_UTIL - 1) / 2));
        const produccionMensual = produccionAnual / 12;
        const porcentajeCobertura = Math.min((produccionAnual / consumo.consumo_anual_kwh) * 100, 100);
        const excedente = Math.max(produccionAnual - consumo.consumo_anual_kwh, 0);
        const kwAhorrados = Math.min(produccionAnual, consumo.consumo_anual_kwh);
        const ahorroAnual = kwAhorrados * consumo.tarifa_kwh_mxn;
        const ahorroMensual = ahorroAnual / 12;
        const costoInstalacion = potenciaFinalKwp * 1000 * COSTO_POR_WP; 
        const payback = costoInstalacion / ahorroAnual;

        let ahorroTotal = 0;
        let tarifaActual = consumo.tarifa_kwh_mxn;
        let produccionActual = produccionAnio1;
        for (let i = 0; i < VIDA_UTIL; i++) {
            ahorroTotal += Math.min(produccionActual, consumo.consumo_anual_kwh) * tarifaActual;
            tarifaActual *= (1 + TASA_INCREMENTO);
            produccionActual *= (1 - DEGRADACION);
        }

        const co2Anual = produccionAnual * CO2_POR_KWH;
        const co2VidaUtil = co2Anual * VIDA_UTIL;
        const arboles = Math.round(co2VidaUtil / 21.77);

        return {
            simulacion_id,
            numero_paneles: numeroPanelesInstalar,
            produccion_anual_kwh: parseFloat(produccionAnual.toFixed(2)),
            produccion_mensual_promedio_kwh: parseFloat(produccionMensual.toFixed(2)),
            porcentaje_cobertura: parseFloat(porcentajeCobertura.toFixed(2)),
            excedente_kwh: parseFloat(excedente.toFixed(2)),
            ahorro_mensual_mxn: parseFloat(ahorroMensual.toFixed(2)),
            ahorro_anual_mxn: parseFloat(ahorroAnual.toFixed(2)),
            ahorro_vida_util_mxn: parseFloat(ahorroTotal.toFixed(2)),
            costo_total_instalacion_mxn: parseFloat(costoInstalacion.toFixed(2)),
            retorno_inversion_anios: parseFloat(payback.toFixed(2)),
            co2_evitado_anual_kg: parseFloat(co2Anual.toFixed(2)),
            co2_evitado_vida_util_kg: parseFloat(co2VidaUtil.toFixed(2)),
            arboles_equivalentes: arboles,
            precio_kwh_proyectado_anio5: parseFloat((consumo.tarifa_kwh_mxn * Math.pow(1 + TASA_INCREMENTO, 5)).toFixed(4)),
            precio_kwh_proyectado_anio10: parseFloat((consumo.tarifa_kwh_mxn * Math.pow(1 + TASA_INCREMENTO, 10)).toFixed(4)),
            tasa_incremento_tarifa_pct: TASA_INCREMENTO * 100
        };
    };

    // Funciones para obtener datos existentes
    const obtieneDatosTecho = async (simulacion_id: number): Promise<DatosTecho | null> => {
        try {
            const respuesta = await simulacionesApi.get<DatosTecho>(`/techo/${simulacion_id}`);
            return respuesta.data;
        } catch (err) {
            error.value = 'No se pudieron obtener los datos del techo';
            return null;
        }
    };

    const obtieneDatosGeograficos = async (simulacion_id: number): Promise<DatosGeograficos | null> => {
        try {
            const respuesta = await simulacionesApi.get<DatosGeograficos>(`/geograficos/${simulacion_id}`);
            return respuesta.data;
        } catch (err) {
            error.value = 'No se pudieron obtener los datos geográficos';
            return null;
        }
    };

    const obtieneConsumoElectrico = async (simulacion_id: number): Promise<ConsumoElectrico | null> => {
        try {
            const respuesta = await simulacionesApi.get<ConsumoElectrico>(`/consumo/${simulacion_id}`);
            return respuesta.data;
        } catch (err) {
            error.value = 'No se pudo obtener el consumo eléctrico';
            return null;
        }
    };

    const obtieneResultados = async (simulacion_id: number): Promise<ResultadosCalculo | null> => {
        try {
            const respuesta = await simulacionesApi.get<ResultadosCalculo>(`/resultados/${simulacion_id}`);
            return respuesta.data;
        } catch (err) {
            error.value = 'No se pudieron obtener los resultados';
            return null;
        }
    };

    const detectaPasoActual = async (simulacion_id: number): Promise<number> => {
        try {
            // Verificar qué datos ya existen para determinar el paso
            const [techo, geo, consumo, resultados] = await Promise.all([
                obtieneDatosTecho(simulacion_id),
                obtieneDatosGeograficos(simulacion_id),
                obtieneConsumoElectrico(simulacion_id),
                obtieneResultados(simulacion_id)
            ]);

            if (!techo) return 1; // Paso 1: Datos del techo
            if (!geo) return 2; // Paso 2: Datos geográficos
            if (!consumo) return 3; // Paso 3: Consumo eléctrico
            if (!resultados) return 4; // Paso 4: Calcular resultados
            return 5; // Completado
        } catch (err) {
            console.error('Error detectando paso actual:', err);
            return 1; // Por defecto, empezar desde el principio
        }
    };

    return {
        simulaciones,
        simulacionActual,
        cargando,
        cargandoIA, // Nuevo estado de carga para la visión
        error,
        mensaje,
        extraerDatosConIA, // Nueva función para procesar el recibo
        traeSimulacionesPorCliente,
        agregarSimulacion,
        borrarSimulacion,
        guardarDatosTecho,
        consultarNasa,
        guardarDatosGeograficos,
        guardarConsumoElectrico,
        guardarResultados,
        calcularResultados,
        obtieneDatosTecho,
        obtieneDatosGeograficos,
        obtieneConsumoElectrico,
        obtieneResultados,
        detectaPasoActual
    };
};