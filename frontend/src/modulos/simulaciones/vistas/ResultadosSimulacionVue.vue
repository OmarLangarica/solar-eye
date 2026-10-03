<template>
  <div class="contenedor">

    <nav class="navbar">
      <div class="navbar-brand">
        <img class="navbar-logo" :src="logoSolarEye" alt="Solar Eye" />
      </div>

      <div class="navbar-links">
        <button class="nav-link" @click="imprimirReporte" v-if="resultados">
          <i class="bi bi-printer"></i> Imprimir
        </button>
        <button class="nav-link" @click="descargarPDF" v-if="resultados">
          <i class="bi bi-file-earmark-pdf"></i> Descargar PDF
        </button>
        <button class="nav-link" @click="abrirAgendarCita" v-if="resultados">
          <i class="bi bi-calendar-plus"></i> Agendar cita
        </button>
        <button class="nav-link" @click="verCitasCliente" v-if="resultados && route.query.cliente_id">
          <i class="bi bi-calendar3"></i> Ver citas
        </button>
        <button class="nav-link" @click="volver">← Volver</button>
      </div>

      <div class="navbar-user">
        <span class="navbar-user-name">{{ authStore.usuario?.nombre }} {{ authStore.usuario?.apellido }}</span>
        <button class="nav-link" @click="cambiarEmpresa" aria-label="Cambiar de Empresa" title="Cambiar de Empresa"><i class="bi bi-building-down"></i></button>
        <button class="nav-link nav-link--logout" @click="cerrarSesion" aria-label="Cerrar sesión" title="Cerrar sesión">
                    <i class="bi bi-box-arrow-right" aria-hidden="true"></i>
                </button>
      </div>
    </nav>

    <div class="encabezado">
      <div>
        <h1>Resultados de Simulación</h1>
        <p>Cliente: <strong>{{ route.query.nombre }}</strong></p>
      </div>
    </div>

    <div class="pasos">
        <div class="paso completado">
            <div class="paso-numero">✓</div>
            <span>Datos generales</span>
        </div>
        <div class="paso-linea"></div>
        <div class="paso completado">
            <div class="paso-numero">✓</div>
            <span>Techo</span>
        </div>
        <div class="paso-linea"></div>
        <div class="paso completado">
            <div class="paso-numero">✓</div>
            <span>Componentes</span>
        </div>
        <div class="paso-linea"></div>
        <div class="paso completado">
            <div class="paso-numero">✓</div>
            <span>Consumo</span>
        </div>
        <div class="paso-linea"></div>
        <div class="paso activo">
            <div class="paso-numero">5</div>
            <span>Resultados</span>
        </div>
    </div>

    <div class="filtro-resultados" role="tablist" aria-label="Filtrar resultados">
        <span class="filtro-label">Ver apartado:</span>
        <button
          v-for="filtro in filtrosResultados"
          :key="filtro.id"
          type="button"
          class="filtro-opcion"
          :class="{ activo: filtroActivo === filtro.id }"
          :aria-selected="filtroActivo === filtro.id"
          role="tab"
          @click="filtroActivo = filtro.id"
        >
          <i :class="filtro.icono" aria-hidden="true"></i>
          {{ filtro.nombre }}
        </button>
    </div>

    <div v-if="cargando" class="cargando">
      <div class="spinner"></div>
      <span>Calculando simulación...</span>
    </div>

    <div v-else-if="resultados" id="reporte-area">

      <AgendarCitaModal v-if="mostrarModal" :clienteId="Number(route.query.cliente_id)" :simulacionId="simulacion_id" @close="mostrarModal=false" @saved="onCitaGuardada" />

      <div v-show="mostrarSeccion('resumen')" class="tarjetas-resumen">
        <div class="tarjeta tarjeta-produccion">
          <div class="tarjeta-icono"><i class="bi bi-lightning-charge"></i></div>
          <div class="tarjeta-info">
            <span class="tarjeta-label">Producción anual estimada</span>
            <span class="tarjeta-valor">{{ resultados.produccion_anual_kwh.toLocaleString() }} kWh</span>
          </div>
        </div>
        <div class="tarjeta tarjeta-ahorro">
          <div class="tarjeta-icono"><i class="bi bi-cash-coin"></i></div>
          <div class="tarjeta-info">
            <span class="tarjeta-label">Ahorro mensual estimado</span>
            <span class="tarjeta-valor">$ {{ resultados.ahorro_mensual_mxn.toLocaleString('es-MX', { minimumFractionDigits: 2 }) }}</span>
          </div>
        </div>
        <div class="tarjeta tarjeta-cobertura">
          <div class="tarjeta-icono"><i class="bi bi-bar-chart"></i></div>
          <div class="tarjeta-info">
            <span class="tarjeta-label">Cobertura anual estimada</span>
            <span class="tarjeta-valor">{{ resultados.porcentaje_cobertura.toFixed(1) }}%</span>
          </div>
        </div>
        <div class="tarjeta tarjeta-retorno">
          <div class="tarjeta-icono"><i class="bi bi-calendar-event"></i></div>
          <div class="tarjeta-info">
            <span class="tarjeta-label">Retorno estimado</span>
            <span class="tarjeta-valor">{{ resultados.retorno_inversion_anios.toFixed(1) }} años</span>
          </div>
        </div>
      </div>

      <div v-show="mostrarSeccion('resumen')" class="graficas-grid" v-if="resultados && consumo">
        <div class="card card-grafica">
          <h3><i class="bi bi-bar-chart-line"></i> Producción ideal vs. real por suciedad</h3>
          <p class="card-subtitulo">Comparación mensual con la pérdida estimada por lluvia y suciedad.</p>
          <div class="canvas-wrap">
            <canvas ref="comparativaCanvas"></canvas>
          </div>
        </div>

        <div class="card card-grafica">
          <h3><i class="bi bi-graph-up-arrow"></i> Proyección estimada a 25 años</h3>
          <p class="card-subtitulo">Usa el costo promedio del recibo y supuestos fijos; no reproduce una facturación de CFE.</p>
          <div class="payback-banner" v-if="textoPaybackEstimado">
            Retorno estimado en {{ textoPaybackEstimado }} años.
          </div>
          <div class="payback-banner sin-retorno" v-else>
            Con los datos actuales, el retorno no cruza la inversión en 25 años.
          </div>
          <div class="canvas-wrap">
            <canvas ref="proyeccionCanvas"></canvas>
          </div>
        </div>
      </div>

      <div class="grid-resultados" :class="`filtro-${filtroActivo}`">
        <!-- Card Performance Ratio y Pérdidas -->
      <div v-show="mostrarSeccion('tecnico')" class="card card-perdidas" v-if="resultados?.perdidas">
          <h3>
            <i class="bi bi-speedometer2"></i> Performance Ratio y pérdidas
            <span v-if="resultados.modelo_usado" class="modelo-suciedad">Modelo {{ resultados.modelo_usado }}</span>
          </h3>
          <div class="pr-display">
              <div class="pr-valor">{{ ((resultados.performance_ratio ?? 0) * 100).toFixed(1) }}%</div>
              <div class="pr-label">Performance Ratio</div>
              <div class="pr-escala">
                  <div class="pr-barra">
                      <div class="pr-fill"
                        :style="{ width: `${(resultados.performance_ratio ?? 0) * 100}%` }">
                      </div>
                  </div>
                  <div class="pr-rangos">
                      <span>0%</span>
                      <span class="pr-malo">60%</span>
                      <span class="pr-bueno">75%</span>
                      <span>100%</span>
                  </div>
              </div>
          </div>

          <div class="perdidas-grid">
              <div class="perdida-item">
                  <div class="perdida-barra-wrap">
                      <div class="perdida-barra"
                          :style="{ height: `${resultados.perdidas.temperatura_pct * 4}px` }">
                      </div>
                  </div>
                  <span class="perdida-valor">{{ resultados.perdidas.temperatura_pct }}%</span>
                  <span class="perdida-nombre">Temperatura</span>
              </div>
              <div class="perdida-item">
                  <div class="perdida-barra-wrap">
                      <div class="perdida-barra"
                      :style="{ height: `${(resultados.suciedad_pct_anual ?? resultados.perdidas.suciedad_pct) * 4}px` }">
                      </div>
                  </div>
                  <span class="perdida-valor">{{ resultados.suciedad_pct_anual ?? resultados.perdidas.suciedad_pct }}%</span>
                  <span class="perdida-nombre">Suciedad</span>
              </div>
                <div class="perdida-item" v-if="resultados.perdidas.iam_pct !== undefined">
                  <div class="perdida-barra-wrap">
                    <div class="perdida-barra" :style="{ height: `${resultados.perdidas.iam_pct * 4}px` }"></div>
                  </div>
                  <span class="perdida-valor">{{ resultados.perdidas.iam_pct }}%</span>
                  <span class="perdida-nombre">Reflexión IAM</span>
                </div>
                <div class="perdida-item" v-if="resultados.perdidas.inversor_pct !== undefined">
                  <div class="perdida-barra-wrap">
                    <div class="perdida-barra" :style="{ height: `${resultados.perdidas.inversor_pct * 4}px` }"></div>
                  </div>
                  <span class="perdida-valor">{{ resultados.perdidas.inversor_pct }}%</span>
                  <span class="perdida-nombre">Inversor</span>
                </div>
                <div class="perdida-item">
                  <div class="perdida-barra-wrap">
                      <div class="perdida-barra"
                          :style="{ height: `${resultados.perdidas.cableado_pct * 4}px` }">
                      </div>
                  </div>
                  <span class="perdida-valor">{{ resultados.perdidas.cableado_pct }}%</span>
                  <span class="perdida-nombre">Cableado</span>
              </div>
              <div class="perdida-item">
                  <div class="perdida-barra-wrap">
                      <div class="perdida-barra"
                          :style="{ height: `${resultados.perdidas.mismatch_pct * 4}px` }">
                      </div>
                  </div>
                  <span class="perdida-valor">{{ resultados.perdidas.mismatch_pct }}%</span>
                  <span class="perdida-nombre">Mismatch</span>
              </div>
              <div class="perdida-item">
                  <div class="perdida-barra-wrap">
                      <div class="perdida-barra"
                          :style="{ height: `${resultados.perdidas.sombra_pct * 4}px` }">
                      </div>
                  </div>
                  <span class="perdida-valor">{{ resultados.perdidas.sombra_pct }}%</span>
                  <span class="perdida-nombre">Sombras</span>
              </div>
              <div class="perdida-item">
                  <div class="perdida-barra-wrap">
                      <div class="perdida-barra"
                          :style="{ height: `${resultados.perdidas.disponibilidad_pct * 4}px` }">
                      </div>
                  </div>
                  <span class="perdida-valor">{{ resultados.perdidas.disponibilidad_pct }}%</span>
                  <span class="perdida-nombre">Disponibilidad</span>
              </div>
          </div>

          <div class="metodo-tag" v-if="resultados.metodo_simulacion">
              Calculado con: {{ resultados.metodo_simulacion }}
          </div>
      </div>

          <div v-if="resultados.mantenimiento_optimo" class="card card-mantenimiento">
            <h3><i class="bi bi-droplet-half"></i> ¿Conviene limpiar los paneles?</h3>
            <p class="card-subtitulo">
              Comparamos el costo de limpiar con el dinero que se pierde por la suciedad. Cada visita cuesta {{ resultados.mantenimiento_optimo.costo_limpieza_por_visita_mxn.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) }}.
            </p>
            <p v-if="resultados.fuente_datos_suciedad?.includes('Open-Meteo')" class="fuente-suciedad">
              Datos de contaminación del aire consultados en
              <a href="https://open-meteo.com/en/docs/air-quality-api" target="_blank" rel="noopener noreferrer">Open-Meteo</a>.
            </p>
            <div class="mantenimiento-resumen">
              <div>
                <span>Plan recomendado</span>
                <strong>{{ resultados.mantenimiento_optimo.intervalo_dias === null ? 'Sin limpieza manual' : `Cada ${resultados.mantenimiento_optimo.intervalo_dias} días` }}</strong>
              </div>
              <div>
                <span>Visitas al año</span>
                <strong>{{ resultados.mantenimiento_optimo.limpiezas_anuales }}</strong>
              </div>
              <div>
                <span>Costo anual de limpieza</span>
                <strong>{{ resultados.mantenimiento_optimo.costo_anual_limpiezas_mxn.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) }}</strong>
              </div>
              <div>
                <span>{{ resultados.mantenimiento_optimo.intervalo_dias === null ? 'Resultado' : 'Ahorro anual estimado' }}</span>
                <strong v-if="resultados.mantenimiento_optimo.intervalo_dias === null">No limpiar a mano</strong>
                <strong v-else class="ahorro-neto">{{ resultados.mantenimiento_optimo.ahorro_neto_mxn.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) }}</strong>
              </div>
            </div>
            <div class="calendario-limpieza">
              <strong>Fechas estimadas de limpieza</strong>
              <p>Son fechas aproximadas. La lluvia puede limpiar los paneles antes.</p>
              <div v-if="resultados.mantenimiento_optimo.fechas_limpieza_recomendadas.length" class="fechas-limpieza">
                <span v-for="fecha in resultados.mantenimiento_optimo.fechas_limpieza_recomendadas" :key="fecha">
                  {{ formateaFecha(fecha) }}
                </span>
              </div>
              <p v-else>Con estos datos, limpiar a mano cuesta más de lo que se ahorra.</p>
            </div>
            <div class="tabla-scroll">
              <p class="card-subtitulo">La energía perdida es el porcentaje que se estima perder por suciedad. En la última columna, un valor negativo significa gasto extra y uno positivo significa ahorro frente a no limpiar.</p>
              <table class="tabla-mensual tabla-escenarios">
                <thead>
                  <tr><th>Plan</th><th>Visitas al año</th><th>Energía perdida</th><th>Costo anual total</th><th>Diferencia frente a no limpiar</th></tr>
                </thead>
                <tbody>
                  <tr v-for="(escenario, indice) in resultados.mantenimiento_optimo.escenarios" :key="`${escenario.intervalo_dias ?? 'sin-limpieza'}-${indice}`">
                    <td>{{ escenario.intervalo_dias === null ? 'Sin limpieza manual' : `Cada ${escenario.intervalo_dias} días` }}</td>
                    <td>{{ escenario.limpiezas_anuales }}</td>
                    <td>{{ escenario.suciedad_pct_anual }}%</td>
                    <td>{{ escenario.costo_total_mxn.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) }}</td>
                    <td :class="escenario.ahorro_neto_mxn < 0 ? 'balance-negativo' : 'ahorro-neto'">{{ escenario.ahorro_neto_mxn.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

      <!-- Card producción mensual detallada -->
      <div v-show="mostrarSeccion('energia')" class="card card-produccion-detalle" v-if="resultados?.produccion_mensual_detalle">
          <h3><i class="bi bi-sun"></i> Producción mensual detallada (pvlib)</h3>
          <table class="tabla-mensual">
              <thead>
                  <tr>
                      <th>Mes</th>
                      <th>Producción ideal (kWh)</th>
                      <th>Producción real (kWh)</th>
                      <th>Suciedad estimada</th>
                      <th>Irradiancia POA (kWh/m²)</th>
                      <th>Temp. Celda (°C)</th>
                  </tr>
              </thead>
              <tbody>
                  <tr v-for="m in resultados.produccion_mensual_detalle" :key="m.numero_mes">
                      <td>{{ m.mes }}</td>
                      <td>{{ (m.produccion_ideal_kwh ?? m.produccion_kwh).toLocaleString('es-MX') }}</td>
                      <td class="valor-positivo">{{ (m.produccion_real_kwh ?? m.produccion_kwh).toLocaleString('es-MX') }}</td>
                      <td>{{ typeof m.perdida_suciedad_pct === 'number' ? `${m.perdida_suciedad_pct.toFixed(2)}%` : 'Sin datos' }}</td>
                      <td>{{ m.irradiancia_poa_kwh_m2 }}</td>
                      <td>{{ m.temp_celda_promedio_c }}°C</td>
                  </tr>
              </tbody>
          </table>
      </div>
        <div class="columna columna-economica">
          <div v-show="mostrarSeccion('finanzas')" class="card card-finanzas">
            <h3><i class="bi bi-cash-coin"></i> Análisis económico</h3>
            <div class="tabla-datos">
              <div class="fila-dato">
                <span>Inversión estimada</span>
                <span class="valor-destacado">$ {{ resultados.costo_total_instalacion_mxn.toLocaleString('es-MX', { minimumFractionDigits: 2 }) }} MXN</span>
              </div>
              <div class="fila-dato">
                <span>Ahorro mensual estimado</span>
                <span class="valor-positivo">$ {{ resultados.ahorro_mensual_mxn.toLocaleString('es-MX', { minimumFractionDigits: 2 }) }} MXN</span>
              </div>
              <div class="fila-dato">
                <span>Ahorro anual estimado</span>
                <span class="valor-positivo">$ {{ resultados.ahorro_anual_mxn.toLocaleString('es-MX', { minimumFractionDigits: 2 }) }} MXN</span>
              </div>
              <div class="fila-dato destacada fila-ahorro-25">
                <span>Ahorro estimado en 25 años</span>
                <span class="valor-positivo grande valor-ahorro-25">$ {{ resultados.ahorro_vida_util_mxn.toLocaleString('es-MX', { minimumFractionDigits: 2 }) }} MXN</span>
              </div>
              <div class="fila-dato">
                <span>Retorno de inversión</span>
                <span class="valor-destacado">{{ resultados.retorno_inversion_anios.toFixed(1) }} años</span>
              </div>
            </div>
          </div>

          <div v-show="mostrarSeccion('finanzas')" class="card card-finanzas">
            <h3><i class="bi bi-bar-chart"></i> Escenario estimado de costo de energía</h3>
            <p class="card-subtitulo">Con un incremento supuesto del {{ resultados.tasa_incremento_tarifa_pct }}% anual:</p>
            <div class="tabla-datos">
              <div class="fila-dato">
                <span>Costo promedio actual del recibo/kWh</span>
                <span>$ {{ Number(consumo?.tarifa_kwh_mxn ?? 0).toFixed(4) }} MXN</span>
              </div>
              <div class="fila-dato">
                <span>Costo promedio estimado en 5 años</span>
                <span class="valor-advertencia">$ {{ resultados.precio_kwh_proyectado_anio5.toFixed(4) }} MXN</span>
              </div>
              <div class="fila-dato">
                <span>Costo promedio estimado en 10 años</span>
                <span class="valor-advertencia">$ {{ resultados.precio_kwh_proyectado_anio10.toFixed(4) }} MXN</span>
              </div>
            </div>
            <p class="card-subtitulo">
              Estimación, no cotización: anualiza el consumo de un recibo, usa su costo promedio por kWh, un costo fijo de instalación de $18,000 MXN/kWp, un aumento supuesto de 5% y degradación de 0.5% anual. No modela estacionalidad, bloques, subsidios, cargos fijos, descuento financiero, reemplazo del inversor ni reglas de interconexión de CFE.
            </p>
          </div>
        </div>

        <div class="columna columna-energia">
          <div v-show="mostrarSeccion('energia')" class="card card-energia">
            <h3><i class="bi bi-lightning-charge"></i> Producción energética</h3>
            <div class="tabla-datos">
              <div class="fila-dato">
                <span>Producción anual</span>
                <span class="valor-destacado">{{ resultados.produccion_anual_kwh.toLocaleString() }} kWh</span>
              </div>
              <div class="fila-dato">
                <span>Producción mensual promedio</span>
                <span>{{ resultados.produccion_mensual_promedio_kwh.toLocaleString() }} kWh</span>
              </div>
              <div class="fila-dato">
                <span>Cobertura del consumo</span>
                <span class="valor-positivo">{{ resultados.porcentaje_cobertura.toFixed(1) }}%</span>
              </div>
              <div class="fila-dato">
                <span>Excedente a la red</span>
                <span>{{ resultados.excedente_kwh.toLocaleString() }} kWh</span>
              </div>
            </div>
            <p class="card-subtitulo">
              Equivalencias estimadas con factores fijos de 0.45 kg CO₂/kWh y 21.77 kg CO₂ por árbol; no son mediciones del sitio.
            </p>
            <div class="barra-container">
              <div class="barra-label">
                <span>Cobertura solar</span>
                <span>{{ resultados.porcentaje_cobertura.toFixed(1) }}%</span>
              </div>
              <div class="barra-fondo">
                <div class="barra-relleno" :style="{ width: `${Math.min(resultados.porcentaje_cobertura, 100)}%` }"></div>
              </div>
            </div>
              <!-- Advertencia de sobredimensionamiento -->
            <div class="advertencia-sobre" v-if="resultados.excedente_kwh > resultados.produccion_anual_kwh * 0.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 00-3.42 0z"/>
                </svg>
                El excedente anual estimado es de
                <strong>{{ resultados.excedente_kwh.toLocaleString('es-MX') }} kWh</strong>.
                Revisa la cantidad de módulos y el esquema de compensación: esta simulación no calcula créditos de energía CFE.
            </div>
          </div>

          <div v-show="mostrarSeccion('impacto')" class="card card-verde card-impacto">
            <h3><i class="bi bi-leaf"></i> Impacto ambiental</h3>
            <div class="impacto-grid">
              <div class="impacto-item">
                <span class="impacto-icono"><i class="bi bi-car-front"></i></span>
                <span class="impacto-valor">{{ resultados.co2_evitado_anual_kg.toLocaleString() }} kg</span>
                <span class="impacto-label">CO₂ evitado al año</span>
              </div>
              <div class="impacto-item">
                <span class="impacto-icono"><i class="bi bi-globe-americas"></i></span>
                <span class="impacto-valor">{{ (resultados.co2_evitado_vida_util_kg / 1000).toFixed(1) }} ton</span>
                <span class="impacto-label">CO₂ evitado en 25 años</span>
              </div>
              <div class="impacto-item">
                <span class="impacto-icono"><i class="bi bi-tree"></i></span>
                <span class="impacto-valor">{{ resultados.arboles_equivalentes.toLocaleString() }}</span>
                <span class="impacto-label">Árboles equivalentes</span>
              </div>
            </div>
          </div>

          <div v-show="mostrarSeccion('sistema')" class="card card-sistema">
            <h3><i class="bi bi-wrench"></i> Sistema propuesto</h3>
            <div class="tabla-datos">
              <div class="fila-dato">
                <span>Área del techo</span>
                <span>{{ techo?.area_m2 }} m²</span>
              </div>
              <div class="fila-dato">
                <span>Paneles a instalar</span>
                <span>{{ resultados.numero_paneles }} módulos ({{ resultados.panel_potencia_wp ?? 410 }}W)</span>
              </div>
              <div class="fila-dato">
                <span>Área útil</span>
                <span>{{ techo?.area_util_m2 }} m²</span>
              </div>
              <div class="fila-dato">
                <span>Horas sol pico</span>
                <span>{{ geo?.horas_sol_pico_diarias }} HSP/día</span>
              </div>
              <div class="fila-dato">
                <span>Zona climática</span>
                <span>{{ geo?.zona_climatica }}</span>
              </div>
              <div class="fila-dato">
                <span>Consumo mensual</span>
                <span>{{ consumo?.consumo_mensual_kwh }} kWh</span>
              </div>
            </div>
          </div>
          <!-- Card predicción de consumo con IA -->
          <div v-show="mostrarSeccion('energia')" class="card card-prediccion" v-if="resultados?.consumo_mensual_predicho?.length">
              <h3>
                  <i class="bi bi-graph-up-arrow"></i>
                  Predicción de consumo mensual
                  <span class="ia-badge">Red Neuronal</span>
              </h3>
              <p class="prediccion-subtitulo">
                  Estimación del consumo real por mes basada en patrones de estacionalidad
                  del consumo eléctrico nacional (2016-2025).
              </p>

              <table class="tabla-mensual">
                  <thead>
                      <tr>
                          <th>Mes</th>
                          <th>Consumo estimado</th>
                          <th>Factor estacional</th>
                          <th>Producción solar</th>
                          <th>Cobertura real</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr
                          v-for="mes in resultados.consumo_mensual_predicho"
                          :key="mes.numero_mes">
                          <td>{{ mes.mes }}</td>
                          <td class="valor-neutro">{{ mes.consumo_estimado_kwh.toLocaleString('es-MX') }} kWh</td>
                          <td>
                              <span class="factor-badge"
                                  :class="mes.factor_estacionalidad > 1 ? 'factor-alto' : 'factor-bajo'">
                                  {{ mes.factor_estacionalidad.toFixed(2) }}×
                              </span>
                          </td>
                          <td class="valor-positivo">
                              {{ (resultados.produccion_mensual_detalle?.find(
                                  p => p.numero_mes === mes.numero_mes
                              )?.produccion_kwh ?? 0).toLocaleString('es-MX') }} kWh
                          </td>
                          <td>
                              <span class="cobertura-badge"
                                  :class="getCoberturaClase(mes, resultados.produccion_mensual_detalle)">
                                  {{ getCoberturaReal(mes, resultados.produccion_mensual_detalle) }}%
                              </span>
                          </td>
                      </tr>
                  </tbody>
              </table>
          </div>
          <!-- Card componentes seleccionados -->
          <div v-show="mostrarSeccion('sistema')" class="card card-componentes" v-if="resultados?.panel_modelo">
              <div class="componentes-heading">
                <div class="componentes-heading-icon"><i class="bi bi-cpu"></i></div>
                <div>
                  <h3>Componentes seleccionados</h3>
                  <p>Configuración propuesta para tu sistema solar.</p>
                </div>
              </div>
              <div class="componentes-grid">
                <section class="componente-bloque componente-panel">
                  <div class="componente-bloque-heading"><i class="bi bi-sun"></i><span>Panel solar</span></div>
                  <div class="componente-principal">{{ resultados.panel_modelo }}</div>
                  <div class="componente-dato"><span>Potencia del panel</span><strong>{{ resultados.panel_potencia_wp }} W</strong></div>
                </section>
                <section class="componente-bloque componente-inversor">
                  <div class="componente-bloque-heading"><i class="bi bi-lightning-charge"></i><span>Inversor</span></div>
                  <div class="componente-principal">{{ resultados.inversor_modelo }}</div>
                  <div class="componente-dato"><span>Potencia inversor</span><strong>{{ resultados.inversor_potencia_kw }} kW</strong></div>
                </section>
                <section class="componente-bloque componente-configuracion">
                  <div class="componente-bloque-heading"><i class="bi bi-grid-3x3-gap"></i><span>Configuración del sistema</span></div>
                  <div class="componente-configuracion-grid">
                    <div class="componente-dato"><span>Potencia instalada</span><strong>{{ resultados.potencia_kwp }} kWp</strong></div>
                    <div class="componente-dato"><span>Paneles instalados</span><strong>{{ resultados.numero_paneles }} módulos</strong></div>
                    <div class="componente-dato" v-if="ratioDcAc !== null"><span>Ratio DC/AC</span><strong>{{ ratioDcAc.toFixed(2) }}</strong></div>
                  </div>
                  <p class="card-subtitulo" v-if="ratioDcAc !== null">
                    {{ ratioDcAc < 0.8 || ratioDcAc > 1.35
                      ? 'Fuera del rango de referencia interno (0.80-1.35); revisa el inversor.'
                      : 'Dentro del rango de referencia interno (0.80-1.35).' }}
                    Este rango no sustituye la ficha ni la validación eléctrica del fabricante.
                  </p>
                  <p class="card-subtitulo" v-if="resultados.inversor_recomendacion">
                    {{ resultados.inversor_recomendacion }}
                  </p>
                </section>
              </div>
          </div>

          <!-- Card Modelado Eléctrico -->
            <div v-show="mostrarSeccion('tecnico')" class="card card-electrico" v-if="resultados?.modelado_electrico?.error">
              <h3><i class="bi bi-exclamation-triangle"></i> Configuración eléctrica no válida</h3>
              <p class="card-subtitulo">{{ resultados.modelado_electrico.error }}</p>
            </div>
          <div v-show="mostrarSeccion('tecnico')" class="card card-electrico" v-if="resultados?.modelado_electrico && !resultados.modelado_electrico.error">
              <h3>
                  <i class="bi bi-lightning-charge"></i>
                  Modelado eléctrico del sistema
              </h3>

              <!-- Resumen -->
              <div class="electrico-resumen">
                  {{ resultados.modelado_electrico.resumen }}
              </div>

              <!-- Compatibilidad general -->
                <div class="electrico-compatible" :class="sistemaCompatible ? 'compatible' : 'incompatible'">
                  <svg v-if="sistemaCompatible" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                      <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                  </svg>
                    {{ sistemaCompatible ? 'Voltajes y ratio DC/AC compatibles' : 'Revisar compatibilidad eléctrica' }}
              </div>

                  <div class="electrico-sugerencia">
                    La fase del servicio CFE no se capturó; debe confirmarse con el recibo o la instalación antes de elegir el inversor.
                  </div>

              <!-- Sugerencia cuando hay incompatibilidad -->
              <div class="electrico-sugerencia" v-if="resultados.modelado_electrico.sugerencia">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 8v4M12 16h.01"/>
                  </svg>
                  {{ resultados.modelado_electrico.sugerencia }}
              </div>

          <!-- Grid de datos eléctricos -->
          <div class="electrico-grid">
              <div class="electrico-seccion">
                  <h4>Configuración de strings</h4>
                  <div class="electrico-fila">
                      <span class="electrico-label">Paneles en serie</span>
                      <span class="electrico-valor">{{ resultados.modelado_electrico.paneles_serie }}</span>
                  </div>
                  <div class="electrico-fila">
                      <span class="electrico-label">Strings en paralelo</span>
                      <span class="electrico-valor">{{ resultados.modelado_electrico.strings_paralelo }}</span>
                  </div>
                  <div class="electrico-fila">
                      <span class="electrico-label">Strings por MPPT</span>
                      <span class="electrico-valor">{{ resultados.modelado_electrico.strings_por_mppt }}</span>
                  </div>
                  <div class="electrico-fila" v-if="resultados.modelado_electrico.paneles_ajustados > 0">
                      <span class="electrico-label">Paneles ajustados</span>
                      <span class="electrico-valor advertencia">+{{ resultados.modelado_electrico.paneles_ajustados }}</span>
                  </div>
              </div>

              <div class="electrico-seccion">
                  <h4>Voltajes del arreglo</h4>
                  <div class="electrico-fila">
                      <span class="electrico-label">Voc string (STC)</span>
                      <span class="electrico-valor">{{ resultados.modelado_electrico.voc_string_v }} V</span>
                  </div>
                  <div class="electrico-fila">
                      <span class="electrico-label">Vmp string (STC)</span>
                      <span class="electrico-valor">{{ resultados.modelado_electrico.vmp_string_v }} V</span>
                  </div>
                  <div class="electrico-fila">
                      <span class="electrico-label">Voc frío ({{ resultados.modelado_electrico.temp_min_sitio_c }}°C)</span>
                      <span class="electrico-valor" :class="resultados.modelado_electrico.voc_dentro_limite ? 'ok' : 'error'">
                          {{ resultados.modelado_electrico.voc_frio_string_v }} V
                      </span>
                  </div>
                  <div class="electrico-fila">
                      <span class="electrico-label">Vmp calor ({{ resultados.modelado_electrico.temp_max_celda_c }}°C)</span>
                      <span class="electrico-valor" :class="resultados.modelado_electrico.mppt_dentro_rango ? 'ok' : 'error'">
                          {{ resultados.modelado_electrico.vmp_calor_string_v }} V
                      </span>
                  </div>
              </div>

              <div class="electrico-seccion">
                  <h4>Corrientes del arreglo</h4>
                  <div class="electrico-fila">
                      <span class="electrico-label">Isc total</span>
                      <span class="electrico-valor">{{ resultados.modelado_electrico.isc_total_a }} A</span>
                  </div>
                  <div class="electrico-fila">
                      <span class="electrico-label">Imp total</span>
                      <span class="electrico-valor">{{ resultados.modelado_electrico.imp_total_a }} A</span>
                  </div>
                  <div class="electrico-fila">
                      <span class="electrico-label">Isc por MPPT</span>
                      <span class="electrico-valor" :class="resultados.modelado_electrico.corriente_dentro_limite ? 'ok' : 'error'">
                          {{ resultados.modelado_electrico.isc_por_mppt_a }} A
                      </span>
                  </div>
                  <div class="electrico-fila">
                      <span class="electrico-label">Potencia DC</span>
                      <span class="electrico-valor">{{ resultados.modelado_electrico.potencia_dc_kw }} kW</span>
                  </div>
              </div>

              <div class="electrico-seccion">
                  <h4>Validación MPPT</h4>
                  <div class="electrico-fila">
                      <span class="electrico-label">Rango MPPT inversor</span>
                      <span class="electrico-valor">
                          {{ resultados.modelado_electrico.voltaje_mppt_min_v }}-{{ resultados.modelado_electrico.voltaje_mppt_max_v }} V
                      </span>
                  </div>
                    <div class="electrico-fila" v-if="resultados.modelado_electrico.voltaje_arranque_v">
                      <span class="electrico-label">Voltaje de arranque</span>
                      <span class="electrico-valor" :class="resultados.modelado_electrico.arranque_dentro_limite ? 'ok' : 'error'">
                        {{ resultados.modelado_electrico.voltaje_arranque_v }} V
                      </span>
                    </div>
                  <div class="electrico-fila">
                      <span class="electrico-label">Vmp calor en MPPT</span>
                      <span class="electrico-valor" :class="resultados.modelado_electrico.mppt_dentro_rango ? 'ok' : 'error'">
                          {{ resultados.modelado_electrico.mppt_dentro_rango ? 'Dentro del rango' : 'Fuera del rango' }}
                      </span>
                  </div>
                  <div class="electrico-fila">
                      <span class="electrico-label">Voc vs límite máximo</span>
                      <span class="electrico-valor" :class="resultados.modelado_electrico.voc_dentro_limite ? 'ok' : 'error'">
                          {{ resultados.modelado_electrico.voc_dentro_limite ? 'Dentro del límite' : 'Excede el límite' }}
                      </span>
                  </div>
                  <div class="electrico-fila">
                      <span class="electrico-label">Corriente por MPPT</span>
                      <span class="electrico-valor" :class="resultados.modelado_electrico.corriente_dentro_limite ? 'ok' : 'error'">
                          {{ resultados.modelado_electrico.corriente_dentro_limite ? 'Dentro del límite' : 'Excede el límite' }}
                      </span>
                  </div>
            </div>
        </div>
    </div>
        </div>

      </div>
    </div>

    <div v-else class="sin-datos">
      {{ error || 'No se encontraron resultados para esta simulación.' }}
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, onBeforeUnmount, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Chart, registerables } from 'chart.js';
import { useAuth } from '../../auth/controladores/useAuth';
import { useSimulaciones } from '../controladores/useSimulaciones';
import { useAuthStore } from '../../../stores/authStore';
import AgendarCitaModal from '../../citas/vistas/AgendarCitaModal.vue';
import logoSolarEye from '../../../assets/images/LogoSolarEye.png';
import type { ResultadosCalculo, DatosTecho, DatosGeograficos, ConsumoElectrico } from '../interfaces/simulaciones-interface';

const router = useRouter();
const route = useRoute();
Chart.register(...registerables);
const { cerrarSesion } = useAuth();
const cambiarEmpresa = () => {
router.push('/seleccionar-empresa');
};

const {
  cargando, error,
  obtieneDatosTecho,
  obtieneDatosGeograficos,
  obtieneConsumoElectrico,
  obtieneResultados,
  calcularResultadosPvlib,
  guardarResultados
} = useSimulaciones();

const simulacion_id = Number(route.params.simulacion_id);

const resultados = ref<ResultadosCalculo | null>(null);
const techo = ref<DatosTecho | null>(null);
const geo = ref<DatosGeograficos | null>(null);
const consumo = ref<ConsumoElectrico | null>(null);
const ratioDcAc = computed(() => {
  const potenciaDc = Number(resultados.value?.potencia_kwp ?? 0);
  const potenciaAc = Number(resultados.value?.inversor_potencia_kw ?? 0);
  return potenciaDc > 0 && potenciaAc > 0 ? potenciaDc / potenciaAc : null;
});
const sistemaCompatible = computed(() => {
  const ratio = ratioDcAc.value;
  return Boolean(resultados.value?.modelado_electrico?.compatible)
    && ratio !== null && ratio >= 0.8 && ratio <= 1.35;
});
const comparativaCanvas = ref<HTMLCanvasElement | null>(null);
const proyeccionCanvas = ref<HTMLCanvasElement | null>(null);
const comparativaChart = ref<Chart<'bar'> | null>(null);
const proyeccionChart = ref<Chart<'line'> | null>(null);
const authStore = useAuthStore();
const mostrarModal = ref(false);

type FiltroResultado = 'todo' | 'resumen' | 'finanzas' | 'energia' | 'sistema' | 'tecnico' | 'impacto';

const filtroActivo = ref<FiltroResultado>('todo');
const filtrosResultados: { id: FiltroResultado; nombre: string; icono: string }[] = [
  { id: 'todo', nombre: 'Todo', icono: 'bi bi-grid-1x2' },
  { id: 'resumen', nombre: 'Resumen', icono: 'bi bi-speedometer2' },
  { id: 'finanzas', nombre: 'Finanzas', icono: 'bi bi-cash-coin' },
  { id: 'energia', nombre: 'Energía', icono: 'bi bi-lightning-charge' },
  { id: 'sistema', nombre: 'Sistema', icono: 'bi bi-cpu' },
  { id: 'tecnico', nombre: 'Técnico', icono: 'bi bi-tools' },
  { id: 'impacto', nombre: 'Impacto', icono: 'bi bi-leaf' }
];

const mostrarSeccion = (seccion: FiltroResultado) => filtroActivo.value === 'todo' || filtroActivo.value === seccion;

const TOTAL_ANIOS_PROYECCION = 25;

const redondeaMoneda = (valor: number) => Number(valor.toFixed(2));

const formateaFecha = (fecha: string) => new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC'
}).format(new Date(`${fecha}T00:00:00Z`));

const obtienePaletaGrafica = () => {
  const oscuro = document.documentElement.classList.contains('theme-dark');
  return oscuro
    ? { texto: '#f8fafc', textoSuave: '#cbd5e1', rejilla: 'rgba(148, 163, 184, 0.22)' }
    : { texto: '#374151', textoSuave: '#6b7280', rejilla: 'rgba(148, 163, 184, 0.28)' };
};

const normalizaResultados = (data: Partial<ResultadosCalculo>): ResultadosCalculo => {
    const ahorroAnual = Number(data.ahorro_anual_mxn || 0);
    const costoInstalacion = Number(data.costo_total_instalacion_mxn || 0);
    const retornoConsistente = ahorroAnual > 0 ? costoInstalacion / ahorroAnual : 0;

    // Leer componentes desde sessionStorage como fallback
    const componentesRaw = sessionStorage.getItem(`componentes_${simulacion_id}`);
    const componentes = componentesRaw ? JSON.parse(componentesRaw) : null;

    // Deserializar JSON si vienen como string desde la BD
    let perdidas = data.perdidas;
    if (typeof perdidas === 'string') {
        try { perdidas = JSON.parse(perdidas); } catch { perdidas = undefined; }
    }

    let produccion_mensual_detalle = data.produccion_mensual_detalle;
    if (typeof produccion_mensual_detalle === 'string') {
        try { produccion_mensual_detalle = JSON.parse(produccion_mensual_detalle); } catch { produccion_mensual_detalle = undefined; }
    }

    return {
        simulacion_id,
        numero_paneles: Number(data.numero_paneles || 0),
        produccion_anual_kwh: Number(data.produccion_anual_kwh || 0),
        produccion_mensual_promedio_kwh: Number(data.produccion_mensual_promedio_kwh || 0),
        porcentaje_cobertura: Number(data.porcentaje_cobertura || 0),
        excedente_kwh: Number(data.excedente_kwh || 0),
        ahorro_mensual_mxn: redondeaMoneda(ahorroAnual / 12),
        ahorro_anual_mxn: ahorroAnual,
        ahorro_vida_util_mxn: Number(data.ahorro_vida_util_mxn || 0),
        costo_total_instalacion_mxn: costoInstalacion,
        retorno_inversion_anios: data.retorno_inversion_anios 
          ? Number(data.retorno_inversion_anios) 
          : redondeaMoneda(retornoConsistente),
        co2_evitado_anual_kg: Number(data.co2_evitado_anual_kg || 0),
        co2_evitado_vida_util_kg: Number(data.co2_evitado_vida_util_kg || 0),
        arboles_equivalentes: Number(data.arboles_equivalentes || 0),
        precio_kwh_proyectado_anio5: Number(data.precio_kwh_proyectado_anio5 || 0),
        precio_kwh_proyectado_anio10: Number(data.precio_kwh_proyectado_anio10 || 0),
        tasa_incremento_tarifa_pct: Number(data.tasa_incremento_tarifa_pct || 0),
        // Campos pvlib
        performance_ratio: data.performance_ratio ? Number(data.performance_ratio) : undefined,
        perdidas,
        suciedad_pct_anual: data.suciedad_pct_anual ?? perdidas?.suciedad_pct_anual ?? perdidas?.suciedad_pct,
        modelo_usado: data.modelo_usado ?? perdidas?.modelo_usado,
        fuente_datos_suciedad: data.fuente_datos_suciedad ?? perdidas?.fuente_datos_suciedad,
        perdida_kwh_anual: data.perdida_kwh_anual ?? perdidas?.perdida_kwh_anual,
        perdida_mxn_anual: data.perdida_mxn_anual ?? perdidas?.perdida_mxn_anual,
        mantenimiento_optimo: data.mantenimiento_optimo ?? perdidas?.mantenimiento_optimo,
        produccion_mensual_detalle,
        metodo_simulacion: data.metodo_simulacion ?? undefined,
        // Campos componentes — primero desde data, fallback a sessionStorage
        panel_modelo: data.panel_modelo ?? componentes?.panel_modelo ?? undefined,
        panel_potencia_wp: data.panel_potencia_wp
            ? Number(data.panel_potencia_wp)
            : componentes?.panel_potencia_wp ?? undefined,
        inversor_modelo: data.inversor_modelo ?? componentes?.inversor_modelo ?? undefined,
        inversor_potencia_kw: data.inversor_potencia_kw
            ? Number(data.inversor_potencia_kw)
            : componentes?.inversor_potencia_kw ?? undefined,
        inversor_recomendacion: data.inversor_recomendacion ?? componentes?.inversor_recomendacion ?? undefined,
        potencia_kwp: data.potencia_kwp
            ? Number(data.potencia_kwp)
            : componentes?.potencia_kwp ?? undefined,
        modelado_electrico: data.modelado_electrico ?? undefined, 
        consumo_mensual_predicho: data.consumo_mensual_predicho ?? undefined,  
    };
};

const calcularProyeccion = () => {
  if (!resultados.value) return null;
  const ahorroVidaUtil = Number(resultados.value.ahorro_vida_util_mxn || 0);
  const tasaIncremento = Number(resultados.value.tasa_incremento_tarifa_pct || 0) / 100;
  const inversion = Number(resultados.value.costo_total_instalacion_mxn || 0);
  let costoAcumuladoSinSolar = 0;
  let anioPayback: number | null = null;
  const etiquetas: string[] = [];
  const serieSinSolar: number[] = [];
  const serieConSolar: number[] = [];

  if (ahorroVidaUtil <= 0) {
    for (let anio = 1; anio <= TOTAL_ANIOS_PROYECCION; anio++) {
      etiquetas.push(`Año ${anio}`);
      serieSinSolar.push(0);
      serieConSolar.push(redondeaMoneda(inversion));
    }
    return { etiquetas, serieSinSolar, serieConSolar, anioPayback };
  }

  const pesosAnuales = Array.from({ length: TOTAL_ANIOS_PROYECCION }, (_, i) => Math.pow(1 + tasaIncremento, i));
  const sumaPesos = pesosAnuales.reduce((acc, v) => acc + v, 0);
  const ahorroBaseEscalado = ahorroVidaUtil / sumaPesos;
  let acumuladoPrevio = 0;

  for (let anio = 1; anio <= TOTAL_ANIOS_PROYECCION; anio++) {
    const pesoAnual = pesosAnuales[anio - 1] ?? 0;
    const gastoAnualSinSolar = ahorroBaseEscalado * pesoAnual;
    costoAcumuladoSinSolar += gastoAnualSinSolar;
    if (anioPayback === null && costoAcumuladoSinSolar >= inversion && gastoAnualSinSolar > 0) {
      const fraccion = (inversion - acumuladoPrevio) / gastoAnualSinSolar;
      anioPayback = (anio - 1) + Math.max(0, Math.min(fraccion, 1));
    }
    etiquetas.push(`Año ${anio}`);
    serieSinSolar.push(redondeaMoneda(costoAcumuladoSinSolar));
    serieConSolar.push(redondeaMoneda(inversion));
    acumuladoPrevio = costoAcumuladoSinSolar;
  }
  return { etiquetas, serieSinSolar, serieConSolar, anioPayback };
};

const anioPaybackEstimado = computed(() => calcularProyeccion()?.anioPayback ?? null);
const textoPaybackEstimado = computed(() => anioPaybackEstimado.value ? anioPaybackEstimado.value.toFixed(1) : null);

const volver = () => {
  const returnTo = route.query.returnTo;
  if (typeof returnTo === 'string' && returnTo.trim()) {
    router.push(returnTo);
    return;
  }
  router.push({ path: `/simulaciones/${route.query.cliente_id}`, query: { nombre: route.query.nombre } });
};

const abrirAgendarCita = () => { mostrarModal.value = true; };

const verCitasCliente = () => {
  const clienteId = Number(route.query.cliente_id);
  if (!clienteId) return alert('ID de cliente no disponible');
  router.push({ path: `/citas/cliente/${clienteId}` });
};

const onCitaGuardada = (_data: any) => {
  alert('Cita agendada correctamente');
  const clienteId = Number(route.query.cliente_id);
  if (clienteId) router.push({ path: `/citas/cliente/${clienteId}` });
};

const limpiarGraficas = () => {
  comparativaChart.value?.destroy();
  comparativaChart.value = null;
  proyeccionChart.value?.destroy();
  proyeccionChart.value = null;
};

const renderGraficaComparativa = () => {
  if (!comparativaCanvas.value || !resultados.value) return;
  const produccionMensual = resultados.value.produccion_mensual_detalle ?? [];
  if (produccionMensual.length === 0) return;
  const paleta = obtienePaletaGrafica();
  comparativaChart.value?.destroy();
  comparativaChart.value = new Chart(comparativaCanvas.value, {
    type: 'bar',
    data: {
      labels: produccionMensual.map((mes) => mes.mes),
      datasets: [
        { label: 'Producción ideal (sin suciedad)', data: produccionMensual.map((mes) => Number(mes.produccion_ideal_kwh ?? mes.produccion_kwh)), backgroundColor: '#64748b', borderRadius: 5, maxBarThickness: 30 },
        { label: 'Producción real estimada', data: produccionMensual.map((mes) => Number(mes.produccion_real_kwh ?? mes.produccion_kwh)), backgroundColor: '#22c55e', borderRadius: 5, maxBarThickness: 30 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { color: paleta.texto } },
        tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${Number(ctx.raw).toLocaleString('es-MX')} kWh` } }
      },
      scales: {
        x: { ticks: { color: paleta.textoSuave }, grid: { display: false } },
        y: { beginAtZero: true, grid: { color: paleta.rejilla }, ticks: { color: paleta.textoSuave, callback: (v) => `${Number(v).toLocaleString('es-MX')} kWh` } }
      }
    }
  });
};

const renderGraficaProyeccion = () => {
  if (!proyeccionCanvas.value || !resultados.value) return;
  const paleta = obtienePaletaGrafica();
  const proyeccion = calcularProyeccion();
  if (!proyeccion) return;
  proyeccionChart.value?.destroy();
  const puntosPayback = proyeccion.etiquetas.map((_, i) => {
    if (!proyeccion.anioPayback) return null;
    const idx = Math.max(1, Math.min(TOTAL_ANIOS_PROYECCION, Math.round(proyeccion.anioPayback)));
    return i + 1 === idx ? proyeccion.serieSinSolar[i] ?? null : null;
  });
  proyeccionChart.value = new Chart(proyeccionCanvas.value, {
    type: 'line',
    data: {
      labels: proyeccion.etiquetas,
      datasets: [
        { label: 'Costo acumulado estimado sin solar', data: proyeccion.serieSinSolar, borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.16)', fill: true, tension: 0.3, pointRadius: 0 },
        { label: 'Costo acumulado con solar', data: proyeccion.serieConSolar, borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.12)', fill: true, tension: 0, pointRadius: 0, borderDash: [8, 6] },
        { label: proyeccion.anioPayback ? `Payback estimado (${proyeccion.anioPayback.toFixed(1)} años)` : 'Payback estimado', data: puntosPayback, borderColor: '#16a34a', backgroundColor: '#16a34a', pointRadius: 6, pointHoverRadius: 7, showLine: false }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { color: paleta.texto } },
        tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: $${Number(ctx.raw).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN` } },
        subtitle: { display: !!proyeccion.anioPayback, color: paleta.textoSuave, text: proyeccion.anioPayback ? `Punto de retorno estimado: ${proyeccion.anioPayback.toFixed(1)} años` : 'Con los datos actuales no se alcanza retorno en 25 años' }
      },
      scales: {
        x: { grid: { color: paleta.rejilla }, ticks: { color: paleta.textoSuave, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 } },
        y: { beginAtZero: true, grid: { color: paleta.rejilla }, ticks: { color: paleta.textoSuave, callback: (v) => `$${Number(v).toLocaleString('es-MX')}` } }
      }
    }
  });
};

const getCoberturaReal = (
    mes: any,
    produccionMensual: any[] | undefined
): string => {
    if (!produccionMensual) return '0';
    const produccionMes = produccionMensual.find(p => p.numero_mes === mes.numero_mes);
    const produccion = produccionMes?.produccion_real_kwh ?? produccionMes?.produccion_kwh ?? 0;
    const cobertura = Math.min((produccion / mes.consumo_estimado_kwh) * 100, 100);
    return cobertura.toFixed(1);
};

const getCoberturaClase = (
    mes: any,
    produccionMensual: any[] | undefined
): string => {
    if (!produccionMensual) return 'cobertura-baja';
    const produccionMes = produccionMensual.find(p => p.numero_mes === mes.numero_mes);
    const produccion = produccionMes?.produccion_real_kwh ?? produccionMes?.produccion_kwh ?? 0;
    const cobertura = (produccion / mes.consumo_estimado_kwh) * 100;
    if (cobertura >= 100) return 'cobertura-total';
    if (cobertura >= 70) return 'cobertura-alta';
    if (cobertura >= 40) return 'cobertura-media';
    return 'cobertura-baja';
};

onMounted(async () => {
  const extraer = (data: any) => {
    if (!data) return null;
    if (Array.isArray(data)) return data.length > 0 ? data[0] : null;
    if (data.error) return null;
    return data;
  };

  let resultadosRaw = await obtieneResultados(simulacion_id);
  let resultadosExistentes = extraer(resultadosRaw);

  if (resultadosExistentes) {
    resultados.value = normalizaResultados(resultadosExistentes);
    console.log('modelado_electrico:', resultados.value?.modelado_electrico);
  }

  techo.value = extraer(await obtieneDatosTecho(simulacion_id));
  geo.value = extraer(await obtieneDatosGeograficos(simulacion_id));
  consumo.value = extraer(await obtieneConsumoElectrico(simulacion_id));

  if (!techo.value || !geo.value || !consumo.value) {
    error.value = 'Faltan datos para calcular la simulación';
    return;
  }

  let componentesActivos = false;
  try {
    const componentes = JSON.parse(sessionStorage.getItem(`componentes_${simulacion_id}`) ?? 'null');
    componentesActivos = Boolean(
      componentes?.panel_id && componentes?.inversor_id &&
      Number(componentes?.panel_potencia_wp) > 0 &&
      Number(componentes?.panel_area_m2) > 0 &&
      Number(componentes?.cantidad_paneles) > 0
    );
  } catch {
    componentesActivos = false;
  }
  if (!componentesActivos) {
    if (!resultadosExistentes) {
      error.value = 'No hay una selección de componentes vigente para calcular. Vuelve al paso 3.';
    }
    return;
  }

  const techoParseado = { ...techo.value, area_m2: Number(techo.value.area_m2), area_util_m2: Number(techo.value.area_util_m2), factor_sombra: Number(techo.value.factor_sombra), angulo_inclinacion_deg: Number(techo.value.angulo_inclinacion_deg), latitud: Number(techo.value.latitud), longitud: Number(techo.value.longitud) };
  const consumoParseado = { ...consumo.value, consumo_mensual_kwh: Number(consumo.value.consumo_mensual_kwh), consumo_anual_kwh: Number(consumo.value.consumo_anual_kwh), tarifa_kwh_mxn: Number(consumo.value.tarifa_kwh_mxn), costo_mensual_mxn: Number(consumo.value.costo_mensual_mxn) };

  const calculados = await calcularResultadosPvlib(consumoParseado, techoParseado, simulacion_id);  await guardarResultados(calculados);
  resultados.value = normalizaResultados(calculados);
  console.log('consumo_mensual_predicho:', resultados.value?.consumo_mensual_predicho);
  console.log('resultados:', resultados.value);
  console.log('panel_modelo:', resultados.value?.panel_modelo);
});

watch([resultados, consumo], async () => {
  await nextTick();
  renderGraficaComparativa();
  renderGraficaProyeccion();
});

onBeforeUnmount(() => {
  window.removeEventListener('solar-eye-theme-changed', onThemeChanged);
  limpiarGraficas();
});

const onThemeChanged = async () => {
  await nextTick();
  renderGraficaComparativa();
  renderGraficaProyeccion();
};

const imprimirReporte = () => window.print();

const descargarPDF = () => {
    window.open(`http://localhost:3001/api/pdf/${simulacion_id}`, '_blank');
};

/*const descargarPDF = async () => {
  const elemento = document.getElementById('reporte-area');
  if (!elemento) return;
  try {
    const canvas = await html2canvas(elemento, { scale: 2, useCORS: true });
    const dataFormatoImagen = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;
    const innerWidth = pdfWidth - (margin * 2);
    const pdfHeight = (canvas.height * innerWidth) / canvas.width;
    pdf.addImage(dataFormatoImagen, 'PNG', margin, margin, innerWidth, pdfHeight);
    const nombreCliente = route.query.nombre ? String(route.query.nombre).replace(/\s+/g, '_') : 'Cliente';
    pdf.save(`Reporte_Solar_${nombreCliente}.pdf`);
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    alert("Hubo un problema al generar el PDF.");
  }
};*/
</script>

<style scoped>
.contenedor {
  padding: 0 2rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Navbar */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1.25rem;
  margin: 0 calc(50% - 50vw) 1.75rem;
  width: 100vw;
  background: #04142c;
  border-radius: 0;
  box-shadow: 0 10px 24px rgba(15, 47, 99, 0.18);
  flex-wrap: wrap;
}

.navbar-brand { display: flex; align-items: center; gap: 0.75rem; flex: 0 0 auto; }
.navbar-logo { display: block; height: 36px; width: auto; object-fit: contain; }

.navbar-links,
.navbar-user {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.navbar-user { margin-left: auto; justify-content: flex-end; }
.navbar-user-name { color: white; font-weight: 600; white-space: nowrap; }

.nav-link {
  padding: 0;
  background: transparent;
  color: white;
  border: none;
  outline: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  line-height: 1.2;
  transition: opacity 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.nav-link:hover { opacity: 0.8; }

/* Encabezado */
.encabezado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.encabezado h1 { font-size: 1.8rem; color: #333; margin: 0; }
.encabezado p { color: #666; font-size: 0.9rem; margin: 0.25rem 0 0; }

/* Pasos */
.pasos {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  background: white;
  padding: 1.25rem 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.paso { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; flex: 1; }
.paso-numero { width: 36px; height: 36px; border-radius: 50%; background-color: #e0e0e0; color: #999; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.95rem; }
.paso span { font-size: 0.8rem; color: #999; font-weight: 500; }
.paso.activo .paso-numero { background-color: #1e3a8a; color: white; }
.paso.activo span { color: #1e3a8a; font-weight: 700; }
.paso.completado .paso-numero { background-color: #4ade80; color: white; }
.paso.completado span { color: #16a34a; }
.paso-linea { flex: 1; height: 2px; background-color: #e0e0e0; margin-bottom: 1.2rem; }
.paso-linea.completado { background-color: #4ade80; }

/* Filtro de apartados */
.filtro-resultados {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.65rem;
  background: #f8fafc;
  border: 1px solid #dbe5f0;
  border-radius: 10px;
}
.filtro-label {
  margin: 0 0.35rem 0 0.25rem;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
}
.filtro-opcion {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 34px;
  padding: 0.45rem 0.75rem;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: #47617f;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 700;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}
.filtro-opcion:hover { background: #e7eff8; color: #123b6d; }
.filtro-opcion.activo { background: #123b6d; border-color: #123b6d; color: #fff; }

/* Cargando */
.cargando { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem; color: #666; }
.spinner { width: 40px; height: 40px; border: 4px solid #f0f0f0; border-top-color: #1e3a8a; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Tarjetas resumen */
.tarjetas-resumen { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.tarjeta { min-width: 0; background: white; border: 1px solid #dbe5f0; border-top: 3px solid #1e3a8a; border-radius: 10px; padding: 1.15rem; box-shadow: 0 4px 14px rgba(15, 47, 99, 0.07); display: flex; align-items: center; gap: 0.9rem; }
.tarjeta-produccion,
.tarjeta-ahorro,
.tarjeta-cobertura,
.tarjeta-retorno { border-top-color: #123b6d; }
.tarjeta-icono { display: grid; place-items: center; width: 38px; height: 38px; flex: 0 0 auto; border-radius: 9px; background: #edf4fb; color: #1d4f91; font-size: 1.35rem; }
.tarjeta-info { display: flex; flex-direction: column; gap: 0.2rem; }
.tarjeta-label { font-size: 0.75rem; color: #999; }
.tarjeta-valor { font-size: 1.05rem; font-weight: 750; color: #123b6d; white-space: nowrap; }

/* Gráficas */
.graficas-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.5rem; }
.card-grafica { min-height: 340px; }
.canvas-wrap { position: relative; height: 250px; margin-top: 0.8rem; }
.payback-banner { margin-top: 0.5rem; padding: 0.55rem 0.75rem; border-radius: 6px; background: #ecfdf5; color: #166534; font-size: 0.82rem; font-weight: 600; }
.payback-banner.sin-retorno { background: #fff7ed; color: #9a3412; }

/* Flujo masonry: cada card ocupa el siguiente espacio disponible sin heredar la altura de otra. */
.grid-resultados { column-count: 2; column-gap: 1.25rem; column-fill: balance; }
.columna { display: contents; }
.grid-resultados .card { display: inline-block; width: 100%; margin: 0 0 1.25rem; vertical-align: top; break-inside: avoid; }
.card-produccion-detalle { min-width: 0; overflow-x: auto; }

.card { min-width: 0; background: white; border: 1px solid #dbe5f0; border-radius: 10px; padding: 1.35rem; box-shadow: 0 4px 14px rgba(15, 47, 99, 0.07); }
.card h3 { font-size: 1rem; color: #123b6d; margin: 0 0 1rem; line-height: 1.35; }
.card-subtitulo { font-size: 0.82rem; color: #666; margin: -0.5rem 0 1rem; }
.card-verde { border-top: 3px solid #22c55e; }

/* Componentes seleccionados */
.card-componentes { border-top: 3px solid #2563eb; }
.componentes-heading { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1.2rem; }
.componentes-heading-icon { display: grid; place-items: center; width: 42px; height: 42px; flex: 0 0 auto; border-radius: 11px; background: #e7f0fb; color: #1d4f91; font-size: 1.25rem; }
.componentes-heading h3 { margin: 0; }
.componentes-heading p { margin: 0.2rem 0 0; color: #64748b; font-size: 0.78rem; }
.componentes-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.85rem; }
.componente-bloque { min-width: 0; padding: 1rem; border: 1px solid #dbe7f3; border-radius: 9px; background: #f8fbff; }
.componente-bloque-heading { display: flex; align-items: center; gap: 0.45rem; margin-bottom: 0.75rem; color: #31527e; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; }
.componente-bloque-heading i { color: #2563eb; font-size: 1rem; }
.componente-principal { min-height: 2.6rem; color: #123b6d; font-size: 1rem; font-weight: 800; line-height: 1.3; overflow-wrap: anywhere; }
.componente-dato { display: flex; align-items: baseline; justify-content: space-between; gap: 0.75rem; padding-top: 0.7rem; border-top: 1px solid #e2eaf3; color: #64748b; font-size: 0.78rem; }
.componente-dato strong { color: #1d4f91; font-size: 0.9rem; white-space: nowrap; }
.componente-configuracion-grid { display: grid; gap: 0.7rem; }
.componente-configuracion-grid .componente-dato { padding-top: 0.55rem; }

/* Tabla datos */
.tabla-datos { display: flex; flex-direction: column; }
.fila-dato { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0; border-bottom: 1px solid #f0f0f0; font-size: 0.875rem; color: #555; }
.fila-dato:last-child { border-bottom: none; }
.fila-dato.destacada { background: #fff7ed; padding: 0.6rem 0.5rem; border-radius: 6px; }

.valor-positivo { color: #16a34a; font-weight: 600; }
.valor-positivo.grande { font-size: 1.05rem; }
.valor-destacado { color: #1e3a8a; font-weight: 600; }
.valor-advertencia { color: #d97706; font-weight: 600; }

/* Barra cobertura */
.barra-container { margin-top: 1rem; }
.barra-label { display: flex; justify-content: space-between; font-size: 0.8rem; color: #666; margin-bottom: 0.4rem; }
.barra-fondo { height: 12px; background: #f0f0f0; border-radius: 999px; overflow: hidden; }
.barra-relleno { height: 100%; background: linear-gradient(90deg, #1e3a8a, #2563eb); border-radius: 999px; transition: width 1s ease; }

/* Impacto ambiental */
.impacto-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center; }
.impacto-item { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; padding: 0.75rem; background: #f0fdf4; border-radius: 8px; }
.impacto-icono { font-size: 1.5rem; }
.impacto-valor { font-size: 1rem; font-weight: 700; color: #166534; }
.impacto-label { font-size: 0.72rem; color: #4ade80; text-align: center; line-height: 1.3; }

.sin-datos { text-align: center; padding: 4rem; color: #999; }

/* Performance Ratio */
.filtro-energia { column-count: 1; }
.filtro-finanzas,
.filtro-sistema,
.filtro-tecnico { column-count: 1; }
.filtro-impacto { column-count: 1; }
.filtro-impacto .card-impacto { width: min(100%, 720px); margin-left: auto; margin-right: auto; }
.grid-resultados .card-impacto { display: block; width: 100%; column-span: all; }
.filtro-impacto .card-impacto { width: min(100%, 720px); margin-left: auto; margin-right: auto; }
.filtro-todo .card-impacto { display: inline-block; width: 100%; column-span: none; }

.card-perdidas { border-top: 3px solid #1d4f91; }

.pr-display { text-align: center; margin-bottom: 1.5rem; }
.pr-valor { font-size: 3rem; font-weight: 800; color: #1d4f91; line-height: 1; }
.pr-label { font-size: 0.85rem; color: #666; margin-bottom: 0.75rem; }

.pr-escala { padding: 0 1rem; }
.pr-barra { height: 10px; background: #f0f0f0; border-radius: 999px; overflow: hidden; margin-bottom: 0.25rem; }
.pr-fill { height: 100%; background: linear-gradient(90deg, #ef4444, #f59e0b, #22c55e); border-radius: 999px; transition: width 1s ease; }
.pr-rangos { display: flex; justify-content: space-between; font-size: 0.7rem; color: #999; }
.pr-malo { color: #f59e0b; font-weight: 600; }
.pr-bueno { color: #22c55e; font-weight: 600; }

.perdidas-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 0.5rem;
    margin: 1rem 0;
    align-items: end;
}

.perdida-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
}

.perdida-barra-wrap {
    width: 100%;
    height: 80px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
}

.perdida-barra {
    width: 70%;
    background: linear-gradient(to top, #1d4f91, #3b82f6);
    border-radius: 4px 4px 0 0;
    min-height: 4px;
    transition: height 0.8s ease;
}

.perdida-valor { font-size: 0.8rem; font-weight: 700; color: #333; }
.perdida-nombre { font-size: 0.7rem; color: #666; text-align: center; }

.metodo-tag {
    font-size: 0.75rem;
    color: #999;
    text-align: center;
    padding: 0.5rem;
    background: #f8fafc;
    border-radius: 6px;
    margin-top: 0.5rem;
}

.advertencia-sobre {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #fef9c3;
    color: #854d0e;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-size: 0.85rem;
    margin-top: 0.75rem;
    border: 1px solid #fde68a;
}

/* ─── Modelado eléctrico ─────────────────────────────────────── */
.card-electrico { border-top: 3px solid #1d4f91; }

.electrico-resumen {
    background: #f0f5fb;
    border: 1px solid #c7d9f0;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
    color: #1d4f91;
    font-weight: 600;
    margin-bottom: 1rem;
    font-family: monospace;
}

.electrico-compatible {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
}

.electrico-compatible.compatible {
    background: #f0fdf4;
    color: #16a34a;
}

.electrico-compatible.incompatible {
    background: #fef2f2;
    color: #dc2626;
}

.electrico-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
}

.electrico-seccion h4 {
    font-size: 0.85rem;
    font-weight: 700;
    color: #04142c;
    margin: 0 0 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #f0f0f0;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.electrico-fila {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.35rem 0;
    border-bottom: 1px solid #f8f8f8;
    font-size: 0.85rem;
}

.electrico-label { color: #666; }
.electrico-valor { font-weight: 600; color: #333; }
.electrico-valor.ok { color: #16a34a; }
.electrico-valor.error { color: #dc2626; }
.electrico-valor.advertencia { color: #f59e0b; }

.electrico-sugerencia {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    background: #fef9c3;
    color: #854d0e;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 500;
    margin-bottom: 1.5rem;
    border: 1px solid #fde68a;
    line-height: 1.5;
}

@media (max-width: 768px) {
    .electrico-grid { grid-template-columns: 1fr; }
}

/* Tabla mensual */
.tabla-mensual { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.tabla-mensual th { padding: 0.6rem 0.75rem; background: #f5f5f5; text-align: left; font-size: 0.8rem; color: #666; }
.tabla-mensual td { padding: 0.6rem 0.75rem; border-bottom: 1px solid #f0f0f0; }
.tabla-mensual tr:hover td { background: #fafafa; }

/* Modo oscuro */
:global(html.theme-dark) .contenedor .card,
:global(html.theme-dark) .contenedor .tarjeta,
:global(html.theme-dark) .contenedor .pasos { background: #152236 !important; border-color: #2c3f5c !important; }
:global(html.theme-dark) .contenedor .tarjeta-label,
:global(html.theme-dark) .contenedor .card-subtitulo,
:global(html.theme-dark) .contenedor .fila-dato,
:global(html.theme-dark) .contenedor .barra-label,
:global(html.theme-dark) .contenedor .sin-datos { color: #ffffff !important; }
:global(html.theme-dark) .contenedor .tarjeta-valor,
:global(html.theme-dark) .contenedor .card h3,
:global(html.theme-dark) .contenedor .fila-dato span,
:global(html.theme-dark) .contenedor .encabezado h1,
:global(html.theme-dark) .contenedor .encabezado p,
:global(html.theme-dark) .contenedor .paso span { color: #ffffff !important; }
:global(html.theme-dark) .contenedor .fila-dato.destacada { background: #12324f !important; border: 1px solid #2f6aa3 !important; }
:global(html.theme-dark) .contenedor .fila-dato.destacada span { color: #ffffff !important; }
:global(html.theme-dark) .contenedor .valor-positivo.grande { color: #7dd3fc !important; }
:global(html.theme-dark) .contenedor .fila-ahorro-25 { background: #0f3b57 !important; border: 1px solid #2f7baa !important; }
:global(html.theme-dark) .contenedor .fila-ahorro-25 span { color: #ffffff !important; }
:global(html.theme-dark) .contenedor .fila-ahorro-25 .valor-ahorro-25 { color: #67e8f9 !important; font-weight: 700; }
:global(html.theme-dark) .contenedor .valor-positivo { color: #86efac !important; }
:global(html.theme-dark) .contenedor .valor-destacado { color: #fdba74 !important; }
:global(html.theme-dark) .contenedor .valor-advertencia { color: #fcd34d !important; }

/* Impresión */
@media print {
  .navbar, .pasos, .encabezado { display: none !important; }
  .contenedor { padding: 0; margin: 0; max-width: 100%; }
  .card, .tarjeta { box-shadow: none !important; border: 1px solid #eee; break-inside: avoid; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}

/* Responsive */
@media (max-width: 1050px) {
  .tarjetas-resumen { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 780px) {
  .contenedor { padding: 0 1rem 1rem; }
  .encabezado { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .encabezado h1 { font-size: 1.4rem; }
  .pasos { overflow-x: auto; padding: 1rem; gap: .5rem; }
  .paso span { font-size: .7rem; text-align: center; }
  .paso-linea { min-width: 30px; }
  .filtro-resultados { align-items: stretch; overflow-x: auto; flex-wrap: nowrap; padding: 0.55rem; }
  .filtro-label { display: none; }
  .filtro-opcion { flex: 0 0 auto; }
  .tarjetas-resumen { grid-template-columns: 1fr; }
  .grid-resultados { column-count: 1; }
  .graficas-grid { grid-template-columns: 1fr; }
  .card { padding: 1.2rem; }
  .card-grafica { min-height: 340px; }
  .canvas-wrap { height: 250px; }
  .fila-dato { font-size: .82rem; }
  .impacto-grid { grid-template-columns: 1fr; }
  .componentes-grid { grid-template-columns: 1fr; }
  .tarjeta-icono { font-size: 1.6rem; }
  .tarjeta-valor { font-size: 1rem; }
  .navbar { gap: 0.5rem; }
  .navbar-links { gap: 0.5rem; }
  .nav-link { font-size: 0.8rem; }
}
.card-prediccion { border-top: 3px solid #7c3aed; }

.ia-badge {
    display: inline-block;
    background: #7c3aed;
    color: white;
    font-size: 0.7rem;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    font-weight: 600;
    margin-left: 0.5rem;
    vertical-align: middle;
}

.prediccion-subtitulo {
    font-size: 0.85rem;
    color: #666;
    margin-bottom: 1.25rem;
    line-height: 1.5;
}

.factor-badge {
    display: inline-block;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 700;
}

.factor-alto { background: #fef2f2; color: #dc2626; }
.factor-bajo { background: #f0fdf4; color: #16a34a; }

.valor-neutro { color: #333; font-weight: 600; }

.cobertura-badge {
    display: inline-block;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 700;
}

.cobertura-total  { background: #dcfce7; color: #16a34a; }
.cobertura-alta   { background: #dbeafe; color: #1d4f91; }
.cobertura-media  { background: #fef9c3; color: #854d0e; }
.cobertura-baja   { background: #fef2f2; color: #dc2626; }

.modelo-suciedad { display: inline-block; margin-left: 0.5rem; padding: 0.2rem 0.55rem; border-radius: 999px; background: #e0f2fe; color: #075985; font-size: 0.7rem; font-weight: 700; vertical-align: middle; }
.card-mantenimiento { margin: 0 0 1.25rem; }
.mantenimiento-resumen { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem; margin: 0 0 1rem; }
.mantenimiento-resumen > div { display: flex; flex-direction: column; gap: 0.3rem; padding: 0.75rem; border: 1px solid #dbe5f0; border-radius: 7px; }
.mantenimiento-resumen span { color: #64748b; font-size: 0.75rem; }
.mantenimiento-resumen strong { color: #123b6d; font-size: 0.9rem; }
.ahorro-neto { color: #16a34a !important; font-weight: 700; }
.balance-negativo { color: #dc2626; font-weight: 700; }
.tabla-escenarios { min-width: 600px; }
.fuente-suciedad { margin: -0.55rem 0 1rem; color: #64748b; font-size: 0.75rem; }
.fuente-suciedad a { color: #1d4f91; }
.calendario-limpieza { margin: 0 0 1rem; padding: 0.75rem; border: 1px solid #dbe5f0; border-radius: 7px; }
.calendario-limpieza > strong { color: #123b6d; font-size: 0.85rem; }
.calendario-limpieza > p { margin: 0.25rem 0 0.6rem; color: #64748b; font-size: 0.75rem; }
.fechas-limpieza { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.fechas-limpieza span { padding: 0.25rem 0.5rem; border-radius: 5px; background: #e0f2fe; color: #075985; font-size: 0.75rem; font-weight: 600; }

:global(html.theme-dark) .contenedor .modelo-suciedad { background: #164e63; color: #cffafe; }
:global(html.theme-dark) .contenedor .mantenimiento-resumen > div { background: #111c2e; border-color: #2b3b52; }
:global(html.theme-dark) .contenedor .mantenimiento-resumen span { color: #b7c4d8; }
:global(html.theme-dark) .contenedor .mantenimiento-resumen strong { color: #f8fafc; }
:global(html.theme-dark) .contenedor .ahorro-neto { color: #86efac !important; }
:global(html.theme-dark) .contenedor .fuente-suciedad { color: #b7c4d8; }
:global(html.theme-dark) .contenedor .fuente-suciedad a { color: #93c5fd; }
:global(html.theme-dark) .contenedor .calendario-limpieza { border-color: #2b3b52; }
:global(html.theme-dark) .contenedor .calendario-limpieza > strong { color: #f8fafc; }
:global(html.theme-dark) .contenedor .calendario-limpieza > p { color: #b7c4d8; }
:global(html.theme-dark) .contenedor .fechas-limpieza span { background: #164e63; color: #cffafe; }

@media (max-width: 780px) {
  .mantenimiento-resumen { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>