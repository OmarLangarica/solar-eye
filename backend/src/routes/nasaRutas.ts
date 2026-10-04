import express from 'express';
import type { Request, Response } from 'express';
import { consultaNasaPower } from '../services/nasaServices.js';
import { obtienePrecipitacionDiaria } from '../services/nasaPowerService.js';
import { obtieneParticulasDiarias } from '../services/airQualityService.js';
import { calcularEscenario, compararLimpiezas, simularSuciedad } from '../services/suciedadServices.js';

interface ProduccionMensualEntrada {
    mes?: string;
    numero_mes?: number;
    produccion_kwh: number;
    irradiancia_poa_kwh_m2?: number;
    temp_celda_promedio_c?: number;
}

const generaFechasLimpieza = (intervaloDias: number | null): string[] => {
    if (!intervaloDias || intervaloDias <= 0) return [];

    const fechaInicial = new Date();
    const fechaLimite = new Date(fechaInicial);
    fechaLimite.setUTCFullYear(fechaLimite.getUTCFullYear() + 1);
    fechaInicial.setUTCDate(fechaInicial.getUTCDate() + intervaloDias);
    const fechas: string[] = [];

    while (fechaInicial <= fechaLimite) {
        fechas.push(fechaInicial.toISOString().slice(0, 10));
        fechaInicial.setUTCDate(fechaInicial.getUTCDate() + intervaloDias);
    }

    return fechas;
};

const router = express.Router();

// POST http://localhost:3001/api/nasa
// Body: { latitud: 20.6597, longitud: -103.3496 }
router.post('/', async (req: Request, res: Response) => {
    try {
        const { latitud, longitud } = req.body;

        if (!latitud || !longitud) {
            res.status(400).json({ mensaje: 'Se requieren latitud y longitud' });
            return;
        }

        const datos = await consultaNasaPower({ latitud, longitud });
        res.status(200).send(datos);

    } catch (err) {
        res.status(500).json({ mensaje: 'Error al consultar NASA POWER' });
    }
});

router.post('/suciedad', async (req: Request, res: Response) => {
    try {
        const {
            latitud,
            longitud,
            inicio,
            fin,
            inclinacionGrados,
            tarifaKwh,
            produccionMensual,
            costoLimpiezaMxn
        } = req.body as {
            latitud: number;
            longitud: number;
            inicio: string;
            fin: string;
            inclinacionGrados: number;
            tarifaKwh: number;
            produccionMensual: ProduccionMensualEntrada[];
            costoLimpiezaMxn?: number;
        };

        if (!Array.isArray(produccionMensual) || produccionMensual.length !== 12
            || produccionMensual.some((mes) => !Number.isFinite(Number(mes.produccion_kwh)) || Number(mes.produccion_kwh) < 0)
            || !Number.isFinite(Number(inclinacionGrados)) || inclinacionGrados < 0 || inclinacionGrados > 90
            || !Number.isFinite(Number(tarifaKwh)) || tarifaKwh < 0
            || (costoLimpiezaMxn !== undefined && (!Number.isFinite(Number(costoLimpiezaMxn)) || costoLimpiezaMxn < 0))) {
            res.status(400).json({ mensaje: 'Los datos de producción, inclinación, tarifa o limpieza no son válidos' });
            return;
        }

        const [lluviaDiariaMm, particulas] = await Promise.all([
            obtienePrecipitacionDiaria(Number(latitud), Number(longitud), inicio, fin),
            obtieneParticulasDiarias(Number(latitud), Number(longitud), inicio, fin)
                .catch((error: unknown) => {
                    console.warn('No se obtuvieron datos de partículas CAMS; se usará el modelo de respaldo:', error);
                    return null;
                })
        ]);
        if (lluviaDiariaMm.length !== 365 && lluviaDiariaMm.length !== 366) {
            res.status(400).json({ mensaje: 'NASA POWER debe devolver un año completo de precipitación diaria' });
            return;
        }

        const parametrosSuciedad = {
            lluviaDiariaMm,
            inclinacionGrados: Number(inclinacionGrados),
            nivelPolvo: 'medio' as const,
            ...(particulas ? {
                pm25Diario: particulas.pm25Diario,
                pm10Diario: particulas.pm10Diario
            } : {})
        };
        const serieBase = simularSuciedad(parametrosSuciedad);
        const parametrosEscenario = {
            ...parametrosSuciedad,
            produccionMensualKwh: produccionMensual.map((mes) => Number(mes.produccion_kwh)),
            tarifaKwh: Number(tarifaKwh),
            costoLimpieza: costoLimpiezaMxn === undefined ? 300 : Number(costoLimpiezaMxn)
        };
        const comparacion = compararLimpiezas(parametrosEscenario);
        const escenarioSinLimpieza = calcularEscenario({
            ...parametrosEscenario,
            diasEntreLimpiezas: null
        });
        const mantenimiento = calcularEscenario({
            ...parametrosEscenario,
            diasEntreLimpiezas: comparacion.optimo.diasEntreLimpiezas
        });
        const ahorroNeto = Math.max(0, escenarioSinLimpieza.costoTotalMxn - mantenimiento.costoTotalMxn);

        const produccionMensualDetalle = produccionMensual.map((mes, indice) => {
            const ideal = Number(mes.produccion_kwh);
            const real = mantenimiento.produccionRealMensualKwh[indice] ?? ideal;
            return {
                ...mes,
                numero_mes: mes.numero_mes ?? indice + 1,
                produccion_kwh: ideal,
                produccion_ideal_kwh: ideal,
                produccion_real_kwh: Number(real.toFixed(2)),
                perdida_suciedad_pct: ideal > 0 ? Number(((ideal - real) / ideal * 100).toFixed(2)) : 0
            };
        });

        res.status(200).json({
            suciedad_pct_anual: Number((mantenimiento.perdidaAnual * 100).toFixed(2)),
            modelo_usado: serieBase.modeloUsado,
            fuente_datos_suciedad: particulas?.fuenteDatos ?? 'Tasa de referencia (sin datos PM)',
            perdida_kwh_anual: Number(mantenimiento.energiaPerdidaKwh.toFixed(2)),
            perdida_mxn_anual: Number(mantenimiento.dineroPerdidoMxn.toFixed(2)),
            mantenimiento_optimo: {
                intervalo_dias: mantenimiento.diasEntreLimpiezas,
                fechas_limpieza_recomendadas: generaFechasLimpieza(mantenimiento.diasEntreLimpiezas),
                limpiezas_anuales: mantenimiento.limpiezasManuales,
                costo_limpieza_por_visita_mxn: parametrosEscenario.costoLimpieza,
                costo_anual_limpiezas_mxn: Number(mantenimiento.costoLimpiezaAnualMxn.toFixed(2)),
                ahorro_neto_mxn: Number(ahorroNeto.toFixed(2)),
                escenarios: comparacion.escenarios.map((escenario) => ({
                    intervalo_dias: escenario.diasEntreLimpiezas,
                    limpiezas_anuales: escenario.limpiezasManuales,
                    suciedad_pct_anual: Number((escenario.perdidaAnual * 100).toFixed(2)),
                    costo_perdida_mxn: Number(escenario.dineroPerdidoMxn.toFixed(2)),
                    costo_anual_limpiezas_mxn: Number(escenario.costoLimpiezaAnualMxn.toFixed(2)),
                    costo_total_mxn: Number(escenario.costoTotalMxn.toFixed(2)),
                    ahorro_neto_mxn: Number((escenarioSinLimpieza.costoTotalMxn - escenario.costoTotalMxn).toFixed(2))
                }))
            },
            produccion_mensual_detalle: produccionMensualDetalle
        });
    } catch (err) {
        console.error('Error al calcular suciedad con datos climáticos:', err);
        res.status(502).json({ mensaje: 'No se pudo calcular la suciedad con datos diarios de NASA POWER' });
    }
});

export default router;