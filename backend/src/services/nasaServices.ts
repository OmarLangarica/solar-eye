import type { 
    NasaPowerParams, 
    NasaPowerResultado, 
    NasaPowerResponse,
    OpenElevationResponse
} from '../types/typesNasa.js';

//Zona climática automática
const determinaZonaClimatica = (tempPromedio: number, irradiacion: number): string => {
    if (irradiacion >= 6.5 && tempPromedio >= 28) return 'árida-caliente';
    if (irradiacion >= 5.5 && tempPromedio >= 24) return 'seca-cálida';
    if (irradiacion >= 4.5 && tempPromedio >= 18) return 'templada-cálida';
    if (irradiacion >= 3.5 && tempPromedio >= 12) return 'templada-fría';
    return 'fría';
};

//Open Elevation 
const consultaAltitud = async (latitud: number, longitud: number): Promise<number> => {
    try {
        const url = `https://api.open-elevation.com/api/v1/lookup?locations=${latitud},${longitud}`;
        const respuesta = await fetch(url);

        if (!respuesta.ok) return 0;

        const data: OpenElevationResponse = await respuesta.json();
        return data.results[0]?.elevation ?? 0;
    } catch (err) {
        console.error('Error Open Elevation:', err);
        return 0;  // si falla no bloqueamos el flujo principal
    }
};

//NASA POWER
export const consultaNasaPower = async ({ latitud, longitud }: NasaPowerParams): Promise<NasaPowerResultado | { error: string }> => {
    try {
        const params = new URLSearchParams({
            parameters: 'ALLSKY_SFC_SW_DWN,T2M,T2M_MAX,T2M_MIN,WS2M',
            community: 'RE',
            longitude: longitud.toString(),
            latitude: latitud.toString(),
            format: 'JSON'
        });

        // Llamadas en paralelo para optimizar el tiempo de respuesta
        const [respuestaNasa, altitud] = await Promise.all([
            fetch(`https://power.larc.nasa.gov/api/temporal/climatology/point?${params}`),
            consultaAltitud(latitud, longitud)
        ]);

        if (!respuestaNasa.ok) {
            return { error: `NASA POWER respondió con status ${respuestaNasa.status}` };
        }

        const data: NasaPowerResponse = await respuestaNasa.json();
        const p = data.properties.parameter;

        const mesesVerano = ['MAY', 'JUN', 'JUL'];
        const mesesInvierno = ['DEC', 'JAN', 'FEB'];

        const tempMaxVerano = Math.max(...mesesVerano.map(m => p.T2M_MAX[m] ?? 0));
        const tempMinInvierno = Math.min(...mesesInvierno.map(m => p.T2M_MIN[m] ?? 0));

        const ghiAnual = p.ALLSKY_SFC_SW_DWN['ANN'] ?? 0;
        const tempPromedio = p.T2M['ANN'] ?? 0;

        return {
            irradiacion_diaria_promedio: ghiAnual,
            horas_sol_pico_diarias: ghiAnual,
            irradiacion_anual_kwh_m2: parseFloat((ghiAnual * 365).toFixed(2)),
            temperatura_promedio_anual: tempPromedio,
            temperatura_max_verano: tempMaxVerano,
            temperatura_min_invierno: tempMinInvierno,
            velocidad_viento_promedio: p.WS2M['ANN'] ?? 0,
            altitud_msnm: altitud,
            zona_climatica: determinaZonaClimatica(tempPromedio, ghiAnual),
            fuente_datos: 'NASA POWER + Open Elevation',
            fecha_consulta: new Date().toISOString().split('T')[0] ?? ''
        };

    } catch (err) {
        return { error: 'No se pudo conectar con la API de NASA POWER' };
    }
};