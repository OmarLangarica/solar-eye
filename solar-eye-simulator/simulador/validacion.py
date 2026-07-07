"""
Script de validación del motor de simulación.
Compara contra PVGIS PVcalc (referencia oficial) con tolerancia ±20%.
Ejecutar: python -m simulador.validacion
"""
import requests
from simulador.motor import simula_sistema

POTENCIA_PRUEBA_KWP = 1.0
AREA_PRUEBA_M2 = POTENCIA_PRUEBA_KWP / 0.205  # área para 1 kWp con eficiencia 20.5%
TOLERANCIA_PCT = 20  # % de diferencia aceptable vs PVGIS

casos = [
    {"nombre": "Culiacán, Sinaloa", "lat": 24.80, "lon": -107.38},
    {"nombre": "Hermosillo, Sonora", "lat": 29.07, "lon": -110.96},
    {"nombre": "CDMX", "lat": 19.43, "lon": -99.13},
    {"nombre": "Mérida, Yucatán", "lat": 20.97, "lon": -89.62},
]


def obtiene_referencia_pvgis(lat: float, lon: float, kwp: float) -> float | None:
    """Obtiene producción anual oficial de PVGIS PVcalc"""
    params = {
        "lat": lat,
        "lon": lon,
        "peakpower": kwp,
        "loss": 14,
        "outputformat": "json",
        "browser": 0
    }
    try:
        resp = requests.get(
            "https://re.jrc.ec.europa.eu/api/v5_2/PVcalc",
            params=params,
            timeout=30
        )
        resp.raise_for_status()
        data = resp.json()
        return data["outputs"]["totals"]["fixed"]["E_y"]
    except Exception:
        return None


print("=" * 70)
print("VALIDACIÓN DEL MOTOR DE SIMULACIÓN SOLAR EYE")
print(f"Sistema de prueba: {POTENCIA_PRUEBA_KWP} kWp ({AREA_PRUEBA_M2:.2f} m²)")
print(f"Tolerancia aceptada vs PVGIS: ±{TOLERANCIA_PCT}%")
print("=" * 70)

for caso in casos:
    print(f"\n📍 {caso['nombre']} (lat={caso['lat']}, lon={caso['lon']})")
    try:
        resultado = simula_sistema(
            lat=caso["lat"],
            lon=caso["lon"],
            tilt=15.0,
            azimut=180.0,
            potencia_kwp=POTENCIA_PRUEBA_KWP,
            area_util_m2=AREA_PRUEBA_M2,
            factor_sombra=1.0,
            eficiencia_panel=0.205,
            coef_temp_panel=-0.0035,
            eficiencia_inversor=0.97
        )

        produccion_propia = resultado["produccion_anual_kwh"]
        pr = resultado["performance_ratio"]

        produccion_pvgis = obtiene_referencia_pvgis(
            caso["lat"], caso["lon"], POTENCIA_PRUEBA_KWP
        )

        print(f"  Producción Solar Eye: {produccion_propia:.1f} kWh/kWp/año")
        print(f"  PR Solar Eye: {pr*100:.1f}%")

        if produccion_pvgis is not None:
            diferencia_pct = abs(produccion_propia - produccion_pvgis) / produccion_pvgis * 100
            print(f"  Producción PVGIS (oficial): {produccion_pvgis:.1f} kWh/kWp/año")
            print(f"  Diferencia: {diferencia_pct:.1f}%")

            if diferencia_pct <= TOLERANCIA_PCT:
                print(f"  Estado: ✅ OK (dentro de ±{TOLERANCIA_PCT}%)")
            else:
                print(f"  Estado: ⚠️  Diferencia mayor a {TOLERANCIA_PCT}%")
        else:
            print("  PVGIS no disponible para esta ubicación (sin referencia)")

    except Exception as e:
        print(f"  ❌ ERROR: {e}")

print("\n" + "=" * 70)