# Solar Eye Simulator — Microservicio Python

Motor de simulación fotovoltaica basado en pvlib + NASA POWER.

## Requisitos
- Python 3.10+
- pip

## Instalación
```bash
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

## Datos meteorológicos
El simulador requiere datos horarios de NASA POWER para cada ubicación.
Descarga los 4 trimestres del año 2019 desde NASA POWER y colócalos en
la raíz del proyecto como q1.json, q2.json, q3.json, q4.json.

URL base: 
https://power.larc.nasa.gov/api/temporal/hourly/point?parameters=ALLSKY_SFC_SW_DWN,ALLSKY_SFC_SW_DIFF,ALLSKY_SFC_SW_DNI,T2M,WS10M&community=RE&longitude=LON&latitude=LAT&start=YYYYMMDD&end=YYYYMMDD&format=JSON&time-standard=UTC

## Arranque
```bash
uvicorn main:app --reload --port 8000
```

## Endpoints
- `GET /` — health check
- `POST /simular` — simulación completa
- `GET /test-simulacion` — prueba con Culiacán
- `GET /test-escalabilidad` — verifica linealidad del modelo
- `GET /ping-pvgis` — verifica fuente de datos