interface RespuestaCalidadAire {
    hourly?: {
        time?: string[];
        pm2_5?: Array<number | null>;
        pm10?: Array<number | null>;
    };
    error?: boolean;
    reason?: string;
}

export interface ParticulasDiarias {
    pm25Diario: number[];
    pm10Diario: number[];
    fuenteDatos: string;
}

const fechasIncluidas = (inicio: string, fin: string): string[] => {
    const fechaActual = new Date(Date.UTC(
        Number(inicio.slice(0, 4)),
        Number(inicio.slice(4, 6)) - 1,
        Number(inicio.slice(6, 8))
    ));
    const fechaFinal = new Date(Date.UTC(
        Number(fin.slice(0, 4)),
        Number(fin.slice(4, 6)) - 1,
        Number(fin.slice(6, 8))
    ));
    const fechas: string[] = [];

    while (fechaActual <= fechaFinal) {
        fechas.push(fechaActual.toISOString().slice(0, 10));
        fechaActual.setUTCDate(fechaActual.getUTCDate() + 1);
    }

    return fechas;
};

export const obtieneParticulasDiarias = async (
    latitud: number,
    longitud: number,
    inicio: string,
    fin: string
): Promise<ParticulasDiarias> => {
    const apiKey = process.env.OPEN_METEO_API_KEY?.trim();
    const endpoint = apiKey
        ? 'https://customer-api.open-meteo.com/v1/air-quality'
        : 'https://air-quality-api.open-meteo.com/v1/air-quality';
    const params = new URLSearchParams({
        latitude: String(latitud),
        longitude: String(longitud),
        hourly: 'pm2_5,pm10',
        start_date: `${inicio.slice(0, 4)}-${inicio.slice(4, 6)}-${inicio.slice(6, 8)}`,
        end_date: `${fin.slice(0, 4)}-${fin.slice(4, 6)}-${fin.slice(6, 8)}`,
        timezone: 'GMT',
        domains: 'cams_global'
    });
    if (apiKey) params.set('apikey', apiKey);

    const respuesta = await fetch(`${endpoint}?${params}`, { signal: AbortSignal.timeout(20_000) });
    if (!respuesta.ok) {
        throw new Error(`Open-Meteo respondió con status ${respuesta.status}`);
    }

    const data = await respuesta.json() as RespuestaCalidadAire;
    const hourly = data.hourly;
    if (data.error || !hourly?.time || !hourly.pm2_5 || !hourly.pm10) {
        throw new Error(data.reason ?? 'Open-Meteo no devolvió las series PM2.5 y PM10');
    }

    const dias = new Map(fechasIncluidas(inicio, fin).map((fecha) => [fecha, {
        pm25Suma: 0,
        pm25Muestras: 0,
        pm10Suma: 0,
        pm10Muestras: 0
    }]));

    for (let indice = 0; indice < hourly.time.length; indice++) {
        const dia = dias.get(hourly.time[indice]?.slice(0, 10) ?? '');
        if (!dia) continue;

        const pm25 = hourly.pm2_5[indice];
        if (typeof pm25 === 'number' && Number.isFinite(pm25) && pm25 >= 0) {
            dia.pm25Suma += pm25;
            dia.pm25Muestras++;
        }

        const pm10 = hourly.pm10[indice];
        if (typeof pm10 === 'number' && Number.isFinite(pm10) && pm10 >= 0) {
            dia.pm10Suma += pm10;
            dia.pm10Muestras++;
        }
    }

    const diasOrdenados = [...dias.values()];
    const pm25Diario = diasOrdenados.map((dia) =>
        dia.pm25Muestras > 0 ? dia.pm25Suma / dia.pm25Muestras : Number.NaN
    );
    const pm10Diario = diasOrdenados.map((dia) =>
        dia.pm10Muestras > 0 ? dia.pm10Suma / dia.pm10Muestras : Number.NaN
    );

    if (!pm25Diario.some(Number.isFinite) || !pm10Diario.some(Number.isFinite)) {
        throw new Error('Open-Meteo no devolvió concentraciones diarias válidas');
    }

    return {
        pm25Diario,
        pm10Diario,
        fuenteDatos: 'CAMS Global vía Open-Meteo'
    };
};