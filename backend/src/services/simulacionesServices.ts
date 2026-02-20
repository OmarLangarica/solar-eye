import conexion from '../db/conexion.js';
import type {
    Simulacion, SimulacionNueva,
    DatosTecho, DatosTechoNuevo,
    DatosGeograficosNuevo,
    ConsumoElectrico, ConsumoElectricoNuevo,
    ConfiguracionSistema, ConfiguracionSistemaNueva,
    ResultadosCalculoNuevo
} from '../types/typesSimulaciones.js';
import {
    simulacionSchema, simulacionActualizarSchema,
    datosTechoSchema, datosTechoActualizarSchema,
    datosGeograficosSchema,
    consumoElectricoSchema, consumoElectricoActualizarSchema,
    configuracionSistemaSchema, configuracionSistemaActualizarSchema,
    resultadosCalculoSchema
} from '../schema/simulacionesSchema.js';

//Simulaciones

export const obtieneSimulaciones = async () => {
    try {
        const [results] = await conexion.query('SELECT * FROM simulaciones');
        return results;
    } catch (err) {
        return { error: 'No se pudieron obtener las simulaciones' };
    }
};

export const obtieneSimulacionesPorCliente = async (cliente_id: number) => {
    try {
        const [results] = await conexion.query(
            'SELECT * FROM simulaciones WHERE cliente_id = ?',
            [cliente_id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudieron obtener las simulaciones del cliente' };
    }
};

export const encuentraSimulacion = async (id: number) => {
    try {
        const [results] = await conexion.query(
            'SELECT * FROM simulaciones WHERE id = ? LIMIT 1',
            [id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo encontrar la simulación' };
    }
};

export const agregarSimulacion = async (nueva: SimulacionNueva) => {
    try {
        const validacion = simulacionSchema.safeParse(nueva);
        if (!validacion.success) return { error: validacion.error };

        const [results] = await conexion.query(
            'INSERT INTO simulaciones (cliente_id, usuario_id, nombre_proyecto, descripcion, estado) VALUES (?,?,?,?,?)',
            [nueva.cliente_id, nueva.usuario_id, nueva.nombre_proyecto, nueva.descripcion, nueva.estado]
        );
        return results;
    } catch (err) {
        console.error('Error MySQL simulaciones:', err);
        return { error: 'No se pudo agregar la simulación' };
    }
};

export const modificarSimulacion = async (modificada: Simulacion) => {
    try {
        const validacion = simulacionActualizarSchema.safeParse(modificada);
        if (!validacion.success) return { error: validacion.error };

        const [results] = await conexion.query(
            'UPDATE simulaciones SET nombre_proyecto = ?, descripcion = ?, estado = ? WHERE id = ?',
            [modificada.nombre_proyecto, modificada.descripcion, modificada.estado, modificada.id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo modificar la simulación' };
    }
};

export const borrarSimulacion = async (id: number) => {
    try {
        const [results] = await conexion.query(
            'DELETE FROM simulaciones WHERE id = ?',
            [id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo borrar la simulación' };
    }
};

//Datos Techo

export const agregaDatosTecho = async (nuevo: DatosTechoNuevo) => {
    try {
        const validacion = datosTechoSchema.safeParse(nuevo);
        if (!validacion.success) return { error: validacion.error };

        const [results] = await conexion.query(
            `INSERT INTO datos_techo 
            (simulacion_id, geojson, area_m2, perimetro_m, latitud, longitud, tipo_techo, 
            angulo_inclinacion_deg, azimut_deg, factor_sombra, area_util_m2) 
            VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
            [nuevo.simulacion_id, nuevo.geojson, nuevo.area_m2, nuevo.perimetro_m,
             nuevo.latitud, nuevo.longitud, nuevo.tipo_techo, nuevo.angulo_inclinacion_deg,
             nuevo.azimut_deg, nuevo.factor_sombra, nuevo.area_util_m2]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudieron guardar los datos del techo' };
    }
};

export const modificaDatosTecho = async (modificado: DatosTecho) => {
    try {
        const validacion = datosTechoActualizarSchema.safeParse(modificado);
        if (!validacion.success) return { error: validacion.error };

        const [results] = await conexion.query(
            `UPDATE datos_techo SET 
            geojson = ?, area_m2 = ?, perimetro_m = ?, latitud = ?, longitud = ?, 
            tipo_techo = ?, angulo_inclinacion_deg = ?, azimut_deg = ?, 
            factor_sombra = ?, area_util_m2 = ? WHERE id = ?`,
            [modificado.geojson, modificado.area_m2, modificado.perimetro_m,
             modificado.latitud, modificado.longitud, modificado.tipo_techo,
             modificado.angulo_inclinacion_deg, modificado.azimut_deg,
             modificado.factor_sombra, modificado.area_util_m2, modificado.id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudieron modificar los datos del techo' };
    }
};

export const obtieneDatosTecho = async (simulacion_id: number) => {
    try {
        const [results] = await conexion.query(
            'SELECT * FROM datos_techo WHERE simulacion_id = ? LIMIT 1',
            [simulacion_id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudieron obtener los datos del techo' };
    }
};

//Datos Geográficos

export const agregaDatosGeograficos = async (nuevo: DatosGeograficosNuevo) => {
    try {
        const validacion = datosGeograficosSchema.safeParse(nuevo);
        if (!validacion.success) return { error: validacion.error };

        const [results] = await conexion.query(
            `INSERT INTO datos_geograficos 
            (simulacion_id, irradiacion_anual_kwh_m2, irradiacion_diaria_promedio, horas_sol_pico_diarias,
            temperatura_promedio_anual, temperatura_max_verano, temperatura_min_invierno,
            velocidad_viento_promedio, altitud_msnm, zona_climatica, fuente_datos, fecha_consulta) 
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
            [nuevo.simulacion_id, nuevo.irradiacion_anual_kwh_m2, nuevo.irradiacion_diaria_promedio,
             nuevo.horas_sol_pico_diarias, nuevo.temperatura_promedio_anual, nuevo.temperatura_max_verano,
             nuevo.temperatura_min_invierno, nuevo.velocidad_viento_promedio, nuevo.altitud_msnm,
             nuevo.zona_climatica, nuevo.fuente_datos, nuevo.fecha_consulta]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudieron guardar los datos geográficos' };
    }
};

export const obtieneDatosGeograficos = async (simulacion_id: number) => {
    try {
        const [results] = await conexion.query(
            'SELECT * FROM datos_geograficos WHERE simulacion_id = ? LIMIT 1',
            [simulacion_id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudieron obtener los datos geográficos' };
    }
};

//Consumo Eléctrico

export const agregaConsumoElectrico = async (nuevo: ConsumoElectricoNuevo) => {
    try {
        const validacion = consumoElectricoSchema.safeParse(nuevo);
        if (!validacion.success) return { error: validacion.error };

        const [results] = await conexion.query(
            `INSERT INTO consumo_electrico 
            (simulacion_id, consumo_mensual_kwh, consumo_anual_kwh, tarifa_kwh_mxn, 
            costo_mensual_mxn, tipo_tarifa, numero_recibo, periodo_facturacion) 
            VALUES (?,?,?,?,?,?,?,?)`,
            [nuevo.simulacion_id, nuevo.consumo_mensual_kwh, nuevo.consumo_anual_kwh,
             nuevo.tarifa_kwh_mxn, nuevo.costo_mensual_mxn, nuevo.tipo_tarifa,
             nuevo.numero_recibo, nuevo.periodo_facturacion]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo guardar el consumo eléctrico' };
    }
};

export const modificaConsumoElectrico = async (modificado: ConsumoElectrico) => {
    try {
        const validacion = consumoElectricoActualizarSchema.safeParse(modificado);
        if (!validacion.success) return { error: validacion.error };

        const [results] = await conexion.query(
            `UPDATE consumo_electrico SET 
            consumo_mensual_kwh = ?, consumo_anual_kwh = ?, tarifa_kwh_mxn = ?, 
            costo_mensual_mxn = ?, tipo_tarifa = ?, numero_recibo = ?, periodo_facturacion = ? 
            WHERE id = ?`,
            [modificado.consumo_mensual_kwh, modificado.consumo_anual_kwh, modificado.tarifa_kwh_mxn,
             modificado.costo_mensual_mxn, modificado.tipo_tarifa, modificado.numero_recibo,
             modificado.periodo_facturacion, modificado.id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo modificar el consumo eléctrico' };
    }
};

export const obtieneConsumoElectrico = async (simulacion_id: number) => {
    try {
        const [results] = await conexion.query(
            'SELECT * FROM consumo_electrico WHERE simulacion_id = ? LIMIT 1',
            [simulacion_id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo obtener el consumo eléctrico' };
    }
};

//Configuración Sistema Solar

export const agregaConfiguracionSistema = async (nueva: ConfiguracionSistemaNueva) => {
    try {
        const validacion = configuracionSistemaSchema.safeParse(nueva);
        if (!validacion.success) return { error: validacion.error };

        const [results] = await conexion.query(
            `INSERT INTO configuracion_sistema_solar 
            (simulacion_id, marca_panel, modelo_panel, potencia_panel_wp, eficiencia_panel,
            cantidad_paneles, area_por_panel_m2, marca_inversor, modelo_inversor, potencia_inversor_kw,
            eficiencia_inversor, tipo_inversor, potencia_total_kwp, tipo_conexion, incluye_bateria,
            capacidad_bateria_kwh, degradacion_anual_pct, vida_util_anios) 
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [nueva.simulacion_id, nueva.marca_panel, nueva.modelo_panel, nueva.potencia_panel_wp,
             nueva.eficiencia_panel, nueva.cantidad_paneles, nueva.area_por_panel_m2,
             nueva.marca_inversor, nueva.modelo_inversor, nueva.potencia_inversor_kw,
             nueva.eficiencia_inversor, nueva.tipo_inversor, nueva.potencia_total_kwp,
             nueva.tipo_conexion, nueva.incluye_bateria, nueva.capacidad_bateria_kwh,
             nueva.degradacion_anual_pct, nueva.vida_util_anios]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo guardar la configuración del sistema' };
    }
};

export const modificaConfiguracionSistema = async (modificada: ConfiguracionSistema) => {
    try {
        const validacion = configuracionSistemaActualizarSchema.safeParse(modificada);
        if (!validacion.success) return { error: validacion.error };

        const [results] = await conexion.query(
            `UPDATE configuracion_sistema_solar SET 
            marca_panel = ?, modelo_panel = ?, potencia_panel_wp = ?, eficiencia_panel = ?,
            cantidad_paneles = ?, area_por_panel_m2 = ?, marca_inversor = ?, modelo_inversor = ?,
            potencia_inversor_kw = ?, eficiencia_inversor = ?, tipo_inversor = ?, potencia_total_kwp = ?,
            tipo_conexion = ?, incluye_bateria = ?, capacidad_bateria_kwh = ?,
            degradacion_anual_pct = ?, vida_util_anios = ? WHERE id = ?`,
            [modificada.marca_panel, modificada.modelo_panel, modificada.potencia_panel_wp,
             modificada.eficiencia_panel, modificada.cantidad_paneles, modificada.area_por_panel_m2,
             modificada.marca_inversor, modificada.modelo_inversor, modificada.potencia_inversor_kw,
             modificada.eficiencia_inversor, modificada.tipo_inversor, modificada.potencia_total_kwp,
             modificada.tipo_conexion, modificada.incluye_bateria, modificada.capacidad_bateria_kwh,
             modificada.degradacion_anual_pct, modificada.vida_util_anios, modificada.id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo modificar la configuración del sistema' };
    }
};

export const obtieneConfiguracionSistema = async (simulacion_id: number) => {
    try {
        const [results] = await conexion.query(
            'SELECT * FROM configuracion_sistema_solar WHERE simulacion_id = ? LIMIT 1',
            [simulacion_id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo obtener la configuración del sistema' };
    }
};

// ─── Resultados ────────────────────────────────────────────────

export const agregaResultadosCalculo = async (nuevo: ResultadosCalculoNuevo) => {
    try {
        const validacion = resultadosCalculoSchema.safeParse(nuevo);
        if (!validacion.success) return { error: validacion.error };

        const [results] = await conexion.query(
            `INSERT INTO resultados_calculo 
            (simulacion_id, produccion_anual_kwh, produccion_mensual_promedio_kwh, porcentaje_cobertura,
            excedente_kwh, ahorro_mensual_mxn, ahorro_anual_mxn, ahorro_vida_util_mxn,
            costo_total_instalacion_mxn, retorno_inversion_anios, co2_evitado_anual_kg,
            co2_evitado_vida_util_kg, arboles_equivalentes, precio_kwh_proyectado_anio5,
            precio_kwh_proyectado_anio10, tasa_incremento_tarifa_pct) 
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [nuevo.simulacion_id, nuevo.produccion_anual_kwh, nuevo.produccion_mensual_promedio_kwh,
             nuevo.porcentaje_cobertura, nuevo.excedente_kwh, nuevo.ahorro_mensual_mxn,
             nuevo.ahorro_anual_mxn, nuevo.ahorro_vida_util_mxn, nuevo.costo_total_instalacion_mxn,
             nuevo.retorno_inversion_anios, nuevo.co2_evitado_anual_kg, nuevo.co2_evitado_vida_util_kg,
             nuevo.arboles_equivalentes, nuevo.precio_kwh_proyectado_anio5,
             nuevo.precio_kwh_proyectado_anio10, nuevo.tasa_incremento_tarifa_pct]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudieron guardar los resultados del cálculo' };
    }
};

export const obtieneResultadosCalculo = async (simulacion_id: number) => {
    try {
        const [results] = await conexion.query(
            'SELECT * FROM resultados_calculo WHERE simulacion_id = ? LIMIT 1',
            [simulacion_id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudieron obtener los resultados del cálculo' };
    }
};