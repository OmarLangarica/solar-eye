import pandas as pd
import numpy as np
import os
import json
import hashlib

CACHE_DIR = os.path.join(os.path.dirname(__file__), "..", "cache_tmy")
DATA_DIR  = os.path.join(os.path.dirname(__file__), "..")


def _cache_path(lat: float, lon: float) -> str:
    os.makedirs(CACHE_DIR, exist_ok=True)
    key = f"{round(lat, 3)}_{round(lon, 3)}"
    nombre = hashlib.md5(key.encode()).hexdigest()
    return os.path.join(CACHE_DIR, f"tmy_{nombre}.csv")


def _parsea_json_nasa(data: dict) -> pd.DataFrame:
    p = data["properties"]["parameter"]

    keys = list(p.get("ALLSKY_SFC_SW_DWN", {}).keys())

    import numpy as np
    months = np.array([int(k[4:6]) for k in keys])
    hours  = np.array([int(k[8:10]) for k in keys])
    days_in_month = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
    days  = np.array([days_in_month[int(k[4:6])-1] + int(k[6:8]) for k in keys])
    weeks = np.array([(d - 1) // 7 + 1 for d in days])

    # Columnas numéricas separadas para poder hacer replace/clip
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


def construye_tmy_desde_jsons() -> pd.DataFrame:
    archivos = ["q1.json", "q2.json", "q3.json", "q4.json"]
    frames = []

    for archivo in archivos:
        ruta = os.path.join(DATA_DIR, archivo)
        if not os.path.exists(ruta):
            raise FileNotFoundError(f"Archivo {archivo} no encontrado en {DATA_DIR}.")
        print(f"  Abriendo {archivo}...")
        with open(ruta, "r", encoding="utf-8") as f:
            data = json.load(f)
        print(f"  JSON cargado OK")
        df = _parsea_json_nasa(data)
        frames.append(df)
        print(f"  {archivo} OK: {len(df)} horas")

    df_anual = pd.concat(frames, ignore_index=True)

    # Ordenar cronológicamente por la clave original '2019010100'
    df_anual = df_anual.sort_values("time_key").reset_index(drop=True)
    df_anual = df_anual.drop(columns=["time_key"])

    print(f"TMY construido: {len(df_anual)} horas totales")
    return df_anual

def obtiene_tmy(lat: float, lon: float) -> pd.DataFrame:
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
    df = construye_tmy_desde_jsons()
    df.to_csv(ruta, index=False)
    print(f"TMY guardado en caché: {ruta}")
    return df