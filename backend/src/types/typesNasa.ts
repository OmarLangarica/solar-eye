export interface NasaPowerParams {
    latitud: number;
    longitud: number;
}

export interface NasaPowerResultado {
    irradiacion_anual_kwh_m2: number;
    irradiacion_diaria_promedio: number;
    horas_sol_pico_diarias: number;
    temperatura_promedio_anual: number;
    temperatura_max_verano: number;
    temperatura_min_invierno: number;
    velocidad_viento_promedio: number;
    altitud_msnm: number;           // ← ahora viene incluida
    zona_climatica: string;         // ← ahora viene incluida
    fuente_datos: string;
    fecha_consulta: string;
}

export interface NasaPowerResponse {
    properties: {
        parameter: {
            ALLSKY_SFC_SW_DWN: Record<string, number | undefined>;
            T2M: Record<string, number | undefined>;
            T2M_MAX: Record<string, number | undefined>;
            T2M_MIN: Record<string, number | undefined>;
            WS2M: Record<string, number | undefined>;
        };
    };
}

export interface OpenElevationResponse {
    results: {
        latitude: number;
        longitude: number;
        elevation: number;
    }[];
}