import pandas as pd
import numpy as np
import os
import json
import hashlib

CACHE_DIR         = os.path.join(os.path.dirname(__file__), "..", "cache_tmy")
INFO_CIUDADES_DIR = os.path.join(os.path.dirname(__file__), "..", "info_ciudades")

# Mapeo de coordenadas a carpetas de ciudades
CIUDADES_DISPONIBLES = {
    "culiacan":    {"lat_min": 24.5, "lat_max": 25.1, "lon_min": -107.7, "lon_max": -107.0},
    "cdmx":        {"lat_min": 19.2, "lat_max": 19.6, "lon_min": -99.4,  "lon_max": -98.9},
    "hermosillo":  {"lat_min": 28.8, "lat_max": 29.3, "lon_min": -111.2, "lon_max": -110.6},
    "merida":      {"lat_min": 20.7, "lat_max": 21.2, "lon_min": -89.9,  "lon_max": -89.3},
    "monterrey":   {"lat_min": 25.5, "lat_max": 26.0, "lon_min": -100.5, "lon_max": -100.0},
    "guadalajara": {"lat_min": 20.5, "lat_max": 20.9, "lon_min": -103.5, "lon_max": -103.0},
    "chihuahua":   {"lat_min": 28.3, "lat_max": 29.0, "lon_min": -106.5, "lon_max": -105.7},  # ← agrega
}


def _cache_path(lat: float, lon: float) -> str:
    os.makedirs(CACHE_DIR, exist_ok=True)
    key = f"{round(lat, 3)}_{round(lon, 3)}"
    nombre = hashlib.md5(key.encode()).hexdigest()
    return os.path.join(CACHE_DIR, f"tmy_{nombre}.csv")


def detecta_ciudad(lat: float, lon: float) -> str | None:
    """
    Detecta si las coordenadas corresponden a una ciudad pre-cacheada.
    Retorna el nombre de la carpeta o None si no hay coincidencia.
    """
    for ciudad, rango in CIUDADES_DISPONIBLES.items():
        if (rango["lat_min"] <= lat <= rango["lat_max"] and
                rango["lon_min"] <= lon <= rango["lon_max"]):
            carpeta = os.path.join(INFO_CIUDADES_DIR, ciudad)
            # Verificar que existan los 4 archivos JSON
            archivos_ok = all(
                os.path.exists(os.path.join(carpeta, f"q{i}.json"))
                for i in range(1, 5)
            )
            if archivos_ok:
                return ciudad
    return None


def _parsea_json_nasa(data: dict) -> pd.DataFrame:
    p = data["properties"]["parameter"]

    keys = list(p.get("ALLSKY_SFC_SW_DWN", {}).keys())

    months = np.array([int(k[4:6]) for k in keys])
    hours  = np.array([int(k[8:10]) for k in keys])
    days_in_month = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
    days  = np.array([days_in_month[int(k[4:6])-1] + int(k[6:8]) for k in keys])
    weeks = np.array([(d - 1) // 7 + 1 for d in days])

    cols_numericas = pd.DataFrame({
        "G(h)":  list(p.get("ALLSKY_SFC_SW_DWN", {}).values()),
        "Gd(h)": list(p.get("ALLSKY_SFC_SW_DIFF", {}).values()),
        "Gb(n)": list(p.get("ALLSKY_SFC_SW_DNI", {}).values()),
        "T2m":   list(p.get("T2M", {}).values()),
        "WS10m": list(p.get("WS10M", {}).values()),
    }).replace(-999.0, 0).clip(lower=0)

    df = pd.DataFrame({
        "time_key":      keys,
        "G(h)":          cols_numericas["G(h)"].values,
        "Gd(h)":         cols_numericas["Gd(h)"].values,
        "Gb(n)":         cols_numericas["Gb(n)"].values,
        "T2m":           cols_numericas["T2m"].values,
        "WS10m":         cols_numericas["WS10m"].values,
        "Hour_of_Day":   hours,
        "Day_of_Year":   days,
        "Month_of_Year": months,
        "Week_of_Year":  weeks,
    })

    return df


def construye_tmy_desde_jsons(lat: float, lon: float) -> pd.DataFrame:
    """
    Construye TMY leyendo q1-q4.json.
    Busca primero en info_ciudades/<ciudad>/ según coordenadas.
    """
    ciudad = detecta_ciudad(lat, lon)

    if ciudad:
        carpeta = os.path.join(INFO_CIUDADES_DIR, ciudad)
        print(f"Usando datos de ciudad pre-cargada: {ciudad}")
    else:
        raise FileNotFoundError(
            f"No hay datos disponibles para lat={lat}, lon={lon}.\n"
            f"Descarga los JSONs de NASA POWER y colócalos en:\n"
            f"info_ciudades/<nombre_ciudad>/q1.json ... q4.json\n"
            f"Ciudades disponibles: {list(CIUDADES_DISPONIBLES.keys())}"
        )

    archivos = ["q1.json", "q2.json", "q3.json", "q4.json"]
    frames = []

    for archivo in archivos:
        ruta = os.path.join(carpeta, archivo)
        print(f"  Abriendo {archivo}...")
        with open(ruta, "r", encoding="utf-8") as f:
            data = json.load(f)
        print(f"  JSON cargado OK")
        df = _parsea_json_nasa(data)
        frames.append(df)
        print(f"  {archivo} OK: {len(df)} horas")

    df_anual = pd.concat(frames, ignore_index=True)
    df_anual = df_anual.sort_values("time_key").reset_index(drop=True)
    df_anual = df_anual.drop(columns=["time_key"])

    print(f"TMY construido: {len(df_anual)} horas totales")
    return df_anual


def obtiene_tmy(lat: float, lon: float) -> pd.DataFrame:
    """
    Obtiene TMY con caché en CSV.
    Primera vez: lee info_ciudades/<ciudad>/q1-q4.json → genera caché
    Siguientes:  carga CSV directo (~0.5 seg)
    """
    ruta = _cache_path(lat, lon)

    if os.path.exists(ruta):
        try:
            print(f"Cargando TMY desde caché...")
            df = pd.read_csv(ruta)
            print(f"TMY cargado: {len(df)} horas")
            return df
        except Exception as e:
            print(f"Caché corrupta, reconstruyendo: {e}")
            os.remove(ruta)

    print("Construyendo TMY desde archivos JSON locales...")
    df = construye_tmy_desde_jsons(lat, lon)
    df.to_csv(ruta, index=False)
    print(f"TMY guardado en caché: {ruta}")
    return df