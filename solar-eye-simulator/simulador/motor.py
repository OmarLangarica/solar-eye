import pvlib
import pandas as pd
import numpy as np
from .pvgis import obtiene_tmy
from .solar_math import calc_poa_completo
from .perdidas import calcula_perdidas


def detecta_tmz_hrs_east(lon: float) -> float:
    """Estima offset UTC basado en longitud."""
    return round(lon / 15.0)


def simula_sistema(
    lat: float,
    lon: float,
    tilt: float,
    azimut: float,
    potencia_kwp: float,
    area_util_m2: float,
    factor_sombra: float,
    eficiencia_panel: float,
    coef_temp_panel: float,
    eficiencia_inversor: float,
    tz: str = "UTC"
) -> dict:
    """
    Motor de simulación fotovoltaica.
    
    Fuente de datos: PVGIS TMY (cachéado en CSV)
    Cálculo POA: motor matemático local (sin APIs)
    Producción: basada en potencia_kwp instalada
    """

    # ─── 1. Obtener TMY ──────────────────────────────────────────
    tmy = obtiene_tmy(lat, lon)

    # ─── 2. Calcular offset UTC para el motor matemático ─────────
    tmz = 0

    poa_df = calc_poa_completo(
        df=tmy,
        latitude=lat,
        longitude=lon,
        surface_pitch=tilt,
        surface_azimuth=azimut,
        albedo=0.2,
        refraction_index=0.1,
        tmz_hrs_east=tmz
    )

    # G_POA en W/m²
    G_poa = poa_df["panel_poa"].clip(lower=0)

    # ─── 4. Temperatura de celda (modelo Faiman via pvlib) ────────
    try:
        temp_celda = pvlib.temperature.faiman(
            poa_global=G_poa,
            temp_air=poa_df["temp_air"],
            wind_speed=poa_df["wind_speed"]
        )
    except Exception:
        # Fallback manual si pvlib falla
        temp_celda = poa_df["temp_air"] + (G_poa / 1000.0) * 25.0

    # ─── 5. Factor de corrección por temperatura ──────────────────
    eta_temp = 1.0 + coef_temp_panel * (temp_celda - 25.0)
    eta_temp = eta_temp.clip(lower=0.5, upper=1.05)

    # ─── 6. Pérdidas de cableado y mismatch ──────────────────────
    factor_cm = (1 - 0.015) * (1 - 0.010)

    # ─── 7. Producción DC horaria ─────────────────────────────────
    # P_dc [kWh] = P_kwp × (G_POA/1000) × η_temp × f_sombra × f_cableado
    P_dc = (
        potencia_kwp
        * (G_poa / 1000.0)
        * eta_temp
        * factor_sombra
        * factor_cm
    )

    # ─── 8. Producción AC horaria ────────────────────────────────
    P_ac = P_dc * eficiencia_inversor

    # ─── 9. Performance Ratio real ───────────────────────────────
    irr_total_kwh_m2 = float(G_poa.sum()) / 1000.0
    E_ac_total = float(P_ac.sum())
    E_ac_ideal = potencia_kwp * irr_total_kwh_m2
    pr_real = round(min(max(E_ac_total / E_ac_ideal, 0.0), 1.0), 4) if E_ac_ideal > 0 else 0.0

    # ─── 10. Pérdidas para reporte ───────────────────────────────
    temp_promedio = float(poa_df["temp_air"].mean())
    perdidas = calcula_perdidas(
        temp_aire_promedio=temp_promedio,
        factor_sombra=factor_sombra,
        coef_temp=coef_temp_panel,
        eficiencia_inversor=eficiencia_inversor
    )

        # ─── 11. Agregación mensual ───────────────────────────────────
    df_res = pd.DataFrame({
        "P_ac_kwh":    P_ac.values if hasattr(P_ac, 'values') else P_ac,
        "G_poa_wh_m2": G_poa.values if hasattr(G_poa, 'values') else G_poa,
        "temp_celda":  temp_celda.values if hasattr(temp_celda, 'values') else temp_celda,
        "month":       tmy["Month_of_Year"].values
    })

    prod_men  = df_res.groupby("month")["P_ac_kwh"].sum()
    irr_men   = df_res.groupby("month")["G_poa_wh_m2"].sum() / 1000
    temp_men  = df_res.groupby("month")["temp_celda"].mean()

    nombres = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
               "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]

    resultado_mensual = []
    produccion_anual = 0.0

    for i, nombre in enumerate(nombres, start=1):
        kwh = round(float(prod_men.get(i, 0)), 2)
        produccion_anual += kwh
        resultado_mensual.append({
            "mes": nombre,
            "numero_mes": i,
            "produccion_kwh": kwh,
            "irradiancia_poa_kwh_m2": round(float(irr_men.get(i, 0)), 2),
            "temp_celda_promedio_c": round(float(temp_men.get(i, 0)), 2)
        })

    kwh_por_kwp = round(produccion_anual / potencia_kwp, 2) if potencia_kwp > 0 else 0

    return {
        "produccion_anual_kwh": round(produccion_anual, 2),
        "produccion_mensual_promedio_kwh": round(produccion_anual / 12, 2),
        "produccion_mensual": resultado_mensual,
        "performance_ratio": pr_real,
        "perdidas": perdidas,
        "temperatura_promedio_anual_c": round(temp_promedio, 2),
        "horas_simuladas": len(tmy),
        "kwh_por_kwp_anual": kwh_por_kwp,
        "irradiancia_anual_kwh_m2": round(irr_total_kwh_m2, 2),
        "potencia_kwp_usada": potencia_kwp,
        "metodo": "PVGIS TMY + Motor POA local + Faiman Temp"
    }