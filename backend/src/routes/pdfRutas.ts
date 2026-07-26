import { Router } from 'express';
import type { Request, Response } from 'express';
import { generaReportePDF } from '../services/pdfServices.js';
import conexion from '../db/conexion.js';

const router = Router();

router.get('/:simulacion_id', async (req: Request, res: Response) => {
    try {
        const simulacion_id = Number(req.params.simulacion_id);

        const [
            simRows, clienteRows, techoRows,
            consumoRows, resultadosRows, empresaRows
        ] = await Promise.all([
            conexion.query('SELECT s.*, u.nombre AS usuario_nombre FROM simulaciones s LEFT JOIN usuarios u ON s.usuario_id = u.id WHERE s.id = ? LIMIT 1', [simulacion_id]),
            conexion.query('SELECT c.* FROM simulaciones s JOIN clientes c ON s.cliente_id = c.id WHERE s.id = ? LIMIT 1', [simulacion_id]),
            conexion.query('SELECT * FROM datos_techo WHERE simulacion_id = ? LIMIT 1', [simulacion_id]),
            conexion.query('SELECT * FROM consumo_electrico WHERE simulacion_id = ? LIMIT 1', [simulacion_id]),
            conexion.query('SELECT * FROM resultados_calculo WHERE simulacion_id = ? LIMIT 1', [simulacion_id]),
            conexion.query(`SELECT e.* FROM empresas e JOIN usuarios_empresas ue ON e.id = ue.empresa_id JOIN simulaciones s ON s.usuario_id = ue.usuario_id WHERE s.id = ? LIMIT 1`,[simulacion_id]),
        ]) as any[];

        const simulacion  = (simRows[0] as any[])[0];
        const cliente     = (clienteRows[0] as any[])[0];
        const techo       = (techoRows[0] as any[])[0];
        const consumo     = (consumoRows[0] as any[])[0];
        const empresa     = (empresaRows[0] as any[])[0];
        let   resultados  = (resultadosRows[0] as any[])[0];

        if (!simulacion || !resultados) {
            return res.status(404).json({ mensaje: 'Simulación o resultados no encontrados' });
        }

        if (resultados.perdidas_json && typeof resultados.perdidas_json === 'string') {
            try { resultados.perdidas = JSON.parse(resultados.perdidas_json); } catch {}
        }
        if (resultados.produccion_mensual_json && typeof resultados.produccion_mensual_json === 'string') {
            try { resultados.produccion_mensual_detalle = JSON.parse(resultados.produccion_mensual_json); } catch {}
        }
        if (resultados.modelado_electrico_json && typeof resultados.modelado_electrico_json === 'string') {
            try { resultados.modelado_electrico = JSON.parse(resultados.modelado_electrico_json); } catch {}
        }

        console.log('resultados completos:', JSON.stringify(resultados, null, 2));

        const pdfBuffer = await generaReportePDF({
            cliente, simulacion, techo, consumo, resultados, empresa
        });

        const nombreArchivo = `Solar_Eye_${cliente?.nombre ?? 'cliente'}_${simulacion?.nombre_proyecto ?? 'reporte'}.pdf`
            .replace(/\s+/g, '_');

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
        return res.send(pdfBuffer);

    } catch (err: any) {
        console.error('Error generando PDF:', err);
        return res.status(500).json({ mensaje: 'Error generando el reporte PDF' });
    }
});

export default router;