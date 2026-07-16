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
    simulacion_id: number;
    numero_paneles: number;
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
    // Campos pvlib
    performance_ratio?: number;
    produccion_mensual_detalle?: ProduccionMensual[];
    perdidas?: PorcentajePerdidas;
    metodo_simulacion?: string;
    // Campos componentes ← AGREGA AQUÍ
    panel_modelo?: string;
    panel_potencia_wp?: number;
    inversor_modelo?: string;
    inversor_potencia_kw?: number;
    potencia_kwp?: number;
    modelado_electrico?: ModeladoElectrico;
}

export interface ProduccionMensual {
    mes: string;
    numero_mes: number;
    produccion_kwh: number;
    irradiancia_poa_kwh_m2: number;
    temp_celda_promedio_c: number;
}

export interface PorcentajePerdidas {
    temperatura_pct: number;
    suciedad_pct: number;
    cableado_pct: number;
    mismatch_pct: number;
    disponibilidad_pct: number;
    sombra_pct: number;
    total_pct: number;
    performance_ratio: number;
}

export interface PanelSolar {
    id: number;
    fabricante_id: number;
    fabricante_nombre: string;
    modelo: string;
    potencia_wp: number;
    eficiencia: number;
    voc: number;
    isc: number;
    vmp: number;
    imp: number;
    coef_temp_potencia: number;
    coef_temp_voc: number;
    ancho_m: number;
    alto_m: number;
    area_m2: number;
    peso_kg: number;
    tecnologia: string;
    numero_celdas: number;
    garantia_anios: number;
}

export interface InversorSolar {
    id: number;
    fabricante_id: number;
    fabricante_nombre: string;
    modelo: string;
    potencia_nominal_kw: number;
    potencia_maxima_kw: number;
    eficiencia_maxima: number;
    eficiencia_europea: number;
    voltaje_mppt_min: number;
    voltaje_mppt_max: number;
    voltaje_max_entrada: number;
    corriente_max_entrada: number;
    numero_mppt: number;
    numero_entradas_por_mppt: number;
    tipo: string;
    fases: string;
    garantia_anios: number;
}

export interface ModeladoElectrico {
    paneles_serie: number;
    strings_paralelo: number;
    paneles_totales: number;
    paneles_originales: number;
    paneles_ajustados: number;
    voc_string_v: number;
    vmp_string_v: number;
    voc_frio_string_v: number;
    vmp_calor_string_v: number;
    isc_total_a: number;
    imp_total_a: number;
    isc_por_mppt_a: number;
    strings_por_mppt: number;
    corriente_dentro_limite: boolean;
    potencia_dc_kw: number;
    voc_dentro_limite: boolean;
    mppt_dentro_rango: boolean;
    temp_min_sitio_c: number;
    temp_max_celda_c: number;
    voltaje_mppt_min_v: number;
    voltaje_mppt_max_v: number;
    voltaje_max_entrada_v: number;
    compatible: boolean;
    resumen: string;
    error?: string;
    sugerencia?: string | null;
}