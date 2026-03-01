export interface Simulacion {
    id: number;
    cliente_id: number;
    usuario_id: number;
    nombre_proyecto: string | null;
    descripcion: string | null;
    estado: 'borrador' | 'completada' | 'cotizada';
}

export type SimulacionNueva = Omit<Simulacion, 'id'>;

export interface DatosTecho {
    id?: number;
    simulacion_id: number;
    geojson: string;
    area_m2: number;
    perimetro_m: number | null;
    latitud: number;
    longitud: number;
    tipo_techo: 'plano' | 'inclinado' | 'mixto';
    angulo_inclinacion_deg: number;
    azimut_deg: number | null;
    factor_sombra: number;
    area_util_m2: number | null;
}

export interface DatosGeograficos {
    id?: number;
    simulacion_id: number;
    irradiacion_anual_kwh_m2: number;
    irradiacion_diaria_promedio: number;
    horas_sol_pico_diarias: number;
    temperatura_promedio_anual: number;
    temperatura_max_verano: number;
    temperatura_min_invierno: number;
    velocidad_viento_promedio: number;
    altitud_msnm: number;
    zona_climatica: string;
    fuente_datos: string;
    fecha_consulta: string;
}

export interface ConsumoElectrico {
    id?: number;
    simulacion_id: number;
    consumo_mensual_kwh: number;
    consumo_anual_kwh: number;
    tarifa_kwh_mxn: number;
    costo_mensual_mxn: number;
    tipo_tarifa: string;
    numero_recibo: string | null;
    periodo_facturacion: string;
}

export interface ResultadosCalculo {
    id?: number;
    simulacion_id: number;
    produccion_anual_kwh: number;
    produccion_mensual_promedio_kwh: number;
    porcentaje_cobertura: number;
    excedente_kwh: number;
    ahorro_mensual_mxn: number;
    ahorro_anual_mxn: number;
    ahorro_vida_util_mxn: number;
    costo_total_instalacion_mxn: number;
    retorno_inversion_anios: number;
    co2_evitado_anual_kg: number;
    co2_evitado_vida_util_kg: number;
    arboles_equivalentes: number;
    precio_kwh_proyectado_anio5: number;
    precio_kwh_proyectado_anio10: number;
    tasa_incremento_tarifa_pct: number;
}