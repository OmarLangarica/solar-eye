import puppeteer from 'puppeteer';

export const generaReportePDF = async (datos: {
    cliente: any;
    simulacion: any;
    techo: any;
    consumo: any;
    resultados: any;
    empresa: any;
}): Promise<Buffer> => {

    const { cliente, simulacion, techo, consumo, resultados, empresa } = datos;

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
        font-family: 'Segoe UI', Arial, sans-serif;
        color: #1a1a2e;
        background: white;
        font-size: 13px;
    }

    /* ─── PORTADA ─────────────────────────────────── */
    .portada {
        background: linear-gradient(135deg, #04142c 0%, #1d4f91 100%);
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 60px;
        page-break-after: always;
    }

    .portada-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
    }

    .empresa-nombre {
        color: white;
        font-size: 22px;
        font-weight: 700;
    }

    .empresa-contacto {
        color: rgba(255,255,255,0.7);
        font-size: 12px;
        margin-top: 4px;
    }

    .portada-badge {
        background: rgba(255,255,255,0.15);
        color: white;
        padding: 6px 16px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 600;
    }

    .portada-centro {
        text-align: center;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 60px 0;
    }

    .portada-titulo {
        color: white;
        font-size: 42px;
        font-weight: 900;
        line-height: 1.1;
        margin-bottom: 16px;
    }

    .portada-subtitulo {
        color: rgba(255,255,255,0.75);
        font-size: 18px;
        margin-bottom: 40px;
    }

    .portada-cliente-card {
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 12px;
        padding: 24px 40px;
        display: inline-block;
    }

    .portada-cliente-label {
        color: rgba(255,255,255,0.6);
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 6px;
    }

    .portada-cliente-nombre {
        color: white;
        font-size: 24px;
        font-weight: 700;
    }

    .portada-footer {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        color: rgba(255,255,255,0.5);
        font-size: 11px;
    }

    .portada-proyecto {
        color: rgba(255,255,255,0.8);
        font-size: 14px;
        font-weight: 600;
    }

    /* ─── PÁGINAS INTERNAS ────────────────────────── */
    .pagina {
        padding: 40px 50px;
        page-break-after: always;
        min-height: 100vh;
    }

    .pagina:last-child {
        page-break-after: avoid;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 16px;
        border-bottom: 2px solid #04142c;
        margin-bottom: 28px;
    }

    .page-header-titulo {
        font-size: 20px;
        font-weight: 800;
        color: #04142c;
    }

    .page-header-badge {
        background: #1d4f91;
        color: white;
        padding: 4px 14px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 600;
    }

    /* ─── CARDS DE MÉTRICAS ───────────────────────── */
    .metricas-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 28px;
    }

    .metrica-card {
        background: #f8fafc;
        border-radius: 10px;
        padding: 18px;
        border: 1px solid #e8edf2;
        text-align: center;
    }

    .metrica-valor {
        font-size: 22px;
        font-weight: 800;
        color: #1d4f91;
        line-height: 1;
        margin-bottom: 6px;
    }

    .metrica-label {
        font-size: 11px;
        color: #666;
        font-weight: 500;
    }

    /* ─── SECCIONES ───────────────────────────────── */
    .seccion {
        margin-bottom: 28px;
    }

    .seccion-titulo {
        font-size: 13px;
        font-weight: 700;
        color: #04142c;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 12px;
        padding-bottom: 6px;
        border-bottom: 1px solid #e8edf2;
    }

    /* ─── TABLA GENÉRICA ──────────────────────────── */
    .tabla {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
    }

    .tabla th {
        background: #04142c;
        color: white;
        padding: 8px 12px;
        text-align: left;
        font-weight: 600;
        font-size: 11px;
    }

    .tabla td {
        padding: 8px 12px;
        border-bottom: 1px solid #f0f0f0;
        color: #333;
    }

    .tabla tr:nth-child(even) td {
        background: #f8fafc;
    }

    .tabla td.valor-positivo { color: #16a34a; font-weight: 600; }
    .tabla td.valor-destacado { color: #1d4f91; font-weight: 700; }

    /* ─── FILAS INFO ──────────────────────────────── */
    .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
    }

    .info-fila {
        display: flex;
        justify-content: space-between;
        padding: 7px 12px;
        background: #f8fafc;
        border-radius: 6px;
        font-size: 12px;
    }

    .info-label { color: #666; }
    .info-valor { font-weight: 600; color: #333; }
    .info-valor.destacado { color: #1d4f91; }
    .info-valor.ok { color: #16a34a; }
    .info-valor.error { color: #dc2626; }

    /* ─── GRÁFICA DE BARRAS ───────────────────────── */
    .grafica-barras {
        display: flex;
        align-items: flex-end;
        gap: 6px;
        height: 140px;
        padding: 12px;
        background: #f8fafc;
        border-radius: 10px;
        border: 1px solid #e8edf2;
    }

    .barra-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        height: 100%;
        justify-content: flex-end;
    }

    .barra {
        width: 100%;
        background: linear-gradient(to top, #04142c, #1d4f91);
        border-radius: 4px 4px 0 0;
        min-height: 4px;
    }

    .barra-label {
        font-size: 9px;
        color: #888;
        margin-top: 4px;
        text-align: center;
    }

    .barra-valor {
        font-size: 9px;
        color: #333;
        font-weight: 600;
        margin-bottom: 3px;
    }

    /* ─── PÉRDIDAS ────────────────────────────────── */
    .perdidas-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
    }

    .perdida-item {
        background: #f8fafc;
        border-radius: 8px;
        padding: 12px;
        text-align: center;
        border: 1px solid #e8edf2;
    }

    .perdida-pct {
        font-size: 18px;
        font-weight: 800;
        color: #1d4f91;
    }

    .perdida-nombre {
        font-size: 10px;
        color: #666;
        margin-top: 4px;
    }

    /* ─── PR BARRA ────────────────────────────────── */
    .pr-barra-wrap {
        background: #f0f0f0;
        border-radius: 999px;
        height: 14px;
        overflow: hidden;
        margin: 10px 0;
    }

    .pr-barra-fill {
        height: 100%;
        background: linear-gradient(90deg, #ef4444, #f59e0b, #22c55e);
        border-radius: 999px;
    }

    .pr-valor-grande {
        font-size: 36px;
        font-weight: 900;
        color: #1d4f91;
        text-align: center;
        margin: 10px 0 4px;
    }

    .pr-label {
        text-align: center;
        color: #666;
        font-size: 12px;
        margin-bottom: 12px;
    }

    /* ─── IMPACTO AMBIENTAL ───────────────────────── */
    .ambiental-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
    }

    .ambiental-card {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 10px;
        padding: 20px;
        text-align: center;
    }

    .ambiental-valor {
        font-size: 26px;
        font-weight: 800;
        color: #16a34a;
        margin-bottom: 4px;
    }

    .ambiental-label {
        font-size: 11px;
        color: #166534;
    }

    /* ─── FOOTER PÁGINA ───────────────────────────── */
    .page-footer {
        position: fixed;
        bottom: 20px;
        left: 50px;
        right: 50px;
        display: flex;
        justify-content: space-between;
        font-size: 10px;
        color: #999;
        border-top: 1px solid #f0f0f0;
        padding-top: 8px;
    }

    /* ─── BADGES ──────────────────────────────────── */
    .badge {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 600;
    }

    .badge-verde { background: #dcfce7; color: #16a34a; }
    .badge-azul  { background: #dbeafe; color: #1d4f91; }
    .badge-rojo  { background: #fee2e2; color: #dc2626; }

    .dos-col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }
</style>
</head>
<body>

<!-- ═══ PORTADA ═══════════════════════════════════════════════ -->
<div class="portada">
    <div class="portada-header">
        <div>
            <div class="empresa-nombre">${empresa?.nombre ?? 'Solar Eye'}</div>
            <div class="empresa-contacto">${empresa?.email_contacto ?? ''} ${empresa?.telefono ? '· ' + empresa.telefono : ''}</div>
        </div>
        <div class="portada-badge">Reporte Solar Profesional</div>
    </div>

    <div class="portada-centro">
        <div class="portada-titulo">Propuesta de<br>Sistema Fotovoltaico</div>
        <div class="portada-subtitulo">${simulacion?.nombre_proyecto ?? 'Proyecto Solar'}</div>
        <div style="display:flex; justify-content:center;">
            <div class="portada-cliente-card">
                <div class="portada-cliente-label">Preparado para</div>
                <div class="portada-cliente-nombre">${cliente?.nombre ?? ''} ${cliente?.apellido ?? ''}</div>
                ${cliente?.email ? `<div style="color:rgba(255,255,255,0.6);font-size:12px;margin-top:4px;">${cliente.email}</div>` : ''}
            </div>
        </div>
    </div>

    <div class="portada-footer">
        <div class="portada-proyecto">${simulacion?.nombre_proyecto ?? ''}</div>
        <div>Generado el ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
    </div>
</div>

<!-- ═══ PÁGINA 2: RESUMEN EJECUTIVO ═══════════════════════════ -->
<div class="pagina">
    <div class="page-header">
        <div class="page-header-titulo">Resumen Ejecutivo</div>
        <div class="page-header-badge">Solar Eye</div>
    </div>

    <div class="metricas-grid">
        <div class="metrica-card">
            <div class="metrica-valor">${Number(resultados.produccion_anual_kwh).toLocaleString('es-MX')} kWh</div>
            <div class="metrica-label">Producción anual estimada</div>
        </div>
        <div class="metrica-card">
            <div class="metrica-valor">${Number(resultados.porcentaje_cobertura).toFixed(1)}%</div>
            <div class="metrica-label">Cobertura del consumo</div>
        </div>
        <div class="metrica-card">
            <div class="metrica-valor">$${Number(resultados.ahorro_anual_mxn).toLocaleString('es-MX')}</div>
            <div class="metrica-label">Ahorro anual estimado</div>
        </div>
        <div class="metrica-card">
            <div class="metrica-valor">${Number(resultados.retorno_inversion_anios).toFixed(1)} años</div>
            <div class="metrica-label">Retorno de inversión</div>
        </div>
    </div>

    <div class="dos-col">
        <div class="seccion">
            <div class="seccion-titulo">Datos del cliente</div>
            <div class="info-grid" style="grid-template-columns:1fr;">
                <div class="info-fila">
                    <span class="info-label">Nombre</span>
                    <span class="info-valor">${cliente?.nombre ?? ''} ${cliente?.apellido ?? ''}</span>
                </div>
                <div class="info-fila">
                    <span class="info-label">Teléfono</span>
                    <span class="info-valor">${cliente?.telefono ?? '—'}</span>
                </div>
                <div class="info-fila">
                    <span class="info-label">Email</span>
                    <span class="info-valor">${cliente?.email ?? '—'}</span>
                </div>
                <div class="info-fila">
                    <span class="info-label">Consumo mensual</span>
                    <span class="info-valor destacado">${Number(consumo?.consumo_mensual_kwh).toLocaleString('es-MX')} kWh</span>
                </div>
                <div class="info-fila">
                    <span class="info-label">Tarifa CFE</span>
                    <span class="info-valor">${consumo?.tipo_tarifa ?? '—'}</span>
                </div>
                <div class="info-fila">
                    <span class="info-label">Costo mensual actual</span>
                    <span class="info-valor">$${Number(consumo?.costo_mensual_mxn).toLocaleString('es-MX')} MXN</span>
                </div>
            </div>
        </div>

        <div class="seccion">
            <div class="seccion-titulo">Sistema propuesto</div>
            <div class="info-grid" style="grid-template-columns:1fr;">
                <div class="info-fila">
                    <span class="info-label">Panel solar</span>
                    <span class="info-valor">${resultados?.panel_modelo ?? '—'}</span>
                </div>
                <div class="info-fila">
                    <span class="info-label">Inversor</span>
                    <span class="info-valor">${resultados?.inversor_modelo ?? '—'}</span>
                </div>
                <div class="info-fila">
                    <span class="info-label">Número de paneles</span>
                    <span class="info-valor destacado">${resultados?.numero_paneles ?? '—'} módulos</span>
                </div>
                <div class="info-fila">
                    <span class="info-label">Potencia instalada</span>
                    <span class="info-valor destacado">${Number(resultados?.potencia_kwp ?? 0).toFixed(2)} kWp</span>
                </div>
                <div class="info-fila">
                    <span class="info-label">Área del techo</span>
                    <span class="info-valor">${Number(techo?.area_m2 ?? 0).toFixed(2)} m²</span>
                </div>
                <div class="info-fila">
                    <span class="info-label">Área útil</span>
                    <span class="info-valor">${Number(techo?.area_util_m2 ?? 0).toFixed(2)} m²</span>
                </div>
            </div>
        </div>
    </div>

    <div class="seccion">
        <div class="seccion-titulo">Análisis económico</div>
        <div class="info-grid">
            <div class="info-fila">
                <span class="info-label">Costo de instalación</span>
                <span class="info-valor">$${Number(resultados.costo_total_instalacion_mxn).toLocaleString('es-MX')} MXN</span>
            </div>
            <div class="info-fila">
                <span class="info-label">Ahorro mensual estimado</span>
                <span class="info-valor ok">$${Number(resultados.ahorro_mensual_mxn).toLocaleString('es-MX')} MXN</span>
            </div>
            <div class="info-fila">
                <span class="info-label">Ahorro anual estimado</span>
                <span class="info-valor ok">$${Number(resultados.ahorro_anual_mxn).toLocaleString('es-MX')} MXN</span>
            </div>
            <div class="info-fila">
                <span class="info-label">Ahorro en 25 años</span>
                <span class="info-valor ok">$${Number(resultados.ahorro_vida_util_mxn).toLocaleString('es-MX')} MXN</span>
            </div>
            <div class="info-fila">
                <span class="info-label">Retorno de inversión</span>
                <span class="info-valor destacado">${Number(resultados.retorno_inversion_anios).toFixed(1)} años</span>
            </div>
            <div class="info-fila">
                <span class="info-label">Tasa incremento tarifario</span>
                <span class="info-valor">${resultados.tasa_incremento_tarifa_pct}% anual</span>
            </div>
        </div>
    </div>
</div>

<!-- ═══ PÁGINA 3: PRODUCCIÓN ═══════════════════════════════════ -->
<div class="pagina">
    <div class="page-header">
        <div class="page-header-titulo">Producción Energética</div>
        <div class="page-header-badge">Solar Eye</div>
    </div>

    ${(() => {
        const meses = resultados.produccion_mensual_detalle ?? resultados.produccion_mensual ?? [];
        if (!meses.length) return '<p style="color:#999">No hay datos de producción mensual</p>';

        const maxProd = Math.max(...meses.map((m: any) => m.produccion_kwh));

        const barras = meses.map((m: any) => {
            const pct = maxProd > 0 ? (m.produccion_kwh / maxProd) * 100 : 0;
            const nombreCorto = m.mes.substring(0, 3);
            return `
                <div class="barra-wrap">
                    <div class="barra-valor">${Math.round(m.produccion_kwh)}</div>
                    <div class="barra" style="height:${pct}%"></div>
                    <div class="barra-label">${nombreCorto}</div>
                </div>
            `;
        }).join('');

        const filas = meses.map((m: any) => `
            <tr>
                <td>${m.mes}</td>
                <td class="valor-positivo">${Number(m.produccion_kwh).toLocaleString('es-MX', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                <td>${m.irradiancia_poa_kwh_m2 ?? '—'}</td>
                <td>${m.temp_celda_promedio_c ?? '—'}°C</td>
            </tr>
        `).join('');

        return `
            <div class="seccion">
                <div class="seccion-titulo">Producción mensual (kWh)</div>
                <div class="grafica-barras">${barras}</div>
            </div>
            <div class="seccion">
                <div class="seccion-titulo">Detalle por mes</div>
                <table class="tabla">
                    <thead>
                        <tr>
                            <th>Mes</th>
                            <th>Producción (kWh)</th>
                            <th>Irradiancia POA (kWh/m²)</th>
                            <th>Temp. Celda (°C)</th>
                        </tr>
                    </thead>
                    <tbody>${filas}</tbody>
                </table>
            </div>
        `;
    })()}

    <div class="metricas-grid" style="margin-top:20px;">
        <div class="metrica-card">
            <div class="metrica-valor">${Number(resultados.produccion_anual_kwh).toLocaleString('es-MX')} kWh</div>
            <div class="metrica-label">Producción anual total</div>
        </div>
        <div class="metrica-card">
            <div class="metrica-valor">${Number(resultados.produccion_mensual_promedio_kwh).toLocaleString('es-MX')} kWh</div>
            <div class="metrica-label">Promedio mensual</div>
        </div>
        <div class="metrica-card">
            <div class="metrica-valor">${Number(resultados.porcentaje_cobertura).toFixed(1)}%</div>
            <div class="metrica-label">Cobertura del consumo</div>
        </div>
        <div class="metrica-card">
            <div class="metrica-valor">${Number(resultados.excedente_kwh).toLocaleString('es-MX')} kWh</div>
            <div class="metrica-label">Excedente a la red</div>
        </div>
    </div>
</div>

<!-- ═══ PÁGINA 4: PERFORMANCE RATIO Y PÉRDIDAS ════════════════ -->
<div class="pagina">
    <div class="page-header">
        <div class="page-header-titulo">Performance Ratio y Pérdidas</div>
        <div class="page-header-badge">Solar Eye</div>
    </div>

    ${(() => {
        const perdidas = resultados.perdidas ?? resultados.perdidas_json ?? null;
        const pr = resultados.performance_ratio ?? 0;

        if (!perdidas) return '<p style="color:#999">No hay datos de pérdidas disponibles</p>';

        return `
            <div class="dos-col" style="margin-bottom:24px;">
                <div style="text-align:center; background:#f8fafc; border-radius:12px; padding:24px; border:1px solid #e8edf2;">
                    <div class="pr-valor-grande">${(pr * 100).toFixed(1)}%</div>
                    <div class="pr-label">Performance Ratio</div>
                    <div class="pr-barra-wrap">
                        <div class="pr-barra-fill" style="width:${pr * 100}%"></div>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:10px;color:#999;margin-top:4px;">
                        <span>0%</span><span style="color:#f59e0b">60%</span><span style="color:#22c55e">75%</span><span>100%</span>
                    </div>
                </div>
                <div>
                    <div class="seccion-titulo">Método de simulación</div>
                    <div style="background:#f0f5fb;border:1px solid #c7d9f0;border-radius:8px;padding:12px;font-size:11px;color:#1d4f91;font-family:monospace;margin-bottom:12px;">
                        ${resultados.metodo_simulacion ?? 'pvlib + NASA POWER'}
                    </div>
                    <div class="info-grid" style="grid-template-columns:1fr;">
                        <div class="info-fila">
                            <span class="info-label">Pérdidas totales</span>
                            <span class="info-valor">${perdidas.total_pct ?? 0}%</span>
                        </div>
                        <div class="info-fila">
                            <span class="info-label">Horas simuladas</span>
                            <span class="info-valor">8,760 horas (1 año completo)</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="seccion">
                <div class="seccion-titulo">Desglose de pérdidas</div>
                <div class="perdidas-grid">
                    <div class="perdida-item">
                        <div class="perdida-pct">${perdidas.temperatura_pct ?? 0}%</div>
                        <div class="perdida-nombre">Temperatura</div>
                    </div>
                    <div class="perdida-item">
                        <div class="perdida-pct">${perdidas.suciedad_pct ?? 0}%</div>
                        <div class="perdida-nombre">Suciedad</div>
                    </div>
                    <div class="perdida-item">
                        <div class="perdida-pct">${perdidas.cableado_pct ?? 0}%</div>
                        <div class="perdida-nombre">Cableado</div>
                    </div>
                    <div class="perdida-item">
                        <div class="perdida-pct">${perdidas.mismatch_pct ?? 0}%</div>
                        <div class="perdida-nombre">Mismatch</div>
                    </div>
                    <div class="perdida-item">
                        <div class="perdida-pct">${perdidas.sombra_pct ?? 0}%</div>
                        <div class="perdida-nombre">Sombras</div>
                    </div>
                    <div class="perdida-item">
                        <div class="perdida-pct">${perdidas.inversor_pct ?? 0}%</div>
                        <div class="perdida-nombre">Inversor</div>
                    </div>
                    <div class="perdida-item">
                        <div class="perdida-pct">${perdidas.disponibilidad_pct ?? 0}%</div>
                        <div class="perdida-nombre">Disponibilidad</div>
                    </div>
                    <div class="perdida-item" style="background:#e8f5e9;border-color:#bbf7d0;">
                        <div class="perdida-pct" style="color:#16a34a">${(pr * 100).toFixed(1)}%</div>
                        <div class="perdida-nombre">Performance Ratio</div>
                    </div>
                </div>
            </div>
        `;
    })()}

    ${(() => {
        const elec = resultados.modelado_electrico ?? null;
        if (!elec || elec.error) return '';
        return `
            <div class="seccion" style="margin-top:24px;">
                <div class="seccion-titulo">Modelado eléctrico</div>
                <div style="background:#f0f5fb;border:1px solid #c7d9f0;border-radius:8px;padding:10px 14px;font-size:11px;color:#1d4f91;font-family:monospace;margin-bottom:12px;">
                    ${elec.resumen}
                </div>
                <div class="info-grid">
                    <div class="info-fila">
                        <span class="info-label">Paneles en serie</span>
                        <span class="info-valor">${elec.paneles_serie}</span>
                    </div>
                    <div class="info-fila">
                        <span class="info-label">Strings en paralelo</span>
                        <span class="info-valor">${elec.strings_paralelo}</span>
                    </div>
                    <div class="info-fila">
                        <span class="info-label">Voc frío (${elec.temp_min_sitio_c}°C)</span>
                        <span class="info-valor ${elec.voc_dentro_limite ? 'ok' : 'error'}">${elec.voc_frio_string_v} V</span>
                    </div>
                    <div class="info-fila">
                        <span class="info-label">Vmp calor (${elec.temp_max_celda_c}°C)</span>
                        <span class="info-valor ${elec.mppt_dentro_rango ? 'ok' : 'error'}">${elec.vmp_calor_string_v} V</span>
                    </div>
                    <div class="info-fila">
                        <span class="info-label">Isc por MPPT</span>
                        <span class="info-valor ${elec.corriente_dentro_limite ? 'ok' : 'error'}">${elec.isc_por_mppt_a} A</span>
                    </div>
                    <div class="info-fila">
                        <span class="info-label">Compatibilidad</span>
                        <span class="info-valor ${elec.compatible ? 'ok' : 'error'}">${elec.compatible ? 'Compatible' : 'Revisar'}</span>
                    </div>
                </div>
            </div>
        `;
    })()}
</div>

<!-- ═══ PÁGINA 5: IMPACTO AMBIENTAL ═══════════════════════════ -->
<div class="pagina">
    <div class="page-header">
        <div class="page-header-titulo">Impacto Ambiental y Proyección</div>
        <div class="page-header-badge">Solar Eye</div>
    </div>

    <div class="seccion">
        <div class="seccion-titulo">Impacto ambiental estimado</div>
        <div class="ambiental-grid">
            <div class="ambiental-card">
                <div class="ambiental-valor">${Number(resultados.co2_evitado_anual_kg).toLocaleString('es-MX')} kg</div>
                <div class="ambiental-label">CO₂ evitado al año</div>
            </div>
            <div class="ambiental-card">
                <div class="ambiental-valor">${(Number(resultados.co2_evitado_vida_util_kg) / 1000).toFixed(1)} ton</div>
                <div class="ambiental-label">CO₂ evitado en 25 años</div>
            </div>
            <div class="ambiental-card">
                <div class="ambiental-valor">${Number(resultados.arboles_equivalentes).toLocaleString('es-MX')}</div>
                <div class="ambiental-label">Árboles equivalentes</div>
            </div>
        </div>
    </div>

    <div class="seccion">
        <div class="seccion-titulo">Proyección tarifaria CFE (incremento 5% anual)</div>
        <div class="info-grid">
            <div class="info-fila">
                <span class="info-label">Precio actual kWh</span>
                <span class="info-valor">$${Number(consumo?.tarifa_kwh_mxn ?? 0).toFixed(4)} MXN</span>
            </div>
            <div class="info-fila">
                <span class="info-label">Precio estimado en 5 años</span>
                <span class="info-valor destacado">$${Number(resultados.precio_kwh_proyectado_anio5).toFixed(4)} MXN</span>
            </div>
            <div class="info-fila">
                <span class="info-label">Precio estimado en 10 años</span>
                <span class="info-valor destacado">$${Number(resultados.precio_kwh_proyectado_anio10).toFixed(4)} MXN</span>
            </div>
            <div class="info-fila">
                <span class="info-label">Ahorro acumulado 25 años</span>
                <span class="info-valor ok">$${Number(resultados.ahorro_vida_util_mxn).toLocaleString('es-MX')} MXN</span>
            </div>
        </div>
    </div>

    <div class="seccion">
        <div class="seccion-titulo">Notas y condiciones</div>
        <div style="background:#f8fafc;border-radius:8px;padding:16px;font-size:11px;color:#555;line-height:1.7;border:1px solid #e8edf2;">
            <p>• Los valores de producción energética son estimaciones basadas en datos climáticos históricos de NASA POWER y simulación horaria con pvlib.</p>
            <p>• El ahorro económico considera un incremento tarifario del 5% anual y una degradación del panel del 0.5% anual.</p>
            <p>• Los valores reales pueden variar según condiciones climáticas, mantenimiento del sistema y cambios en las tarifas de CFE.</p>
            <p>• Este reporte fue generado con Solar Eye — Motor de simulación: ${resultados.metodo_simulacion ?? 'pvlib + NASA POWER'}.</p>
        </div>
    </div>

    <div class="page-footer">
        <span>${empresa?.nombre ?? 'Solar Eye'} — Reporte confidencial</span>
        <span>Generado el ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
    </div>
</div>

</body>
</html>`;

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'load' });

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0', right: '0', bottom: '0', left: '0' }
        });

        return Buffer.from(pdf);
    } finally {
        await browser.close();
    }
};