def calcula_perdidas(
    temp_aire_promedio: float,
    factor_sombra: float = 0.95,
    coef_temp: float = -0.0035,
    eficiencia_inversor: float = 0.97,
    temp_ref: float = 25.0,
    temp_noct: float = 45.0
) -> dict:
    """
    Calcula el desglose de pérdidas del sistema fotovoltaico.

    CORRECCIONES vs versión anterior:
    - Pérdida de temperatura calculada como impacto PROMEDIO anual
      (antes se usaba para producción Y para PR, doble conteo)
    - Pérdida del inversor incluida en el desglose (era implícita)
    - Pérdida de sombra incluida en el desglose (era implícita)
    - El PR resultante ahora coincide con el PR real calculado en motor.py
    - Pérdidas totales ajustadas a rangos físicamente típicos (12-20%)

    NOTA: Estas pérdidas son para REPORTE e indicadores.
    No se aplican como multiplicador adicional en el motor.
    El motor ya aplica cada factor directamente en la física.
    """

    # Temperatura de celda operativa promedio (NOCT simplificado)
    # T_celda = T_aire + (NOCT - 20) × (G_operacion / 1000)
    # Asumimos G_operacion promedio ≈ 600 W/m² (irradiancia efectiva promedio diurna)
    G_operacion = 600.0
    temp_celda_promedio = temp_aire_promedio + (temp_noct - 20.0) * (G_operacion / 1000.0)

    # Pérdida por temperatura (fracción de energía perdida por calor)
    # ΔP = |γ| × (T_celda - T_ref)
    perdida_temperatura = abs(coef_temp) * max(0.0, temp_celda_promedio - temp_ref)

    # Pérdidas fijas estándar (IEC 61724 / literatura solar)
    perdida_suciedad = 0.020       # 2.0% — polvo y suciedad típica México
    perdida_cableado = 0.015       # 1.5% — pérdidas óhmicas DC + AC
    perdida_mismatch = 0.010       # 1.0% — diferencias entre paneles del mismo string
    perdida_disponibilidad = 0.005 # 0.5% — paradas por mantenimiento/fallas

    # Pérdida por sombras (del factor_sombra del usuario)
    perdida_sombra = 1.0 - factor_sombra

    # Pérdida del inversor (ya aplicada en motor.py, aquí solo para reporte)
    perdida_inversor = 1.0 - eficiencia_inversor

    # PR = productio de (1 - cada_pérdida)
    # Refleja el efecto combinado real de todas las pérdidas del sistema
    pr = (
        (1.0 - perdida_temperatura) *
        (1.0 - perdida_suciedad) *
        (1.0 - perdida_cableado) *
        (1.0 - perdida_mismatch) *
        (1.0 - perdida_disponibilidad) *
        (1.0 - perdida_sombra) *
        (1.0 - perdida_inversor)
    )

    pr = round(max(0.0, min(1.0, pr)), 4)

    # Pérdida total lineal (aproximada para reporte)
    perdida_total = (
        perdida_temperatura +
        perdida_suciedad +
        perdida_cableado +
        perdida_mismatch +
        perdida_disponibilidad +
        perdida_sombra +
        perdida_inversor
    )

    return {
        "temperatura_pct": round(perdida_temperatura * 100, 2),
        "suciedad_pct": round(perdida_suciedad * 100, 2),
        "cableado_pct": round(perdida_cableado * 100, 2),
        "mismatch_pct": round(perdida_mismatch * 100, 2),
        "disponibilidad_pct": round(perdida_disponibilidad * 100, 2),
        "sombra_pct": round(perdida_sombra * 100, 2),
        "inversor_pct": round(perdida_inversor * 100, 2),
        "total_pct": round(perdida_total * 100, 2),
        "performance_ratio": pr
    }