import { z } from 'zod';

export const simulacionSchema = z.object({
    cliente_id: z.number().int().positive(),
    usuario_id: z.number().int().positive(),
    nombre_proyecto: z.string().max(150).nullable().optional(),
    descripcion: z.string().nullable().optional(),
    estado: z.enum(['borrador', 'completada', 'cotizada']).default('borrador')
});

export const simulacionActualizarSchema = simulacionSchema.extend({
    id: z.number().int().positive()
});

//Datos Techo
export const datosTechoSchema = z.object({
    simulacion_id: z.number().int().positive(),
    geojson: z.string().min(1),
    area_m2: z.number().positive(),
    perimetro_m: z.number().positive().nullable().optional(),
    latitud: z.number().min(-90).max(90),
    longitud: z.number().min(-180).max(180),
    tipo_techo: z.enum(['plano', 'inclinado', 'mixto']).default('inclinado'),
    angulo_inclinacion_deg: z.number().min(0).max(90).default(15),
    azimut_deg: z.number().min(0).max(360).nullable().optional(),
    factor_sombra: z.number().min(0).max(1).default(1),
    area_util_m2: z.number().positive().nullable().optional()
});

export const datosTechoActualizarSchema = datosTechoSchema.extend({
    id: z.number().int().positive()
});

//Datos Geográficos
export const datosGeograficosSchema = z.object({
    simulacion_id: z.number().int().positive(),
    irradiacion_anual_kwh_m2: z.number().nullable().optional(),
    irradiacion_diaria_promedio: z.number().nullable().optional(),
    horas_sol_pico_diarias: z.number().nullable().optional(),
    temperatura_promedio_anual: z.number().nullable().optional(),
    temperatura_max_verano: z.number().nullable().optional(),
    temperatura_min_invierno: z.number().nullable().optional(),
    velocidad_viento_promedio: z.number().nullable().optional(),
    altitud_msnm: z.number().nullable().optional(),
    zona_climatica: z.string().max(50).nullable().optional(),
    fuente_datos: z.string().max(100).default('NASA POWER'),
    fecha_consulta: z.string().nullable().optional()
});

export const datosGeograficosActualizarSchema = datosGeograficosSchema.extend({
    id: z.number().int().positive()
});

//Consumo Eléctrico
export const consumoElectricoSchema = z.object({
    simulacion_id: z.number().int().positive(),
    consumo_mensual_kwh: z.number().positive().nullable().optional(),
    consumo_anual_kwh: z.number().positive().nullable().optional(),
    tarifa_kwh_mxn: z.number().positive().nullable().optional(),
    costo_mensual_mxn: z.number().positive().nullable().optional(),
    tipo_tarifa: z.string().max(20).nullable().optional(),
    numero_recibo: z.string().max(50).nullable().optional(),
    periodo_facturacion: z.string().max(50).nullable().optional()
});

export const consumoElectricoActualizarSchema = consumoElectricoSchema.extend({
    id: z.number().int().positive()
});

//Configuración Sistema Solar
export const configuracionSistemaSchema = z.object({
    simulacion_id: z.number().int().positive(),
    marca_panel: z.string().max(100).nullable().optional(),
    modelo_panel: z.string().max(100).nullable().optional(),
    potencia_panel_wp: z.number().int().positive().nullable().optional(),
    eficiencia_panel: z.number().min(0).max(100).nullable().optional(),
    cantidad_paneles: z.number().int().positive().nullable().optional(),
    area_por_panel_m2: z.number().positive().default(1.96),
    marca_inversor: z.string().max(100).nullable().optional(),
    modelo_inversor: z.string().max(100).nullable().optional(),
    potencia_inversor_kw: z.number().positive().nullable().optional(),
    eficiencia_inversor: z.number().min(0).max(100).default(97),
    tipo_inversor: z.enum(['string', 'microinversor', 'hibrido']).default('string'),
    potencia_total_kwp: z.number().positive().nullable().optional(),
    tipo_conexion: z.enum(['red', 'aislado', 'hibrido']).default('red'),
    incluye_bateria: z.boolean().default(false),
    capacidad_bateria_kwh: z.number().positive().nullable().optional(),
    degradacion_anual_pct: z.number().min(0).max(100).default(0.5),
    vida_util_anios: z.number().int().positive().default(25)
});

export const configuracionSistemaActualizarSchema = configuracionSistemaSchema.extend({
    id: z.number().int().positive()
});

//Resultados
export const resultadosCalculoSchema = z.object({
    simulacion_id: z.number().int().positive(),
    produccion_anual_kwh: z.number().nullable().optional(),
    produccion_mensual_promedio_kwh: z.number().nullable().optional(),
    porcentaje_cobertura: z.number().min(0).max(100).nullable().optional(),
    excedente_kwh: z.number().nullable().optional(),
    ahorro_mensual_mxn: z.number().nullable().optional(),
    ahorro_anual_mxn: z.number().nullable().optional(),
    ahorro_vida_util_mxn: z.number().nullable().optional(),
    costo_total_instalacion_mxn: z.number().nullable().optional(),
    retorno_inversion_anios: z.number().nullable().optional(),
    co2_evitado_anual_kg: z.number().nullable().optional(),
    co2_evitado_vida_util_kg: z.number().nullable().optional(),
    arboles_equivalentes: z.number().int().nullable().optional(),
    precio_kwh_proyectado_anio5: z.number().nullable().optional(),
    precio_kwh_proyectado_anio10: z.number().nullable().optional(),
    tasa_incremento_tarifa_pct: z.number().min(0).default(5)
});

export const resultadosCalculoActualizarSchema = resultadosCalculoSchema.extend({
    id: z.number().int().positive()
});