"""
Motor matemático de cálculo solar.
Adaptado del script PVGIS TMY + POA Calculator.
No requiere APIs externas — cálculo 100% local.
"""
import pandas as pd
import numpy as np
from numpy import radians, degrees, cos, sin, arccos, pi


def calc_declination(n_day):
    return 23.45 * sin(radians((360 / 365) * (284 + n_day)))


def calc_time_correction(n_day):
    B = radians(360 * (n_day - 1) / 365)
    return 3.82 * (
        0.000075 + 0.001868 * cos(B) - 0.032077 * sin(B)
        - 0.014615 * cos(2 * B) - 0.04089 * sin(2 * B)
    )


def calc_solar_time(n_day, civil_time, longitude, timestep=60, tmz_hrs_east=0):
    tc = calc_time_correction(n_day)
    return (civil_time + ((timestep / 60) / 2)) + (longitude / 15) - tmz_hrs_east + tc


def calc_hour_angle(n_day, civil_time, longitude, timestep=60, tmz_hrs_east=0):
    st = calc_solar_time(n_day, civil_time, longitude, timestep, tmz_hrs_east)
    return (st - 12) * 15


def calc_aoi(n_day, civil_time, latitude, longitude,
             surface_azimuth, surface_pitch, timestep=60, tmz_hrs_east=0):
    ha_rad = radians(calc_hour_angle(n_day, civil_time, longitude, timestep, tmz_hrs_east))
    dec_rad = radians(calc_declination(n_day))
    lat_rad = radians(latitude)
    pitch_rad = radians(surface_pitch)
    az_rad = radians(surface_azimuth)

    aoi = arccos(
        (sin(dec_rad) * sin(lat_rad) * cos(pitch_rad))
        - (sin(dec_rad) * cos(lat_rad) * sin(pitch_rad) * cos(az_rad))
        + (cos(dec_rad) * cos(lat_rad) * cos(pitch_rad) * cos(ha_rad))
        + (cos(dec_rad) * sin(lat_rad) * sin(pitch_rad) * cos(az_rad) * cos(ha_rad))
        + (cos(dec_rad) * sin(pitch_rad) * sin(az_rad) * sin(ha_rad))
    )
    return degrees(aoi)


def calc_zenith(latitude, longitude, n_day, civil_time, timestep=60, tmz_hrs_east=0):
    lat_rad = radians(latitude)
    dec_rad = radians(calc_declination(n_day))
    ha_rad = radians(calc_hour_angle(n_day, civil_time, longitude, timestep, tmz_hrs_east))
    return degrees(arccos(
        (cos(lat_rad) * cos(dec_rad) * cos(ha_rad)) + (sin(lat_rad) * sin(dec_rad))
    ))


def calc_beam_radiation(dni, n_day, civil_time, latitude, longitude,
                        surface_azimuth, surface_pitch, timestep=60, tmz_hrs_east=0):
    aoi_val = calc_aoi(n_day, civil_time, latitude, longitude,
                       surface_azimuth, surface_pitch, timestep, tmz_hrs_east)
    aoi_rad = radians(aoi_val)
    e_beam = dni * cos(aoi_rad)
    e_beam = np.where(aoi_val > 85, 0, e_beam)
    e_beam = np.where(e_beam < 0, 0, e_beam)
    return e_beam


def calc_diffuse_radiation(dhi, ghi, surface_pitch, latitude, longitude,
                           n_day, civil_time, timestep=60, tmz_hrs_east=0):
    pitch_rad = radians(surface_pitch)
    zenith_val = calc_zenith(latitude, longitude, n_day, civil_time, timestep, tmz_hrs_east)
    zenith_rad = radians(zenith_val)
    e_diffuse = (dhi * ((1 + cos(pitch_rad)) / 2)) + (
        ghi * ((0.12 * zenith_rad) - 0.04) * (1 - cos(pitch_rad)) / 2
    )
    e_diffuse = np.where(zenith_val > 85, 0, e_diffuse)
    return e_diffuse


def calc_ground_radiation(ghi, surface_pitch, albedo=0.2):
    pitch_rad = radians(surface_pitch)
    return ghi * albedo * ((1 - cos(pitch_rad)) / 2)


def iam_losses(aoi, refraction_index=0.1):
    iam = 1 - refraction_index * ((1 / cos(radians(aoi))) - 1)
    iam = np.where(aoi > 85, 0, iam)
    return iam


def calc_poa_completo(df: pd.DataFrame, latitude: float, longitude: float,
                      surface_pitch: float, surface_azimuth: float,
                      albedo: float = 0.2, refraction_index: float = 0.1,
                      tmz_hrs_east: float = 0) -> pd.DataFrame:
    """
    Calcula irradiancia POA completa a partir de datos TMY.
    
    Parámetros de entrada (df debe tener columnas):
        G(h)   — GHI en W/m²
        Gb(n)  — DNI en W/m²
        Gd(h)  — DHI en W/m²
        T2m    — Temperatura en °C
        WS10m  — Velocidad viento en m/s
        Hour_of_Day, Day_of_Year, Month_of_Year

    Retorna DataFrame con POA y datos meteorológicos.
    """
    hour = df["Hour_of_Day"].to_numpy()
    day  = df["Day_of_Year"].to_numpy()
    month = df["Month_of_Year"].to_numpy()
    dni  = df["Gb(n)"].to_numpy()
    dhi  = df["Gd(h)"].to_numpy()
    ghi  = df["G(h)"].to_numpy()
    temp = df["T2m"].to_numpy()
    wind = df["WS10m"].to_numpy()

    # AOI y ángulos solares
    aoi_arr     = calc_aoi(day, hour, latitude, longitude,
                           surface_azimuth, surface_pitch, 60, tmz_hrs_east)
    zenith_arr  = calc_zenith(latitude, longitude, day, hour, 60, tmz_hrs_east)

    # Componentes POA
    e_beam    = calc_beam_radiation(dni, day, hour, latitude, longitude,
                                    surface_azimuth, surface_pitch, 60, tmz_hrs_east)
    e_diffuse = calc_diffuse_radiation(dhi, ghi, surface_pitch, latitude, longitude,
                                       day, hour, 60, tmz_hrs_east)
    e_ground  = calc_ground_radiation(ghi, surface_pitch, albedo)

    # POA total y POA del panel (con pérdidas IAM)
    e_poa       = e_beam + e_diffuse + e_ground
    panel_poa   = e_beam * iam_losses(aoi_arr, refraction_index) + e_diffuse + e_ground

    return pd.DataFrame({
        "ghi":          ghi,
        "poa_global":   e_poa,          # W/m² — irradiancia POA total
        "panel_poa":    panel_poa,      # W/m² — POA con pérdidas IAM
        "e_beam":       e_beam,
        "e_diffuse":    e_diffuse,
        "e_ground":     e_ground,
        "temp_air":     temp,           # °C
        "wind_speed":   wind,           # m/s
        "aoi":          aoi_arr,        # grados
        "zenith":       zenith_arr,     # grados
        "month":        month,
    }, index=df.index)