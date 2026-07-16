"""
Modelado eléctrico de sistemas fotovoltaicos.
Calcula configuración de strings, voltajes reales y compatibilidad MPPT.
"""
import math


def calcula_strings(
    cantidad_paneles: int,
    voc_panel: float,
    vmp_panel: float,
    isc_panel: float,
    imp_panel: float,
    coef_temp_voc: float,
    voltaje_mppt_min: float,
    voltaje_mppt_max: float,
    voltaje_max_entrada: float,
    corriente_max_entrada: float,
    numero_mppt: int,
    numero_entradas_por_mppt: int,
    temp_min_sitio: float = 5.0,
    temp_max_celda: float = 70.0
) -> dict:
    """
    Calcula la configuración óptima de strings para un sistema FV.

    Parámetros eléctricos STC (25°C):
    - voc_panel: Voltaje de circuito abierto (V)
    - vmp_panel: Voltaje de máxima potencia (V)
    - isc_panel: Corriente de cortocircuito (A)
    - imp_panel: Corriente de máxima potencia (A)
    - coef_temp_voc: Coeficiente temperatura Voc (%/°C)

    Condiciones extremas:
    - temp_min_sitio: Temperatura mínima del sitio (°C) — maximiza Voc
    - temp_max_celda: Temperatura máxima de celda (°C) — minimiza Vmp
    """

    # ─── 1. Voltajes ajustados por temperatura ───────────────────
    # Voc máximo ocurre en temperatura mínima (día frío de invierno)
    # ΔV = Voc × coef_temp_voc × (T_min - T_ref)
    delta_T_frio = temp_min_sitio - 25.0
    factor_voc_frio = 1.0 + (coef_temp_voc * delta_T_frio)
    voc_frio = voc_panel * factor_voc_frio  # Voc máximo real

    # Vmp mínimo ocurre en temperatura máxima de celda
    delta_T_calor = temp_max_celda - 25.0
    factor_vmp_calor = 1.0 + (coef_temp_voc * delta_T_calor)
    vmp_calor = vmp_panel * factor_vmp_calor  # Vmp mínimo real

    # ─── 2. Límites de paneles en serie por string ───────────────
    # Límite superior: Voc_frio × n ≤ voltaje_max_entrada (seguridad)
    max_paneles_serie_voc = math.floor(voltaje_max_entrada / voc_frio)

    # Límite superior MPPT: Vmp_calor × n ≤ voltaje_mppt_max
    max_paneles_serie_mppt_max = math.floor(voltaje_mppt_max / vmp_calor)

    # Límite inferior MPPT: Vmp_calor × n ≥ voltaje_mppt_min
    min_paneles_serie_mppt = math.ceil(voltaje_mppt_min / vmp_calor)

    # Paneles por string: máximo compatible con todos los límites
    max_serie = min(max_paneles_serie_voc, max_paneles_serie_mppt_max)
    min_serie = min_paneles_serie_mppt

    if max_serie < min_serie:
        return {
            "error": f"No es posible configurar strings válidos. "
                     f"Mín paneles/string={min_serie}, Máx={max_serie}. "
                     f"Considera un inversor con mayor rango MPPT."
        }

    # ─── 3. Entradas disponibles en el inversor ──────────────────
    total_entradas = numero_mppt * numero_entradas_por_mppt

    # ─── 4. Configuración óptima ─────────────────────────────────
    mejor_config = None
    mejor_perdida = float('inf')

    # Probar diferentes tamaños de string
    for paneles_serie in range(max_serie, min_serie - 1, -1):
        if paneles_serie <= 0:
            continue

        # Strings necesarios para cubrir todos los paneles
        strings_necesarios = math.ceil(cantidad_paneles / paneles_serie)

        if strings_necesarios > total_entradas:
            continue  # No caben en el inversor

        # Paneles reales instalados (puede haber un string incompleto)
        paneles_reales = paneles_serie * strings_necesarios
        paneles_sobrantes = paneles_reales - cantidad_paneles

        # Voltajes y corrientes del arreglo
        voc_string  = voc_panel * paneles_serie
        vmp_string  = vmp_panel * paneles_serie
        voc_frio_string = voc_frio * paneles_serie
        vmp_calor_string = vmp_calor * paneles_serie
        isc_total   = isc_panel * strings_necesarios
        imp_total   = imp_panel * strings_necesarios

        # Validaciones eléctricas
        voc_ok  = voc_frio_string <= voltaje_max_entrada
        mppt_ok = voltaje_mppt_min <= vmp_calor_string <= voltaje_mppt_max

        # Corriente por MPPT (no total) — cada MPPT maneja sus propios strings
        strings_por_mppt = math.ceil(strings_necesarios / numero_mppt)
        isc_por_mppt = isc_panel * strings_por_mppt
        isc_ok = isc_por_mppt <= corriente_max_entrada

        if not (voc_ok and mppt_ok):
            continue

        # Pérdida por paneles sobrantes (menos es mejor)
        perdida = paneles_sobrantes

        if perdida < mejor_perdida:
            mejor_perdida = perdida
            mejor_config = {
                "paneles_serie": paneles_serie,
                "strings_paralelo": strings_necesarios,
                "paneles_totales": paneles_reales,
                "paneles_originales": cantidad_paneles,
                "paneles_ajustados": paneles_sobrantes,
                # Voltajes STC
                "voc_string_v": round(voc_string, 2),
                "vmp_string_v": round(vmp_string, 2),
                # Voltajes ajustados por temperatura
                "voc_frio_string_v": round(voc_frio_string, 2),
                "vmp_calor_string_v": round(vmp_calor_string, 2),
                # Corrientes
                "isc_total_a": round(isc_total, 2),
                "imp_total_a": round(imp_total, 2),
                "isc_por_mppt_a": round(isc_por_mppt, 2),
                "strings_por_mppt": strings_por_mppt,
                "corriente_dentro_limite": isc_ok,
                # Potencia DC
                "potencia_dc_kw": round((vmp_string * imp_total) / 1000, 2),
                # Validaciones
                "voc_dentro_limite": voc_ok,
                "mppt_dentro_rango": mppt_ok,
                "corriente_dentro_limite": isc_ok,
                # Temperaturas usadas
                "temp_min_sitio_c": temp_min_sitio,
                "temp_max_celda_c": temp_max_celda,
                # Límites del inversor
                "voltaje_mppt_min_v": voltaje_mppt_min,
                "voltaje_mppt_max_v": voltaje_mppt_max,
                "voltaje_max_entrada_v": voltaje_max_entrada,
            }

    if not mejor_config:
        return {
            "error": f"No se encontró configuración válida para {cantidad_paneles} paneles. "
                     f"Rango válido: {min_serie}-{max_serie} paneles/string, "
                     f"{total_entradas} entradas disponibles."
        }

    # ─── 5. Compatibilidad general ───────────────────────────────
    cfg = mejor_config
    compatible = (
        cfg["voc_dentro_limite"] and
        cfg["mppt_dentro_rango"] and
        cfg["corriente_dentro_limite"]
    )

    cfg["compatible"] = compatible
    cfg["resumen"] = (
        f"{cfg['strings_paralelo']} strings × {cfg['paneles_serie']} paneles/string | "
        f"Voc={cfg['voc_frio_string_v']}V (máx {voltaje_max_entrada}V) | "
        f"Vmp={cfg['vmp_calor_string_v']}V (MPPT {voltaje_mppt_min}-{voltaje_mppt_max}V)"
    )

    # ─── 6. Sugerencia si hay incompatibilidad por corriente ─────
    if not cfg["corriente_dentro_limite"]:
        # Calcular cuántos strings por MPPT son aceptables
        max_strings_por_mppt = math.floor(corriente_max_entrada / isc_panel)
        max_strings_total = max_strings_por_mppt * numero_mppt

        if max_strings_total < strings_necesarios:
            # Necesita más MPPT o inversor con mayor corriente
            cfg["sugerencia"] = (
                f"La corriente por MPPT ({cfg['isc_por_mppt_a']}A) excede el límite "
                f"del inversor ({corriente_max_entrada}A). "
                f"Opciones: "
                f"(1) Reducir a {max_strings_total} strings ({max_strings_total * cfg['paneles_serie']} paneles máximo), "
                f"(2) Usar un inversor con mayor corriente de entrada o más entradas MPPT."
            )
        else:
            cfg["sugerencia"] = (
                f"Redistribuir strings: máximo {max_strings_por_mppt} string(s) por MPPT "
                f"para no exceder {corriente_max_entrada}A."
            )
    else:
        cfg["sugerencia"] = None

    return cfg