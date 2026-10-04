// Tarifas domésticas de CFE por bloques.
// Los precios cambian cada mes: actualízalos desde la tabla oficial de CFE.
// Solo está cargada la 1F. Para otra tarifa, agrega otra entrada en TARIFAS_CFE.

export const IVA = 0.16;

interface PreciosKwh {
    basico: number;
    intermedio: number;
    excedente: number;
}

interface Temporada {
    limiteBasicoKwh: number;
    limiteIntermedioKwh: number;
    precios: PreciosKwh | null;
}

interface ConfigTarifa {
    mesesVerano: number[];
    cargoMinimoKwhMes: number;
    verano: Temporada;
    fueraVerano: Temporada;
}

export const TARIFAS_CFE: Record<string, ConfigTarifa> = {
    '1F': {
        mesesVerano: [5, 6, 7, 8, 9, 10],
        cargoMinimoKwhMes: 25,
        fueraVerano: {
            limiteBasicoKwh: 75,
            limiteIntermedioKwh: 125,
            precios: { basico: 1.110, intermedio: 1.349, excedente: 3.944 }
        },
        verano: {
            limiteBasicoKwh: 300,
            limiteIntermedioKwh: 900,
            precios: null
        }
    }
};

export interface FacturaMensual {
    total: number;
    aviso?: string;
}

export const facturaMensual = (
    consumoKwh: number,
    tarifa: string,
    mes: number
): FacturaMensual | null => {
    const cfg = TARIFAS_CFE[String(tarifa ?? '').toUpperCase()];
    if (!cfg) return null;

    const temporada = cfg.mesesVerano.includes(mes) ? cfg.verano : cfg.fueraVerano;
    let precios = temporada.precios;
    let aviso: string | undefined;
    if (!precios) {
        precios = cfg.fueraVerano.precios as PreciosKwh;
        aviso = `Faltan los precios de verano de la tarifa ${tarifa}: se usaron los de fuera de verano y el ahorro de verano queda sobrestimado.`;
    }

    const kwh = Math.max(consumoKwh, 0);
    const basico = Math.min(kwh, temporada.limiteBasicoKwh);
    const intermedio = Math.min(
        Math.max(kwh - temporada.limiteBasicoKwh, 0),
        temporada.limiteIntermedioKwh
    );
    const excedente = Math.max(
        kwh - temporada.limiteBasicoKwh - temporada.limiteIntermedioKwh,
        0
    );

    const energia =
        basico * precios.basico +
        intermedio * precios.intermedio +
        excedente * precios.excedente;
    const minimo = cfg.cargoMinimoKwhMes * precios.basico;

    return { total: Math.max(energia, minimo) * (1 + IVA), aviso };
};

export interface AhorroAnual {
    facturaSinSolar: number;
    facturaConSolar: number;
    ahorroAnual: number;
    creditoFinalKwh: number;
    avisos: string[];
}

export const calculaAhorroAnual = (
    consumoMensualKwh: number[],
    produccionMensualKwh: number[],
    tarifa: string
): AhorroAnual | null => {
    let credito = 0;
    let facturaSinSolar = 0;
    let facturaConSolar = 0;
    const avisos = new Set<string>();

    for (let i = 0; i < 12; i++) {
        const mes = i + 1;
        const consumo = Number(consumoMensualKwh[i] ?? 0);
        const produccion = Number(produccionMensualKwh[i] ?? 0);

        const sinSolar = facturaMensual(consumo, tarifa, mes);
        if (!sinSolar) return null;
        if (sinSolar.aviso) avisos.add(sinSolar.aviso);

        let neto = consumo - produccion;
        if (neto < 0) {
            credito += -neto;
            neto = 0;
        } else if (credito > 0) {
            const usa = Math.min(credito, neto);
            neto -= usa;
            credito -= usa;
        }

        const conSolar = facturaMensual(neto, tarifa, mes);
        if (!conSolar) return null;

        facturaSinSolar += sinSolar.total;
        facturaConSolar += conSolar.total;
    }

    return {
        facturaSinSolar,
        facturaConSolar,
        ahorroAnual: facturaSinSolar - facturaConSolar,
        creditoFinalKwh: credito,
        avisos: [...avisos]
    };
};