# solar-eye

## Calidad del aire y estimación de suciedad

El backend obtiene lluvia diaria de NASA POWER y partículas PM2.5/PM10 de CAMS Global mediante Open-Meteo. Las concentraciones horarias se promedian por día y alimentan el modelo HSU; si no hay datos de partículas, la simulación conserva el modelo de referencia `TASA_POR_NIVEL`.

Para uso comercial configura una suscripción de Open-Meteo y define `OPEN_METEO_API_KEY` en el archivo `.env` junto a `docker-compose.yml`. Compose la entrega al backend. La API pública sin clave es solo para desarrollo y pruebas no comerciales. La interfaz atribuye los datos a CAMS Global/Open-Meteo.