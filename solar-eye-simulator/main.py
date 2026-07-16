from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator, model_validator
import traceback
import math
from simulador.motor import simula_sistema

app = FastAPI(title="Solar Eye Simulator", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def detecta_timezone(lat: float, lon: float) -> str:
    """
    Detecta timezone basada en coordenadas geográficas.
    Usa timezonefinder si está disponible, fallback a estimación por longitud.
    """
    try:
        from timezonefinder import TimezoneFinder
        tf = TimezoneFinder()
        tz = tf.timezone_at(lat=lat, lng=lon)
        if tz:
            return tz
    except ImportError:
        pass

    # Fallback: estimación por offset de longitud (UTC±)
    # Cada 15° de longitud = 1 hora de diferencia
    offset_horas = round(lon / 15.0)
    offset_horas = max(-12, min(14, offset_horas))

    if offset_horas >= 0:
        return f"Etc/GMT-{offset_horas}"
    else:
        return f"Etc/GMT+{abs(offset_horas)}"


class ParametrosSimulacion(BaseModel):
    lat: float = Field(..., ge=-90.0, le=90.0,
        description="Latitud en grados decimales (-90 a 90)")
    lon: float = Field(..., ge=-180.0, le=180.0,
        description="Longitud en grados decimales (-180 a 180)")
    tilt: float = Field(15.0, ge=0.0, le=90.0,
        description="Inclinación del panel en grados (0 horizontal, 90 vertical)")
    azimut: float = Field(180.0, ge=0.0, le=360.0,
        description="Azimut en grados (0/360=Norte, 90=Este, 180=Sur, 270=Oeste)")
    potencia_kwp: float = Field(..., gt=0.0, le=10000.0,
        description="Potencia pico instalada en kWp (> 0)")
    area_util_m2: float = Field(..., gt=0.0, le=100000.0,
        description="Área útil del techo en m² (> 0)")
    factor_sombra: float = Field(0.95, ge=0.0, le=1.0,
        description="Factor de sombra (0=sombra total, 1=sin sombra)")
    eficiencia_panel: float = Field(0.205, gt=0.0, le=1.0,
        description="Eficiencia del panel en fracción (0 a 1)")
    coef_temp_panel: float = Field(-0.0035, ge=-0.01, le=0.0,
        description="Coeficiente de temperatura de potencia (%/°C, debe ser negativo)")
    eficiencia_inversor: float = Field(0.97, gt=0.0, le=1.0,
        description="Eficiencia del inversor en fracción (0 a 1)")

    @model_validator(mode="after")
    def verifica_consistencia_area_potencia(self):
        """
        Verifica que el área y la potencia sean consistentes.
        potencia_kwp debería aproximarse a area_util_m2 × eficiencia_panel.
        Tolerancia ±50% para permitir flexibilidad en configuraciones reales.
        """
        potencia_por_area = self.area_util_m2 * self.eficiencia_panel
        if potencia_por_area > 0:
            discrepancia = abs(self.potencia_kwp - potencia_por_area) / potencia_por_area
            if discrepancia > 0.5:
                raise ValueError(
                    f"Inconsistencia entre área y potencia: "
                    f"área de {self.area_util_m2}m² con eficiencia {self.eficiencia_panel} "
                    f"implica {potencia_por_area:.2f} kWp, "
                    f"pero se indicó {self.potencia_kwp} kWp "
                    f"(diferencia: {discrepancia*100:.0f}%). "
                    f"Verifica los parámetros."
                )
        return self


@app.get("/")
def health():
    return {
        "status": "ok",
        "servicio": "Solar Eye Simulator",
        "version": "2.0.0"
    }


@app.post("/simular")
async def simular(params: ParametrosSimulacion):
    try:
        # Detectar timezone automáticamente
        tz = detecta_timezone(params.lat, params.lon)
        print(f"Timezone detectada: {tz} para lat={params.lat}, lon={params.lon}")

        resultado = simula_sistema(
            lat=params.lat,
            lon=params.lon,
            tilt=params.tilt,
            azimut=params.azimut,
            potencia_kwp=params.potencia_kwp,
            area_util_m2=params.area_util_m2,
            factor_sombra=params.factor_sombra,
            eficiencia_panel=params.eficiencia_panel,
            coef_temp_panel=params.coef_temp_panel,
            eficiencia_inversor=params.eficiencia_inversor,
            tz=tz
        )

        resultado["timezone_detectada"] = tz
        return {"ok": True, "resultado": resultado}

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")


@app.get("/ping-pvgis")
async def ping_pvgis():
    try:
        from simulador.pvgis import obtiene_tmy
        df = obtiene_tmy(24.80, -107.38)
        return {
            "ok": True,
            "filas": len(df),
            "columnas": list(df.columns),
            "fuente": "PVGIS TMY"
        }
    except Exception as e:
        return {"ok": False, "error": str(e)}


@app.get("/test-simulacion")
async def test_simulacion():
    """Endpoint de prueba con sistema consistente para Culiacán"""
    area_util = 75.0
    eficiencia = 0.205
    potencia_kwp = round(area_util * eficiencia, 3)

    try:
        tz = detecta_timezone(24.80, -107.38)
        resultado = simula_sistema(
            lat=24.80,
            lon=-107.38,
            tilt=15.0,
            azimut=180.0,
            potencia_kwp=potencia_kwp,
            area_util_m2=area_util,
            factor_sombra=0.95,
            eficiencia_panel=eficiencia,
            coef_temp_panel=-0.0035,
            eficiencia_inversor=0.97,
            tz=tz
        )
        resultado["timezone_detectada"] = tz
        return {"ok": True, "resultado": resultado}
    except Exception as e:
        traceback.print_exc()
        return {"ok": False, "error": str(e)}


@app.get("/test-escalabilidad")
async def test_escalabilidad():
    """
    Verifica que 10 kWp produzca ~el doble que 5 kWp.
    Ambos sistemas usan el mismo ángulo y ubicación.
    """
    try:
        tz = detecta_timezone(24.80, -107.38)

        resultado_5kwp = simula_sistema(
            lat=24.80, lon=-107.38, tilt=15.0, azimut=180.0,
            potencia_kwp=5.0, area_util_m2=5.0 / 0.205,
            factor_sombra=1.0, eficiencia_panel=0.205,
            coef_temp_panel=-0.0035, eficiencia_inversor=0.97, tz=tz
        )

        resultado_10kwp = simula_sistema(
            lat=24.80, lon=-107.38, tilt=15.0, azimut=180.0,
            potencia_kwp=10.0, area_util_m2=10.0 / 0.205,
            factor_sombra=1.0, eficiencia_panel=0.205,
            coef_temp_panel=-0.0035, eficiencia_inversor=0.97, tz=tz
        )

        prod_5 = resultado_5kwp["produccion_anual_kwh"]
        prod_10 = resultado_10kwp["produccion_anual_kwh"]
        ratio = prod_10 / prod_5 if prod_5 > 0 else 0

        return {
            "ok": True,
            "produccion_5kwp": prod_5,
            "produccion_10kwp": prod_10,
            "ratio_10_vs_5": round(ratio, 4),
            "escala_correcta": abs(ratio - 2.0) < 0.01,
            "esperado": "ratio debe ser exactamente 2.0000"
        }
    except Exception as e:
        traceback.print_exc()
        return {"ok": False, "error": str(e)}
    
@app.get("/debug-irradiancia")
async def debug_irradiancia():
    from simulador.pvgis import obtiene_tmy
    df = obtiene_tmy(24.80, -107.38)
    return {
        "ghi_max": float(df["G(h)"].max()),
        "ghi_promedio_diurno": float(df[df["G(h)"] > 0]["G(h)"].mean()),
        "ghi_anual_suma": float(df["G(h)"].sum()),
        "total_horas": len(df),
        "horas_con_sol": int((df["G(h)"] > 0).sum()),
        "muestra_primeras_15": df[["G(h)", "Gd(h)", "Gb(n)", "T2m", "Hour_of_Day", "Day_of_Year", "Month_of_Year"]].head(15).to_dict()
    }

@app.get("/debug-poa")
async def debug_poa():
    from simulador.pvgis import obtiene_tmy
    from simulador.solar_math import calc_poa_completo

    df = obtiene_tmy(24.80, -107.38)

    resultados = {}
    for tmz in [-8, -7, -6, 0, 7]:
        poa_df = calc_poa_completo(
            df=df,
            latitude=24.80,
            longitude=-107.38,
            surface_pitch=15.0,
            surface_azimuth=0,
            albedo=0.2,
            refraction_index=0.1,
            tmz_hrs_east=tmz
        )
        resultados[f"tmz_{tmz}"] = {
            "poa_anual_kwh_m2": round(float(poa_df["poa_global"].sum() / 1000), 2),
            "poa_max_wm2": round(float(poa_df["poa_global"].max()), 2)
        }

    return resultados


from simulador.electrico import calcula_strings
from pydantic import BaseModel, Field

class ParametrosElectricos(BaseModel):
    # Panel
    cantidad_paneles: int = Field(..., gt=0)
    voc_panel: float = Field(..., gt=0)
    vmp_panel: float = Field(..., gt=0)
    isc_panel: float = Field(..., gt=0)
    imp_panel: float = Field(..., gt=0)
    coef_temp_voc: float = Field(..., lt=0)
    # Inversor
    voltaje_mppt_min: float = Field(..., gt=0)
    voltaje_mppt_max: float = Field(..., gt=0)
    voltaje_max_entrada: float = Field(..., gt=0)
    corriente_max_entrada: float = Field(..., gt=0)
    numero_mppt: int = Field(..., gt=0)
    numero_entradas_por_mppt: int = Field(..., gt=0)
    # Sitio
    temp_min_sitio: float = Field(5.0)
    temp_max_celda: float = Field(70.0)


@app.post("/electrico/strings")
async def calcular_strings(params: ParametrosElectricos):
    try:
        resultado = calcula_strings(
            cantidad_paneles=params.cantidad_paneles,
            voc_panel=params.voc_panel,
            vmp_panel=params.vmp_panel,
            isc_panel=params.isc_panel,
            imp_panel=params.imp_panel,
            coef_temp_voc=params.coef_temp_voc,
            voltaje_mppt_min=params.voltaje_mppt_min,
            voltaje_mppt_max=params.voltaje_mppt_max,
            voltaje_max_entrada=params.voltaje_max_entrada,
            corriente_max_entrada=params.corriente_max_entrada,
            numero_mppt=params.numero_mppt,
            numero_entradas_por_mppt=params.numero_entradas_por_mppt,
            temp_min_sitio=params.temp_min_sitio,
            temp_max_celda=params.temp_max_celda
        )
        return {"ok": True, "resultado": resultado}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/test-electrico")
async def test_electrico():
    """Prueba con Jinko Tiger Neo + Huawei SUN2000-15KTL-M2"""
    resultado = calcula_strings(
        cantidad_paneles=30,
        voc_panel=51.80,
        vmp_panel=43.38,
        isc_panel=14.15,
        imp_panel=13.25,
        coef_temp_voc=-0.0024,
        voltaje_mppt_min=140.0,
        voltaje_mppt_max=980.0,
        voltaje_max_entrada=1080.0,
        corriente_max_entrada=22.0,
        numero_mppt=4,
        numero_entradas_por_mppt=1,
        temp_min_sitio=5.0,
        temp_max_celda=70.0
    )
    return {"ok": True, "resultado": resultado}