interface RespuestaPrecipitacionDiaria {
    properties?: {
        parameter?: {
            PRECTOTCORR?: Record<string, number>;
        };
    };
}

const validaFecha = (fecha: string): boolean => {
    if (!/^\d{8}$/.test(fecha)) return false;
    const anio = Number(fecha.slice(0, 4));
    const mes = Number(fecha.slice(4, 6));
    const dia = Number(fecha.slice(6, 8));
    const fechaUtc = new Date(Date.UTC(anio, mes - 1, dia));
    return fechaUtc.getUTCFullYear() === anio
        && fechaUtc.getUTCMonth() === mes - 1
        && fechaUtc.getUTCDate() === dia;
};

const generaFechas = (inicio: string, fin: string): string[] => {
    const fechas: string[] = [];
    const actual = new Date(Date.UTC(
        Number(inicio.slice(0, 4)),
        Number(inicio.slice(4, 6)) - 1,
        Number(inicio.slice(6, 8))
    ));
    const ultima = new Date(Date.UTC(
        Number(fin.slice(0, 4)),
        Number(fin.slice(4, 6)) - 1,
        Number(fin.slice(6, 8))
    ));

    while (actual <= ultima) {
        const anio = actual.getUTCFullYear();
        const mes = String(actual.getUTCMonth() + 1).padStart(2, '0');
        const dia = String(actual.getUTCDate()).padStart(2, '0');
        fechas.push(`${anio}${mes}${dia}`);
        actual.setUTCDate(actual.getUTCDate() + 1);
    }

    return fechas;
};

export const obtienePrecipitacionDiaria = async (
    latitud: number,
    longitud: number,
    inicio: string,
    fin: string
): Promise<number[]> => {
    if (!Number.isFinite(latitud) || latitud < -90 || latitud > 90) {
        throw new Error('La latitud debe estar entre -90 y 90');
    }
    if (!Number.isFinite(longitud) || longitud < -180 || longitud > 180) {
        throw new Error('La longitud debe estar entre -180 y 180');
    }
    if (!validaFecha(inicio) || !validaFecha(fin) || inicio > fin) {
        throw new Error('El rango de fechas debe usar YYYYMMDD y ser válido');
    }

    const params = new URLSearchParams({
        parameters: 'PRECTOTCORR',
        community: 'AG',
        longitude: String(longitud),
        latitude: String(latitud),
        start: inicio,
        end: fin,
        format: 'JSON'
    });

    const respuesta = await fetch(`https://power.larc.nasa.gov/api/temporal/daily/point?${params}`);
    if (!respuesta.ok) {
        throw new Error(`NASA POWER respondió con status ${respuesta.status}`);
    }

    const data = await respuesta.json() as RespuestaPrecipitacionDiaria;
    const precipitacion = data.properties?.parameter?.PRECTOTCORR;
    if (!precipitacion) {
        throw new Error('NASA POWER no devolvió la serie PRECTOTCORR');
    }

    return generaFechas(inicio, fin).map((fecha) => {
        const valor = Number(precipitacion[fecha]);
        return Number.isFinite(valor) && valor >= 0 ? valor : 0;
    });
};