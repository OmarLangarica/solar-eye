export interface Simulacion {
    id: number;
    cliente_id: number;
    usuario_id: number;
    nombre_proyecto: string | null;
    descripcion: string | null;
    estado: 'borrador' | 'completada' | 'cotizada';
}

export type SimulacionNueva = Omit<Simulacion, 'id'>;

//Datos Techo
export interface DatosTecho {
    id: number;
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

export type DatosTechoNuevo = Omit<DatosTecho, 'id'>;

//Datos Geográficos
export interface DatosGeograficos {
    id: number;
    simulacion_id: number;
    irradiacion_anual_kwh_m2: number | null;
    irradiacion_diaria_promedio: number | null;
    horas_sol_pico_diarias: number | null;
    temperatura_promedio_anual: number | null;
    temperatura_max_verano: number | null;
    temperatura_min_invierno: number | null;
    velocidad_viento_promedio: number | null;
    altitud_msnm: number | null;
    zona_climatica: string | null;
    fuente_datos: string;
    fecha_consulta: string | null;
}

export type DatosGeograficosNuevo = Omit<DatosGeograficos, 'id'>;

//Consumo Eléctrico
export interface ConsumoElectrico {
    id: number;
    simulacion_id: number;
    consumo_mensual_kwh: number | null;
    consumo_anual_kwh: number | null;
    tarifa_kwh_mxn: number | null;
    costo_mensual_mxn: number | null;
    tipo_tarifa: string | null;
    numero_recibo: string | null;
    periodo_facturacion: string | null;
}

export type ConsumoElectricoNuevo = Omit<ConsumoElectrico, 'id'>;

//Configuración Sistema Solar
export interface ConfiguracionSistema {
    id: number;
    simulacion_id: number;
    marca_panel: string | null;
    modelo_panel: string | null;
    potencia_panel_wp: number | null;
    eficiencia_panel: number | null;
    cantidad_paneles: number | null;
    area_por_panel_m2: number;
    marca_inversor: string | null;
    modelo_inversor: string | null;
    potencia_inversor_kw: number | null;
    eficiencia_inversor: number;
    tipo_inversor: 'string' | 'microinversor' | 'hibrido';
    potencia_total_kwp: number | null;
    tipo_conexion: 'red' | 'aislado' | 'hibrido';
    incluye_bateria: boolean;
    capacidad_bateria_kwh: number | null;
    degradacion_anual_pct: number;
    vida_util_anios: number;
}

export type ConfiguracionSistemaNueva = Omit<ConfiguracionSistema, 'id'>;

//Resultados
export interface ResultadosCalculo {
    id: number;
    simulacion_id: number;
    produccion_anual_kwh: number | null;
    produccion_mensual_promedio_kwh: number | null;
    porcentaje_cobertura: number | null;
    excedente_kwh: number | null;
    ahorro_mensual_mxn: number | null;
    ahorro_anual_mxn: number | null;
    ahorro_vida_util_mxn: number | null;
    costo_total_instalacion_mxn: number | null;
    retorno_inversion_anios: number | null;
    co2_evitado_anual_kg: number | null;
    co2_evitado_vida_util_kg: number | null;
    arboles_equivalentes: number | null;
    precio_kwh_proyectado_anio5: number | null;
    precio_kwh_proyectado_anio10: number | null;
    tasa_incremento_tarifa_pct: number;
}

export type ResultadosCalculoNuevo = Omit<ResultadosCalculo, 'id'>;