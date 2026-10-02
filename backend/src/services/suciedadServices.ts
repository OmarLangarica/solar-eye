/**
 * Pérdidas por suciedad (soiling) en paneles solares.
 *
 * Dos modelos, y el resultado SIEMPRE indica cuál se usó (campo modeloUsado):
 *
 * 1) 'HSU'  (preferido) — modelo de Humboldt State University,
 *    Coello & Boyle (2019), IEEE Journal of Photovoltaics, el mismo que usa pvlib.
 *    Necesita concentración diaria de partículas PM2.5 y PM10 (µg/m³) y lluvia.
 *      masa acumulada (g/m²) = suma diaria de (PM2.5·v2.5 + max(PM10−PM2.5, 0)·v10)·86400·cos(inclinación)
 *      pérdida = 0.3437 · erf( 0.17 · masa^0.8473 )     (máximo ≈ 34.4 %)
 *    La lluvia suficiente reinicia la masa a 0.
 *
 * 2) 'TASA_POR_NIVEL' (respaldo, sin datos de partículas) — pérdida que crece a
 *    una tasa diaria constante, con tope, y se reinicia con lluvia (estilo modelo
 *    Kimber de pvlib: 0.15 %/día, tope 30 %, lluvia de 6 mm). La tasa depende de un
 *    nivel de polvo (bajo/medio/alto) y es una REFERENCIA de zona, no una medición.
 *
 * Todo resultado es una ESTIMACIÓN. Calibrar con mediciones reales antes de
 * presentarlo como dato firme.
 */

export type NivelPolvo = 'bajo' | 'medio' | 'alto';
export type ModeloSuciedad = 'HSU' | 'TASA_POR_NIVEL';

/**
 * Pérdida diaria (fracción) del modelo de respaldo.
 * 'medio' = valor por defecto de Kimber en pvlib. El rango de la literatura para
 * clima seco es ~0.04 %/día a ~0.5 %/día (estudio en Chipre).
 */
export const TASA_DIARIA_POR_NIVEL: Record<NivelPolvo, number> = {
    bajo: 0.0005,
    medio: 0.0015,
    alto: 0.003
};

/** Velocidades de depósito por defecto de pvlib (m/s). */
export const VELOCIDAD_DEPOSITO_HSU = { pm25: 0.0009, pm10: 0.004 };

const DIAS_POR_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const DIAS_POR_MES_BISIESTO = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const DIAS_ANIO = 365;
const PERDIDA_MAX_HSU = 0.3437;

/** Función de error (serie de Taylor; precisión ~1e-12 en el rango usado). */
export const erf = (x: number): number => {
    const signo = x < 0 ? -1 : 1;
    const a = Math.abs(x);
    if (a > 5) return signo;
    let suma = 0;
    let termino = a;
    for (let n = 0; n < 80; n++) {
        suma += termino / (2 * n + 1);
        termino *= -(a * a) / (n + 1);
    }
    return signo * (2 / Math.sqrt(Math.PI)) * suma;
};

/** Pérdida (fracción) del modelo HSU para una masa acumulada ω en g/m². */
export const perdidaHSU = (masaGm2: number): number =>
    PERDIDA_MAX_HSU * erf(0.17 * Math.pow(Math.max(masaGm2, 0), 0.8473));

export interface ParametrosSuciedad {
    /** Lluvia diaria en mm, del 1 de enero al 31 de diciembre (mínimo 365 valores). */
    lluviaDiariaMm: number[];

    /* ---- Modelo HSU: si se dan ambas series de partículas, se usa HSU ---- */
    /** PM2.5 diario en µg/m³ (mínimo 365 valores). */
    pm25Diario?: number[];
    /** PM10 diario en µg/m³ (mínimo 365 valores). */
    pm10Diario?: number[];
    /** Inclinación del panel en grados desde la horizontal (por defecto 20). */
    inclinacionGrados?: number;
    velocidadDeposito?: { pm25: number; pm10: number };

    /* ---- Modelo de respaldo ---- */
    nivelPolvo?: NivelPolvo;
    /** Sustituye a la tasa del nivel de polvo (fracción por día). */
    tasaDiaria?: number;
    /** Tope de pérdida del modelo de respaldo (fracción, por defecto 0.30). */
    perdidaMaxima?: number;

    /* ---- Comunes ---- */
    /** Lluvia (mm en un día) que limpia el panel por completo. Por defecto 6. */
    umbralLluviaMm?: number;
    /** Limpieza manual cada N días. null o 0 = sin limpieza manual. */
    diasEntreLimpiezas?: number | null;
}

export interface ResultadoSimulacion {
    modeloUsado: ModeloSuciedad;
    /** Pérdida de cada día (fracción). */
    perdidaDiaria: number[];
    /** Pérdida promedio de cada mes (fracción). */
    perdidaMensual: number[];
    /** Número de limpiezas manuales en el año. */
    limpiezasManuales: number;
}

const tomaAnio = (serie: number[], nombre: string, dias: number = DIAS_ANIO): number[] => {
    if (!Array.isArray(serie) || serie.length < dias) {
        throw new Error(`${nombre}: se necesitan al menos ${dias} valores diarios`);
    }
    return serie.slice(0, dias);
};

/** Lluvia: los datos faltantes (NASA usa -999) se toman como 0 mm, que es lo más conservador. */
const normalizaLluvia = (lluvia: number[]): number[] =>
    tomaAnio(lluvia, 'lluviaDiariaMm', lluvia.length >= 366 ? 366 : DIAS_ANIO)
        .map((mm) => (Number.isFinite(mm) && mm > 0 ? mm : 0));

/** Partículas: los datos faltantes se reemplazan por el promedio de los válidos. */
const normalizaParticulas = (serie: number[], nombre: string, dias: number): number[] => {
    const anio = tomaAnio(serie, nombre, dias);
    const validos = anio.filter((v) => Number.isFinite(v) && v >= 0);
    if (validos.length === 0) throw new Error(`${nombre}: no hay valores válidos`);
    const promedio = validos.reduce((a, b) => a + b, 0) / validos.length;
    return anio.map((v) => (Number.isFinite(v) && v >= 0 ? v : promedio));
};

const promediosMensuales = (perdidaDiaria: number[], esBisiesto: boolean): number[] => {
    const meses: number[] = [];
    let inicio = 0;
    for (const dias of esBisiesto ? DIAS_POR_MES_BISIESTO : DIAS_POR_MES) {
        const tramo = perdidaDiaria.slice(inicio, inicio + dias);
        meses.push(tramo.reduce((a, b) => a + b, 0) / dias);
        inicio += dias;
    }
    return meses;
};

export const simularSuciedad = (params: ParametrosSuciedad): ResultadoSimulacion => {
    const lluvia = normalizaLluvia(params.lluviaDiariaMm);
    const diasAnio = lluvia.length;
    const umbral = params.umbralLluviaMm ?? 6;
    const cadaN = params.diasEntreLimpiezas && params.diasEntreLimpiezas > 0
        ? Math.floor(params.diasEntreLimpiezas)
        : 0;

    const hayPm25 = Array.isArray(params.pm25Diario);
    const hayPm10 = Array.isArray(params.pm10Diario);
    if (hayPm25 !== hayPm10) {
        throw new Error('Para el modelo HSU se necesitan pm25Diario y pm10Diario juntos');
    }
    const usaHSU = hayPm25 && hayPm10;

    let pm25: number[] = [];
    let pm10: number[] = [];
    let masaPorDia: number[] = [];
    if (usaHSU) {
        pm25 = normalizaParticulas(params.pm25Diario!, 'pm25Diario', diasAnio);
        pm10 = normalizaParticulas(params.pm10Diario!, 'pm10Diario', diasAnio);
        const v = params.velocidadDeposito ?? VELOCIDAD_DEPOSITO_HSU;
        const inclinacion = ((params.inclinacionGrados ?? 20) * Math.PI) / 180;
        // µg/m³ → g/m³ (×1e-6); m/s → por día (×86400)
        masaPorDia = pm25.map((p25, d) => {
            const p10 = pm10[d] ?? p25;
            const tasa = (p25 * 1e-6 * v.pm25 + Math.max(p10 - p25, 0) * 1e-6 * v.pm10) * 86400;
            return tasa * Math.cos(inclinacion);
        });
    }

    const tasaRespaldo = params.tasaDiaria ?? TASA_DIARIA_POR_NIVEL[params.nivelPolvo ?? 'medio'];
    const maximaRespaldo = params.perdidaMaxima ?? 0.3;

    const perdidaDiaria: number[] = [];
    let masa = 0;      // g/m² (HSU)
    let perdida = 0;   // fracción (respaldo)
    let limpiezasManuales = 0;

    for (let dia = 0; dia < diasAnio; dia++) {
        if (usaHSU) {
            masa += masaPorDia[dia] ?? 0;
        } else {
            perdida = Math.min(maximaRespaldo, perdida + tasaRespaldo);
        }

        if ((lluvia[dia] ?? 0) >= umbral) {
            masa = 0;
            perdida = 0;
        }

        if (cadaN > 0 && (dia + 1) % cadaN === 0) {
            masa = 0;
            perdida = 0;
            limpiezasManuales++;
        }

        perdidaDiaria.push(usaHSU ? perdidaHSU(masa) : perdida);
    }

    return {
        modeloUsado: usaHSU ? 'HSU' : 'TASA_POR_NIVEL',
        perdidaDiaria,
        perdidaMensual: promediosMensuales(perdidaDiaria, diasAnio === 366),
        limpiezasManuales
    };
};

export interface ParametrosEscenario extends ParametrosSuciedad {
    /** Producción mensual sin suciedad, en kWh (12 valores, enero a diciembre). */
    produccionMensualKwh: number[];
    /** Precio de la energía en MXN por kWh. */
    tarifaKwh: number;
    /** Costo de UNA limpieza de todo el sistema, en MXN. */
    costoLimpieza: number;
}

export interface ResultadoEscenario {
    modeloUsado: ModeloSuciedad;
    diasEntreLimpiezas: number | null;
    limpiezasManuales: number;
    perdidaMensual: number[];
    /** Pérdida anual ponderada por la producción (fracción). */
    perdidaAnual: number;
    produccionRealMensualKwh: number[];
    energiaPerdidaKwh: number;
    dineroPerdidoMxn: number;
    costoLimpiezaAnualMxn: number;
    /** Dinero perdido por suciedad + costo de las limpiezas. */
    costoTotalMxn: number;
}

export const calcularEscenario = (params: ParametrosEscenario): ResultadoEscenario => {
    if (params.produccionMensualKwh.length !== 12) {
        throw new Error('produccionMensualKwh debe tener 12 valores');
    }

    const sim = simularSuciedad(params);
    const produccionIdeal = params.produccionMensualKwh.reduce((a, b) => a + b, 0);

    const produccionRealMensualKwh = params.produccionMensualKwh.map(
        (kwh, mes) => kwh * (1 - (sim.perdidaMensual[mes] ?? 0))
    );
    const produccionReal = produccionRealMensualKwh.reduce((a, b) => a + b, 0);

    const energiaPerdidaKwh = produccionIdeal - produccionReal;
    const dineroPerdidoMxn = energiaPerdidaKwh * params.tarifaKwh;
    const costoLimpiezaAnualMxn = sim.limpiezasManuales * params.costoLimpieza;

    return {
        modeloUsado: sim.modeloUsado,
        diasEntreLimpiezas: params.diasEntreLimpiezas && params.diasEntreLimpiezas > 0
            ? params.diasEntreLimpiezas
            : null,
        limpiezasManuales: sim.limpiezasManuales,
        perdidaMensual: sim.perdidaMensual,
        perdidaAnual: produccionIdeal > 0 ? energiaPerdidaKwh / produccionIdeal : 0,
        produccionRealMensualKwh,
        energiaPerdidaKwh,
        dineroPerdidoMxn,
        costoLimpiezaAnualMxn,
        costoTotalMxn: dineroPerdidoMxn + costoLimpiezaAnualMxn
    };
};

export interface ComparacionLimpieza {
    escenarios: ResultadoEscenario[];
    /** Escenario con menor costo total (pérdida + limpiezas). */
    optimo: ResultadoEscenario;
    /** Escenario sin limpieza manual (solo lluvia). */
    sinLimpieza: ResultadoEscenario;
}

/** Frecuencias que se prueban por defecto (días entre limpiezas). null = sin limpieza. */
export const FRECUENCIAS_POR_DEFECTO: Array<number | null> = [null, 120, 90, 60, 45, 30, 21, 14];

export const compararLimpiezas = (
    params: Omit<ParametrosEscenario, 'diasEntreLimpiezas'>,
    frecuencias: Array<number | null> = FRECUENCIAS_POR_DEFECTO
): ComparacionLimpieza => {
    const escenarios = frecuencias.map((dias) =>
        calcularEscenario({ ...params, diasEntreLimpiezas: dias })
    );

    const optimo = escenarios.reduce((mejor, actual) =>
        actual.costoTotalMxn < mejor.costoTotalMxn ? actual : mejor
    );
    const sinLimpieza = escenarios.find((e) => e.diasEntreLimpiezas === null) ?? escenarios[0]!;

    return { escenarios, optimo, sinLimpieza };
};

/**
 * Aproximación rápida (pérdida lineal, sin lluvia): T = raiz(2·C / (r·V)).
 *  - costoLimpieza (C): MXN por limpieza
 *  - tasaDiaria (r): fracción de pérdida por día
 *  - valorEnergiaDiariaMxn (V): MXN de energía que produce el sistema limpio en un día
 */
export const intervaloOptimoSinLluvia = (
    costoLimpieza: number,
    tasaDiaria: number,
    valorEnergiaDiariaMxn: number
): number => {
    if (costoLimpieza <= 0 || tasaDiaria <= 0 || valorEnergiaDiariaMxn <= 0) return Infinity;
    return Math.sqrt((2 * costoLimpieza) / (tasaDiaria * valorEnergiaDiariaMxn));
};