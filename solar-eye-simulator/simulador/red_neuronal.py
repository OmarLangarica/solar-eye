"""
Red neuronal para predicción de factores de estacionalidad
del consumo eléctrico en México.
Entrenada con datos del gobierno: consumo_final_electricidad_gwh (2016-2025)
"""
import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import MinMaxScaler

MODELO_PATH = os.path.join(os.path.dirname(__file__), "..", "datos", "modelo_estacionalidad.pkl")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "..", "datos", "scaler_estacionalidad.pkl")
DATOS_PATH  = os.path.join(os.path.dirname(__file__), "..", "datos", "consumo_electrico_mexico.csv")


def preprocesa_datos() -> pd.DataFrame:
    df = pd.read_csv(DATOS_PATH)
    df.columns = [c.strip() for c in df.columns]

    # Conversión manual sin pd.to_datetime (evita cuelgues en Windows)
    df["mes"]  = df["fecha"].str[5:7].astype(int)
    df["anio"] = df["fecha"].str[0:4].astype(int)
    df["consumo"] = pd.to_numeric(df["consumo_final_electricidad_gwh"], errors="coerce")
    df = df.dropna(subset=["consumo"])

    df["promedio_anual"] = df.groupby("anio")["consumo"].transform("mean")
    df["factor"]         = df["consumo"] / df["promedio_anual"]

    return df[["mes", "anio", "consumo", "factor"]].reset_index(drop=True)


def entrena_modelo() -> dict:
    """
    Entrena la red neuronal y guarda el modelo.
    Retorna métricas de entrenamiento.
    """
    os.makedirs(os.path.dirname(MODELO_PATH), exist_ok=True)

    df = preprocesa_datos()

    # Features: mes (one-hot) + año normalizado
    X = pd.get_dummies(df["mes"].astype(str).rename("mes"), prefix="mes")
    # Asegurar los 12 meses aunque falten algunos
    for m in range(1, 13):
        col = f"mes_{m}"
        if col not in X.columns:
            X[col] = 0
    X = X[[f"mes_{m}" for m in range(1, 13)]]

    # Agregar año normalizado como feature adicional
    X["anio_norm"] = (df["anio"] - df["anio"].min()) / (df["anio"].max() - df["anio"].min())

    y = df["factor"].values

    # Escalar
    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X)

    # Red neuronal
    modelo = MLPRegressor(
        hidden_layer_sizes=(64, 32, 16),
        activation="relu",
        max_iter=2000,
        random_state=42,
        learning_rate_init=0.001,
        early_stopping=True,
        validation_fraction=0.1,
        n_iter_no_change=50
    )

    modelo.fit(X_scaled, y)

    # Guardar modelo y scaler
    joblib.dump(modelo, MODELO_PATH)
    joblib.dump(scaler, SCALER_PATH)

    # Métricas
    y_pred = modelo.predict(X_scaled)
    mae    = float(np.mean(np.abs(y - y_pred)))
    r2     = float(1 - np.sum((y - y_pred)**2) / np.sum((y - np.mean(y))**2))

    print(f"Modelo entrenado — MAE: {mae:.4f}, R²: {r2:.4f}")
    return {"mae": mae, "r2": r2, "muestras": len(df)}


def carga_modelo():
    """Carga el modelo y scaler desde disco."""
    if not os.path.exists(MODELO_PATH):
        raise FileNotFoundError(
            "Modelo no entrenado. Llama primero a POST /entrenar-modelo"
        )
    modelo = joblib.load(MODELO_PATH)
    scaler = joblib.load(SCALER_PATH)
    return modelo, scaler


def predice_factores_estacionalidad(anio_ref: int = 2025) -> list[dict]:
    """
    Predice el factor de estacionalidad para los 12 meses.
    Retorna lista con factor y consumo relativo por mes.
    """
    modelo, scaler = carga_modelo()

    nombres_meses = [
        "Enero", "Febrero", "Marzo", "Abril",
        "Mayo", "Junio", "Julio", "Agosto",
        "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]

    resultados = []
    for mes in range(1, 13):
        # Construir vector de features
        x = {f"mes_{m}": 1 if m == mes else 0 for m in range(1, 13)}
        x["anio_norm"] = 1.0  # año más reciente

        X = pd.DataFrame([x])
        X_scaled = scaler.transform(X)

        factor = float(modelo.predict(X_scaled)[0])
        factor = round(max(0.5, min(2.0, factor)), 4)  # limitar a rango razonable

        resultados.append({
            "mes": nombres_meses[mes - 1],
            "numero_mes": mes,
            "factor_estacionalidad": factor
        })

    return resultados


def predice_consumo_mensual(consumo_base_kwh: float) -> list[dict]:
    """
    Dado el consumo base del cliente (de su recibo CFE),
    predice el consumo estimado para cada mes del año.
    """
    factores = predice_factores_estacionalidad()

    # El consumo base es el promedio mensual del cliente
    # Ajustamos para que la suma anual sea consistente
    suma_factores = sum(f["factor_estacionalidad"] for f in factores)

    resultado = []
    for f in factores:
        # Normalizar para que el promedio de factores sea 1.0
        factor_norm  = f["factor_estacionalidad"] / (suma_factores / 12)
        consumo_mes  = round(consumo_base_kwh * factor_norm, 2)

        resultado.append({
            "mes":                    f["mes"],
            "numero_mes":             f["numero_mes"],
            "factor_estacionalidad":  round(factor_norm, 4),
            "consumo_estimado_kwh":   consumo_mes
        })

    return resultado