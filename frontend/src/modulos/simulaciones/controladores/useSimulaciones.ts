import { ref } from 'vue';
import simulacionesApi, { nasaApi } from '../api/simulacionesApi';
import type {
    Simulacion, SimulacionNueva,
    DatosTecho, DatosGeograficos,
    ConsumoElectrico, ResultadosCalculo
} from '../interfaces/simulaciones-interface';

export const useSimulaciones = () => {
    const simulaciones = ref<Simulacion[]>([]);
    const simulacionActual = ref<Simulacion | null>(null);
    const cargando = ref(false);
    const error = ref<string | null>(null);
    const mensaje = ref<string | null>(null);

    //Simulaciones
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

    //Datos Techo
    const guardarDatosTecho = async (datos: DatosTecho) => {
        try {
            const respuesta = await simulacionesApi.post('/techo', datos);
            return respuesta.data;
        } catch (err) {
            error.value = 'No se pudieron guardar los datos del techo';
            return null;
        }
    };

    // NASA POWER 
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

    //Consumo Eléctrico
    const guardarConsumoElectrico = async (datos: ConsumoElectrico) => {
        try {
            const respuesta = await simulacionesApi.post('/consumo', datos);
            return respuesta.data;
        } catch (err) {
            error.value = 'No se pudo guardar el consumo eléctrico';
            return null;
        }
    };

    //Resultados
    const guardarResultados = async (datos: ResultadosCalculo) => {
        try {
            const respuesta = await simulacionesApi.post('/resultados', datos);
            return respuesta.data;
        } catch (err) {
            error.value = 'No se pudieron guardar los resultados';
            return null;
        }
    };

    //Cálculo automático
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

        // Paneles que caben en el techo (panel estándar 1.96 m²)
        const cantidadPaneles = Math.floor(areaUtil / 1.96);
        const potenciaSistemaKwp = (cantidadPaneles * 410) / 1000;

        // Producción año 1 sin degradación
        const produccionAnio1 = potenciaSistemaKwp * hsp * 365 * EFICIENCIA_INVERSOR * techo.factor_sombra;

        // Producción promedio considerando degradación acumulada en 25 años
        const produccionAnual = produccionAnio1 * (1 - (DEGRADACION * (VIDA_UTIL - 1) / 2));
        const produccionMensual = produccionAnual / 12;

        // Cobertura
        const porcentajeCobertura = Math.min((produccionAnual / consumo.consumo_anual_kwh) * 100, 100);
        const excedente = Math.max(produccionAnual - consumo.consumo_anual_kwh, 0);

        // Económico
        const kwAhorrados = Math.min(produccionAnual, consumo.consumo_anual_kwh);
        const ahorroAnual = kwAhorrados * consumo.tarifa_kwh_mxn;
        const ahorroMensual = ahorroAnual / 12;
        const costoInstalacion = potenciaSistemaKwp * 1000 * COSTO_POR_WP;
        const payback = costoInstalacion / ahorroAnual;

        // Ahorro en vida útil con incremento tarifario
        let ahorroTotal = 0;
        let tarifaActual = consumo.tarifa_kwh_mxn;
        let produccionActual = produccionAnio1;
        for (let i = 0; i < VIDA_UTIL; i++) {
            ahorroTotal += Math.min(produccionActual, consumo.consumo_anual_kwh) * tarifaActual;
            tarifaActual *= (1 + TASA_INCREMENTO);
            produccionActual *= (1 - DEGRADACION);
        }

        // Proyección tarifaria
        const tarifa5 = consumo.tarifa_kwh_mxn * Math.pow(1 + TASA_INCREMENTO, 5);
        const tarifa10 = consumo.tarifa_kwh_mxn * Math.pow(1 + TASA_INCREMENTO, 10);

        // Ambiental
        const co2Anual = produccionAnual * CO2_POR_KWH;
        const co2VidaUtil = co2Anual * VIDA_UTIL;
        const arboles = Math.round(co2VidaUtil / 21.77); // 1 árbol absorbe ~21.77 kg CO2/año en 25 años

        return {
            simulacion_id,
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
            precio_kwh_proyectado_anio5: parseFloat(tarifa5.toFixed(4)),
            precio_kwh_proyectado_anio10: parseFloat(tarifa10.toFixed(4)),
            tasa_incremento_tarifa_pct: TASA_INCREMENTO * 100
        };
    };

    //Obtener datos guardados
    const obtieneDatosTecho = async (simulacion_id: number) => {
        try {
            const respuesta = await simulacionesApi.get(`/techo/${simulacion_id}`);
            const data = respuesta.data as any[];
            return Array.isArray(data) ? data[0] : data;
        } catch (err) {
            return null;
        }
    };

    const obtieneDatosGeograficos = async (simulacion_id: number) => {
        try {
            const respuesta = await simulacionesApi.get(`/geograficos/${simulacion_id}`);
            const data = respuesta.data as any[];
            return Array.isArray(data) ? data[0] : data;
        } catch (err) {
            return null;
        }
    };

    const obtieneConsumoElectrico = async (simulacion_id: number) => {
        try {
            const respuesta = await simulacionesApi.get(`/consumo/${simulacion_id}`);
            const data = respuesta.data as any[];
            return Array.isArray(data) ? data[0] : data;
        } catch (err) {
            return null;
        }
    };

    const obtieneResultados = async (simulacion_id: number) => {
        try {
            const respuesta = await simulacionesApi.get(`/resultados/${simulacion_id}`);
            const data = respuesta.data as any[];
            return Array.isArray(data) ? data[0] : data;
        } catch (err) {
            return null;
        }
    };

    return {
        simulaciones,
        simulacionActual,
        cargando,
        error,
        mensaje,
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
        obtieneResultados
    };
};