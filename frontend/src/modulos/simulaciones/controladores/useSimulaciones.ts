import { ref } from 'vue';
import simulacionesApi, { nasaApi } from '../api/simulacionesApi';
import { analizarReciboConIA } from '../api/simulacionesApi'; 
import catalogoApi from '../api/catalogoApi';
import type { PanelSolar, InversorSolar, ModeladoElectrico } from '../interfaces/simulaciones-interface';
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
            // Mapear campos del frontend al formato que espera el backend
            const payload = {
                simulacion_id: datos.simulacion_id,
                produccion_anual_kwh: datos.produccion_anual_kwh,
                produccion_mensual_promedio_kwh: datos.produccion_mensual_promedio_kwh,
                porcentaje_cobertura: datos.porcentaje_cobertura,
                excedente_kwh: datos.excedente_kwh,
                ahorro_mensual_mxn: datos.ahorro_mensual_mxn,
                ahorro_anual_mxn: datos.ahorro_anual_mxn,
                ahorro_vida_util_mxn: datos.ahorro_vida_util_mxn,
                costo_total_instalacion_mxn: datos.costo_total_instalacion_mxn,
                retorno_inversion_anios: datos.retorno_inversion_anios,
                co2_evitado_anual_kg: datos.co2_evitado_anual_kg,
                co2_evitado_vida_util_kg: datos.co2_evitado_vida_util_kg,
                arboles_equivalentes: datos.arboles_equivalentes,
                precio_kwh_proyectado_anio5: datos.precio_kwh_proyectado_anio5,
                precio_kwh_proyectado_anio10: datos.precio_kwh_proyectado_anio10,
                tasa_incremento_tarifa_pct: datos.tasa_incremento_tarifa_pct,
                // Campos pvlib — mapeo correcto de nombres
                numero_paneles: datos.numero_paneles ?? null,
                performance_ratio: datos.performance_ratio ?? null,
                perdidas_json: datos.perdidas ?? null,
                metodo_simulacion: datos.metodo_simulacion ?? null,
                produccion_mensual_json: datos.produccion_mensual_detalle ?? null,
                modelado_electrico_json: datos.modelado_electrico ?? null,
            };

            const respuesta = await simulacionesApi.post('/resultados', payload);
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

    const calcularResultadosPvlib = async (
    consumo: ConsumoElectrico,
    techo: DatosTecho,
    geo: DatosGeograficos,
    simulacion_id: number
): Promise<ResultadosCalculo> => {
    try {
        cargando.value = true;
        error.value = '';

        // Leer componentes seleccionados en paso 3
        const componentesRaw = sessionStorage.getItem(`componentes_${simulacion_id}`);
        const componentes = componentesRaw ? JSON.parse(componentesRaw) : null;

        // Specs reales del panel/inversor o valores por defecto
        const eficienciaPanel    = componentes?.panel_eficiencia   ?? 0.205;
        const coefTempPanel      = componentes?.panel_coef_temp     ?? -0.0035;
        const eficienciaInversor = componentes?.inversor_eficiencia ?? 0.97;
        const areaPanel          = componentes?.panel_area_m2       ?? 1.96;
        const potenciaWp         = componentes?.panel_potencia_wp   ?? 410;

        // Cálculo correcto basado en panel real
        const cantidadPaneles = Math.floor(Number(techo.area_util_m2) / areaPanel);
        const potenciaKwp     = (cantidadPaneles * potenciaWp) / 1000;

        // Llamar al microservicio Python con specs reales
        const respPvlib = await simulacionesApi.post('/pvlib', {
            lat: Number(techo.latitud),
            lon: Number(techo.longitud),
            tilt: Number(techo.angulo_inclinacion_deg),
            azimut: Number(techo.azimut_deg) || 180,
            potencia_kwp: potenciaKwp,
            area_util_m2: Number(techo.area_util_m2),
            factor_sombra: Number(techo.factor_sombra),
            eficiencia_panel: eficienciaPanel,
            coef_temp_panel: coefTempPanel,
            eficiencia_inversor: eficienciaInversor
        });

        const pvlib = respPvlib.data;

        // Modelado eléctrico con datos reales del panel e inversor
        let modeladoElectrico = null;
        if (componentes?.panel_id && componentes?.inversor_id) {
            try {
                const [respPanel, respInversor] = await Promise.all([
                    catalogoApi.get(`/paneles/${componentes.panel_id}`),
                    catalogoApi.get(`/inversores/${componentes.inversor_id}`)
                ]);
                const panelData  = Array.isArray(respPanel.data)   ? respPanel.data[0]   : respPanel.data;
                const inversorData = Array.isArray(respInversor.data) ? respInversor.data[0] : respInversor.data;

                if (panelData && inversorData) {
                    modeladoElectrico = await calcularModeladoElectrico(
                        panelData,
                        inversorData,
                        cantidadPaneles
                    );
                }
            } catch (err) {
                console.error('Error obteniendo datos para modelado eléctrico:', err);
            }
        }


        // Datos base
        const produccionAnual  = pvlib.produccion_anual_kwh;
        const consumoAnual     = Number(consumo.consumo_anual_kwh);
        const consumoMensual   = Number(consumo.consumo_mensual_kwh);
        const tarifaKwh        = Number(consumo.tarifa_kwh_mxn);

        // Cálculos económicos
        const porcentajeCobertura = Math.min((produccionAnual / consumoAnual) * 100, 100);
        const excedente           = Math.max(produccionAnual - consumoAnual, 0);
        const ahorroMensual       = Math.min(produccionAnual / 12, consumoMensual) * tarifaKwh;
        const ahorroAnual         = ahorroMensual * 12;
        const costoInstalacion    = potenciaKwp * 18000;

        // Proyección a 25 años
        const tasaIncremento = 0.05;
        const degradacion    = 0.005;
        let ahorroAcumulado  = 0;
        let anioPayback      = 0;

        for (let anio = 1; anio <= 25; anio++) {
            const tarifaAnio     = tarifaKwh * Math.pow(1 + tasaIncremento, anio);
            const produccionAnio = produccionAnual * Math.pow(1 - degradacion, anio - 1);
            // Solo ahorras la energía que consumes, no el excedente
            const energiaAhorrada = Math.min(produccionAnio, consumoAnual);
            const ahorroAnio      = energiaAhorrada * tarifaAnio;
            ahorroAcumulado += ahorroAnio;

            // Log de verificación para los primeros 3 años
            if (anio <= 3) {
                console.log(`Año ${anio}: tarifa=$${tarifaAnio.toFixed(4)}, produccion=${produccionAnio.toFixed(0)}, energia_ahorrada=${energiaAhorrada.toFixed(0)}, ahorro=$${ahorroAnio.toFixed(0)}`);
            }

            if (anioPayback === 0 && ahorroAcumulado >= costoInstalacion) {
                anioPayback = anio;
            }
        }


        const retornoInversion = anioPayback || 25;
        const precioAnio5      = tarifaKwh * Math.pow(1 + tasaIncremento, 5);
        const precioAnio10     = tarifaKwh * Math.pow(1 + tasaIncremento, 10);

        // Impacto ambiental
        const co2AnualKg        = produccionAnual * 0.45;
        const co2VidaUtilKg     = co2AnualKg * 25;
        const arbolesEquivalentes = Math.round(co2AnualKg / 21.77);
        
        return {
            simulacion_id,
            numero_paneles:                 cantidadPaneles,
            produccion_anual_kwh:           produccionAnual,
            produccion_mensual_promedio_kwh: pvlib.produccion_mensual_promedio_kwh,
            porcentaje_cobertura:           parseFloat(porcentajeCobertura.toFixed(2)),
            excedente_kwh:                  parseFloat(excedente.toFixed(2)),
            ahorro_mensual_mxn:             parseFloat(ahorroMensual.toFixed(2)),
            ahorro_anual_mxn:               parseFloat(ahorroAnual.toFixed(2)),
            ahorro_vida_util_mxn:           parseFloat(ahorroAcumulado.toFixed(2)),
            costo_total_instalacion_mxn:    costoInstalacion,
            retorno_inversion_anios:        retornoInversion,
            co2_evitado_anual_kg:           parseFloat(co2AnualKg.toFixed(2)),
            co2_evitado_vida_util_kg:       parseFloat(co2VidaUtilKg.toFixed(2)),
            arboles_equivalentes:           arbolesEquivalentes,
            precio_kwh_proyectado_anio5:    parseFloat(precioAnio5.toFixed(4)),
            precio_kwh_proyectado_anio10:   parseFloat(precioAnio10.toFixed(4)),
            tasa_incremento_tarifa_pct:     5.00,
            // Campos pvlib
            performance_ratio:          pvlib.performance_ratio,
            produccion_mensual_detalle: pvlib.produccion_mensual,
            perdidas:                   pvlib.perdidas,
            metodo_simulacion:          pvlib.metodo,
            // Campos componentes
            panel_modelo:       componentes?.panel_modelo       ?? undefined,
            panel_potencia_wp:  componentes?.panel_potencia_wp  ?? undefined,
            inversor_modelo:    componentes?.inversor_modelo     ?? undefined,
            inversor_potencia_kw: componentes?.inversor_potencia_kw ?? undefined,
            potencia_kwp:       parseFloat(potenciaKwp.toFixed(2)),
            modelado_electrico:  modeladoElectrico ?? undefined
        };

    } catch (err: any) {
        error.value = 'Error en el motor de simulación';
        throw err;
    } finally {
        cargando.value = false;
    }
};

const calcularModeladoElectrico = async (
    panel: PanelSolar,
    inversor: InversorSolar,
    cantidadPaneles: number,
    tempMinSitio: number = 5.0,
    tempMaxCelda: number = 70.0
): Promise<ModeladoElectrico | null> => {
    try {
        const resp = await simulacionesApi.post('/electrico', {
            cantidad_paneles: cantidadPaneles,
            voc_panel: Number(panel.voc),
            vmp_panel: Number(panel.vmp),
            isc_panel: Number(panel.isc),
            imp_panel: Number(panel.imp),
            coef_temp_voc: Number(panel.coef_temp_voc),
            voltaje_mppt_min: Number(inversor.voltaje_mppt_min),
            voltaje_mppt_max: Number(inversor.voltaje_mppt_max),
            voltaje_max_entrada: Number(inversor.voltaje_max_entrada),
            corriente_max_entrada: Number(inversor.corriente_max_entrada),
            numero_mppt: Number(inversor.numero_mppt),
            numero_entradas_por_mppt: Number(inversor.numero_entradas_por_mppt),
            temp_min_sitio: tempMinSitio,
            temp_max_celda: tempMaxCelda
        });
        return resp.data;
    } catch (err) {
        console.error('Error modelado eléctrico:', err);
        return null;
    }
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
        const [techo, geo, consumo, resultados] = await Promise.all([
            obtieneDatosTecho(simulacion_id),
            obtieneDatosGeograficos(simulacion_id),
            obtieneConsumoElectrico(simulacion_id),
            obtieneResultados(simulacion_id)
        ]);

        const tieneValor = (data: any) => {
            if (!data) return false;
            if (Array.isArray(data)) return data.length > 0;
            if (data.error) return false;
            return true;
        };

        if (!tieneValor(techo)) return 2;
        if (!tieneValor(geo)) return 2;
        if (!tieneValor(consumo)) return 3;
        if (!tieneValor(resultados)) return 4;
        return 5;

    } catch (err) {
        console.error('Error detectando paso actual:', err);
        return 2;
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
        calcularResultadosPvlib,
        obtieneDatosTecho,
        obtieneDatosGeograficos,
        obtieneConsumoElectrico,
        obtieneResultados,
        detectaPasoActual,
        calcularModeladoElectrico
    };
};

