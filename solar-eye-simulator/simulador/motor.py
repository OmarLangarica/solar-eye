import pvlib
import pandas as pd
import numpy as np
from .pvgis import obtiene_tmy
from .perdidas import calcula_perdidas


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
    eficiencia_inversor: float
) -> dict:
    """
    Motor de simulación fotovoltaica.
    
    Fuente de datos: PVGIS-ERA5 TMY 2005-2020 (cachéado por coordenadas)
    Transposición POA: modelo Perez de pvlib
    Producción: basada en potencia_kwp instalada
    """
    tmy = obtiene_tmy(lat, lon)
    if not 0.0 <= factor_sombra <= 1.0:
        raise ValueError("factor_sombra debe estar entre 0 y 1")
    if area_util_m2 <= 0 or eficiencia_panel <= 0:
        raise ValueError("El área y la eficiencia del panel deben ser mayores a cero")
    potencia_por_area_kwp = area_util_m2 * eficiencia_panel
    discrepancia_area = abs(potencia_kwp - potencia_por_area_kwp) / potencia_por_area_kwp
    if discrepancia_area > 0.05:
        raise ValueError("La potencia del arreglo no coincide con el área y eficiencia declaradas del panel")

    solar_position = pvlib.solarposition.get_solarposition(tmy.index, lat, lon)
    poa = pvlib.irradiance.get_total_irradiance(
        surface_tilt=tilt,
        surface_azimuth=azimut,
        solar_zenith=solar_position["apparent_zenith"],
        solar_azimuth=solar_position["azimuth"],
        dni=tmy["dni"],
        ghi=tmy["ghi"],
        dhi=tmy["dhi"],
        dni_extra=pvlib.irradiance.get_extra_radiation(tmy.index),
        albedo=0.2,
        model="perez"
    )

    poa_global = poa["poa_global"].clip(lower=0)
    aoi = pvlib.irradiance.aoi(
        tilt,
        azimut,
        solar_position["apparent_zenith"],
        solar_position["azimuth"]
    )
    iam = pvlib.iam.ashrae(aoi).fillna(0).clip(lower=0, upper=1)
    poa_effective = (
        poa["poa_direct"].clip(lower=0) * iam
        + poa["poa_diffuse"].clip(lower=0)
    )

    temp_celda = pvlib.temperature.faiman(
        poa_global=poa_global,
        temp_air=tmy["temp_air"],
        wind_speed=tmy["wind_speed"]
    )
    eta_temp = (1.0 + coef_temp_panel * (temp_celda - 25.0)).clip(lower=0, upper=1.05)

    factor_cm = (1 - 0.015) * (1 - 0.010)
    factor_disponibilidad = 1 - 0.005

    potencia_ac_horaria = (
        potencia_kwp
        * (poa_effective / 1000.0)
        * eta_temp
        * factor_sombra
        * factor_cm
        * factor_disponibilidad
        * eficiencia_inversor
    )

    irr_total_kwh_m2 = float(poa_global.sum()) / 1000.0
    E_ac_total = float(potencia_ac_horaria.sum())
    E_ac_ideal = potencia_kwp * irr_total_kwh_m2
    pr_real = round(min(max(E_ac_total / E_ac_ideal, 0.0), 1.0), 4) if E_ac_ideal > 0 else 0.0

    temp_loss = 1 - float((poa_effective * eta_temp).sum()) / max(float(poa_effective.sum()), 1e-9)
    iam_loss = 1 - float(poa_effective.sum()) / max(float(poa_global.sum()), 1e-9)
    perdidas = calcula_perdidas(
        temp_aire_promedio=float(tmy["temp_air"].mean()),
        factor_sombra=factor_sombra,
        coef_temp=coef_temp_panel,
        eficiencia_inversor=eficiencia_inversor
    )
    perdidas["temperatura_pct"] = round(max(0.0, temp_loss) * 100, 2)
    perdidas["iam_pct"] = round(max(0.0, iam_loss) * 100, 2)
    perdidas["performance_ratio"] = pr_real
    fracciones_perdida = [
        perdidas["temperatura_pct"], perdidas["suciedad_pct"],
        perdidas["cableado_pct"], perdidas["mismatch_pct"],
        perdidas["disponibilidad_pct"], perdidas["sombra_pct"],
        perdidas["inversor_pct"], perdidas["iam_pct"]
    ]
    factor_total = float(np.prod([1 - perdida / 100 for perdida in fracciones_perdida]))
    perdidas["total_pct"] = round((1 - factor_total) * 100, 2)

    df_res = pd.DataFrame({
        "produccion_kwh": potencia_ac_horaria,
        "poa_wh_m2": poa_global,
        "poa_efectiva_wh_m2": poa_effective,
        "temp_celda": temp_celda,
    }, index=tmy.index)
    prod_men = df_res.groupby(df_res.index.month)["produccion_kwh"].sum()
    irr_men = df_res.groupby(df_res.index.month)["poa_wh_m2"].sum() / 1000
    poa_men = df_res.groupby(df_res.index.month)["poa_efectiva_wh_m2"].sum()
    temp_men = (
        df_res["temp_celda"] * df_res["poa_efectiva_wh_m2"]
    ).groupby(df_res.index.month).sum() / poa_men.clip(lower=1)

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
        "temperatura_promedio_anual_c": round(float((temp_celda * poa_effective).sum() / max(float(poa_effective.sum()), 1e-9)), 2),
        "horas_simuladas": len(tmy),
        "kwh_por_kwp_anual": kwh_por_kwp,
        "irradiancia_anual_kwh_m2": round(irr_total_kwh_m2, 2),
        "potencia_kwp_usada": potencia_kwp,
        "metodo": "PVGIS-ERA5 TMY 2005-2020 + pvlib Perez + Faiman + IAM ASHRAE"
    }