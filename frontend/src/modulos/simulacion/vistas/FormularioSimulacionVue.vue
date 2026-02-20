<template>
  <div class="simulacion-container">
    <div class="simulacion-header">
      <h1>Nueva Simulación Solar</h1>
    </div>

    <!-- Stepper de progreso -->
    <div class="stepper">
      <div 
        v-for="step in steps" 
        :key="step.number"
        :class="['step', { active: currentStep === step.number, completed: currentStep > step.number }]"
        @click="goToStep(step.number)"
      >
        <div class="step-number">
          <span v-if="currentStep > step.number">OK</span>
          <span v-else>{{ step.number }}</span>
        </div>
        <div class="step-info">
          <div class="step-title">{{ step.title }}</div>
          <div class="step-description">{{ step.description }}</div>
        </div>
      </div>
    </div>

    <!-- Formulario -->
    <div class="form-container">
      <!-- PASO 1: Ubicación y Medidas -->
      <div v-show="currentStep === 1" class="step-content">
        <h2>Ubicación y Dimensiones</h2>
        
        <div class="form-section">
          <h3>Ubicación del Proyecto</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Dirección Completa *</label>
              <input 
                v-model="formData.ubicacion.direccion" 
                type="text" 
                :class="{ 'input-error': errors.direccion }"
                placeholder="Calle, número, colonia"
              >
              <span v-if="errors.direccion" class="error-text">{{ errors.direccion }}</span>
            </div>
            <div class="form-group">
              <label>Ciudad *</label>
              <input
                v-model="formData.ubicacion.ciudad"
                type="text"
                :class="{ 'input-error': errors.ciudad }"
                placeholder="Ciudad"
              >
              <span v-if="errors.ciudad" class="error-text">{{ errors.ciudad }}</span>
            </div>
            <div class="form-group">
              <label>Estado *</label>
              <input
                v-model="formData.ubicacion.estado"
                type="text"
                :class="{ 'input-error': errors.estado }"
                placeholder="Estado"
              >
              <span v-if="errors.estado" class="error-text">{{ errors.estado }}</span>
            </div>
          </div>

          <div class="form-group">
            <label>Coordenadas GPS</label>
            <div class="coordinates-input">
              <input v-model="formData.ubicacion.latitud" type="number" step="0.000001" placeholder="Latitud">
              <input v-model="formData.ubicacion.longitud" type="number" step="0.000001" placeholder="Longitud">
              <button class="btn-secondary" @click="obtenerUbicacion">Obtener mi ubicación</button>
              <button class="btn-secondary" @click="buscarEnMapa" v-if="formData.ubicacion.direccion">Buscar en mapa</button>
            </div>
            <small v-if="mensajeBusqueda">{{ mensajeBusqueda }}</small>
          </div>

          <div class="map-container" :class="{ 'map-error': errors.mapa }">
            <div id="map" :class="{ 'cursor-crosshair': drawing }"></div>
            <div class="map-controls">
              <button @click="startDrawing" :class="['btn-map', { 'btn-active': drawing }]">
                {{ drawing ? 'Dibujando... (4 puntos)' : 'Dibujar Techo' }}
              </button>
              <button @click="resetMap" class="btn-map">Limpiar</button>
            </div>
            <div class="map-info">
              <div v-if="formData.ubicacion.latitud && formData.ubicacion.longitud" class="info-badge">
                Lat: {{ formData.ubicacion.latitud?.toFixed(6) }}, Long: {{ formData.ubicacion.longitud?.toFixed(6) }}
              </div>
              <div v-if="formData.techo.largo && formData.techo.ancho && areaCalculadaDesdeMapa" class="info-badge success">
                Área calculada: {{ areaTotal }}
              </div>
            </div>
          </div>
          <span v-if="errors.mapa" class="error-text">{{ errors.mapa }}</span>
        </div>

        <div class="form-section">
          <h3>Medidas del Techo</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Área Total (m²)</label>
              <input :value="areaTotal" type="text" readonly disabled>
              <small v-if="areaCalculadaDesdeMapa">Área obtenida del dibujo en mapa</small>
            </div>
            <div class="form-group">
              <label>Tipo de Techo *</label>
              <select v-model="formData.techo.tipo" :class="{ 'input-error': errors.techoTipo }">
                <option value="">Seleccione...</option>
                <option value="plano">Plano</option>
                <option value="inclinado">Inclinado</option>
              </select>
              <span v-if="errors.techoTipo" class="error-text">{{ errors.techoTipo }}</span>
            </div>
            <div class="form-group">
              <label>Orientación (Azimut °) *</label>
              <input
                v-model.number="formData.techo.orientacion"
                type="number"
                min="0"
                max="360"
                :class="{ 'input-error': errors.orientacion }"
                placeholder="0-360 (0=Norte, 180=Sur)"
              >
              <span v-if="errors.orientacion" class="error-text">{{ errors.orientacion }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- PASO 2: Datos del Cliente -->
      <div v-show="currentStep === 2" class="step-content">
        <h2>Información del Cliente</h2>
        
        <div class="form-section">
          <div class="form-grid">
            <div class="form-group">
              <label>Nombre del Cliente *</label>
              <input
                v-model="formData.cliente.nombre"
                type="text"
                :class="{ 'input-error': errors.nombre }"
                placeholder="Nombre completo"
              >
              <span v-if="errors.nombre" class="error-text">{{ errors.nombre }}</span>
            </div>
            <div class="form-group">
              <label>Email *</label>
              <input
                v-model="formData.cliente.email"
                type="email"
                :class="{ 'input-error': errors.email }"
                placeholder="correo@ejemplo.com"
              >
              <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
            </div>
            <div class="form-group">
              <label>Teléfono *</label>
              <input
                v-model="formData.cliente.telefono"
                type="tel"
                :class="{ 'input-error': errors.telefono }"
                placeholder="+52 555 123 4567"
              >
              <span v-if="errors.telefono" class="error-text">{{ errors.telefono }}</span>
            </div>
            <div class="form-group">
              <label>Tipo de Usuario *</label>
              <select v-model="formData.cliente.tipoUsuario" :class="{ 'input-error': errors.tipoUsuario }">
                <option value="">Seleccione...</option>
                <option value="residencial">Residencial</option>
                <option value="comercial">Comercial</option>
                <option value="industrial">Industrial</option>
              </select>
              <span v-if="errors.tipoUsuario" class="error-text">{{ errors.tipoUsuario }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- PASO 3: Consumo Energético -->
      <div v-show="currentStep === 3" class="step-content">
        <h2>Consumo Energético</h2>
        
        <div class="form-section">
          <h3>Consumo Actual</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Consumo Promedio Mensual (kWh) *</label>
              <input
                v-model.number="formData.consumo.mensual"
                type="number"
                :class="{ 'input-error': errors.consumo }"
                placeholder="0"
              >
              <span v-if="errors.consumo" class="error-text">{{ errors.consumo }}</span>
            </div>
            <div class="form-group">
              <label>Consumo Anual (kWh)</label>
              <input :value="consumoAnual" type="text" readonly disabled>
            </div>
            <div class="form-group">
              <label>Tarifa Eléctrica Actual *</label>
              <select v-model="formData.consumo.tarifa" :class="{ 'input-error': errors.tarifa }">
                <option value="">Seleccione...</option>
                <option value="dac">DAC - Alto Consumo</option>
                <option value="1">Residencial Tarifa 1</option>
                <option value="1a">Residencial Tarifa 1A</option>
                <option value="1b">Residencial Tarifa 1B</option>
                <option value="1c">Residencial Tarifa 1C</option>
                <option value="gdmto">GDMTO - Comercial</option>
              </select>
              <span v-if="errors.tarifa" class="error-text">{{ errors.tarifa }}</span>
            </div>
            <div class="form-group">
              <label>Costo Promedio kWh (MXN) *</label>
              <input
                v-model.number="formData.consumo.costoKwh"
                type="number"
                step="0.01"
                :class="{ 'input-error': errors.costo }"
                placeholder="0.00"
              >
              <span v-if="errors.costo" class="error-text">{{ errors.costo }}</span>
            </div>
            <div class="form-group">
              <label>Gasto Mensual Promedio (MXN)</label>
              <input :value="gastoMensual" type="text" readonly disabled>
            </div>
            <div class="form-group">
              <label>Gasto Anual Estimado (MXN)</label>
              <input :value="gastoAnual" type="text" readonly disabled>
            </div>
          </div>
        </div>
      </div>

      <!-- PASO 4: Sistema Solar -->
      <div v-show="currentStep === 4" class="step-content">
        <h2>Configuración del Sistema Solar</h2>
        
        <div class="form-section">
          <h3>Dimensionamiento del Sistema</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Potencia del Sistema (kW) *</label>
              <input
                v-model.number="formData.sistema.potencia"
                type="number"
                step="0.1"
                :class="{ 'input-error': errors.potencia }"
                placeholder="0.0"
              >
              <span v-if="errors.potencia" class="error-text">{{ errors.potencia }}</span>
              <small>Sugerencia: {{ potenciaSugerida }} kW basado en consumo</small>
            </div>
            <div class="form-group">
              <label>Tipo de Panel Solar *</label>
              <select v-model="formData.sistema.tipoPaneles" :class="{ 'input-error': errors.tipoPaneles }">
                <option value="">Seleccione...</option>
                <option value="monocristalino">Monocristalino</option>
                <option value="policristalino">Policristalino</option>
              </select>
              <span v-if="errors.tipoPaneles" class="error-text">{{ errors.tipoPaneles }}</span>
            </div>
            <div class="form-group">
              <label>Potencia por Panel (W) *</label>
              <input
                v-model.number="formData.sistema.potenciaPorPanel"
                type="number"
                :class="{ 'input-error': errors.potenciaPorPanel }"
                placeholder="400-550W"
              >
              <span v-if="errors.potenciaPorPanel" class="error-text">{{ errors.potenciaPorPanel }}</span>
            </div>
            <div class="form-group">
              <label>Número de Paneles</label>
              <input :value="numeroPaneles" type="text" readonly disabled>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Producción Energética Estimada</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">{{ produccionDiaria }} kWh</div>
              <div class="stat-label">Producción Diaria</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ produccionMensual }} kWh</div>
              <div class="stat-label">Producción Mensual</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ produccionAnual }} kWh</div>
              <div class="stat-label">Producción Anual</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ porcentajeCobertura }}%</div>
              <div class="stat-label">Cobertura de Consumo</div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Análisis Financiero</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Costo Total del Sistema (MXN) *</label>
              <input
                v-model.number="formData.financiero.costoTotal"
                type="number"
                :class="{ 'input-error': errors.costoTotal }"
                placeholder="0"
              >
              <span v-if="errors.costoTotal" class="error-text">{{ errors.costoTotal }}</span>
            </div>
            <div class="form-group">
              <label>Costo por Watt Instalado (MXN)</label>
              <input :value="costoPorWatt" type="text" readonly disabled>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Retorno de Inversión</h3>
          <div class="stats-grid">
            <div class="stat-card highlight">
              <div class="stat-value">${{ ahorroAnual }}</div>
              <div class="stat-label">Ahorro Anual</div>
            </div>
            <div class="stat-card highlight">
              <div class="stat-value">${{ ahorroMensual }}</div>
              <div class="stat-label">Ahorro Mensual</div>
            </div>
            <div class="stat-card highlight">
              <div class="stat-value">{{ periodoRetorno }} años</div>
              <div class="stat-label">Periodo de Retorno</div>
            </div>
            <div class="stat-card highlight">
              <div class="stat-value">${{ ahorroTotal25Anos }}</div>
              <div class="stat-label">Ahorro 25 años</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botones de navegación -->
      <div class="form-actions">
        <button 
          v-if="currentStep > 1" 
          class="btn-secondary" 
          @click="previousStep"
        >
          Anterior
        </button>
        <button 
          v-if="currentStep < 4" 
          class="btn-primary" 
          @click="nextStep"
        >
          Siguiente
        </button>
        <button 
          v-if="currentStep === 4" 
          class="btn-success" 
          @click="guardarSimulacion"
        >
          Guardar Simulación
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Variables del mapa
let map: L.Map;
let drawnItems: L.FeatureGroup;
let locationMarker: L.Marker | null = null;
const drawing = ref(false);
const mensajeBusqueda = ref('');
const areaCalculadaDesdeMapa = ref(false);
let points: L.LatLng[] = [];

const currentStep = ref(1);

const steps = [
  { number: 1, title: 'Ubicación', description: 'Mapa y medidas' },
  { number: 2, title: 'Cliente', description: 'Datos personales' },
  { number: 3, title: 'Consumo', description: 'Energía actual' },
  { number: 4, title: 'Sistema', description: 'Solar y finanzas' }
];

const formData = ref({
  ubicacion: {
    direccion: '',
    ciudad: '',
    estado: '',
    latitud: null as number | null,
    longitud: null as number | null
  },
  techo: {
    largo: null as number | null,
    ancho: null as number | null,
    tipo: '',
    orientacion: 180
  },
  cliente: {
    nombre: '',
    email: '',
    telefono: '',
    tipoUsuario: ''
  },
  consumo: {
    mensual: null as number | null,
    tarifa: '',
    costoKwh: null as number | null
  },
  sistema: {
    potencia: null as number | null,
    tipoPaneles: '',
    potenciaPorPanel: 450
  },
  financiero: {
    costoTotal: null as number | null
  }
});

// Computed properties para Paso 1
const areaTotal = computed(() => {
  if (formData.value.techo.largo && formData.value.techo.ancho) {
    return (formData.value.techo.largo * formData.value.techo.ancho).toFixed(2) + ' m²';
  }
  return '0.00 m²';
});

// Inicializar mapa
onMounted(() => {
  map = L.map('map', { zoomControl: false }).setView([19.4326, -99.1332], 19);
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: ''
  }).addTo(map);
  drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);
  
  // Agregar control de zoom
  L.control.zoom({ position: 'bottomright' }).addTo(map);
});

// Funciones del mapa
const startDrawing = () => {
  resetMap();
  drawing.value = true;
  
  setTimeout(() => {
    map.invalidateSize();
  }, 10);

  map.on('click', onMapClick);
};

const resetMap = () => {
  drawnItems.clearLayers();
  points = [];
  drawing.value = false;
  areaCalculadaDesdeMapa.value = false;
};

const onMapClick = (e: L.LeafletMouseEvent) => {
  if (!drawing.value) return;
  
  points.push(e.latlng);
  L.circleMarker(e.latlng, { 
    radius: 6, 
    color: '#f97316', 
    fillColor: '#f97316',
    fillOpacity: 1,
    weight: 2
  }).addTo(drawnItems);
  
  if (points.length === 4) {
    const polygon = L.polygon(points, { 
      color: '#f97316', 
      fillColor: '#fb923c', 
      fillOpacity: 0.4,
      weight: 3
    });
    drawnItems.addLayer(polygon);
    drawing.value = false;
    map.off('click', onMapClick);
    
    // Calcular área en metros cuadrados
    const area = calcularAreaMetrosCuadrados(points);
    
    // Calcular dimensiones aproximadas (asumiendo forma rectangular)
    if (points[0] && points[1] && points[2]) {
      const lado1 = calcularDistancia(points[0], points[1]);
      const lado2 = calcularDistancia(points[1], points[2]);
      
      formData.value.techo.largo = Math.max(lado1, lado2);
      formData.value.techo.ancho = Math.min(lado1, lado2);
    }
    areaCalculadaDesdeMapa.value = true;
    
    // Mostrar el área en el polígono
    const center = polygon.getBounds().getCenter();
    
    L.marker(center, {
      icon: L.divIcon({
        html: `<div style="background: #f97316; padding: 6px 12px; border-radius: 8px; font-weight: bold; color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); white-space: nowrap;">${area.toFixed(2)} m²</div>`,
        className: '',
        iconSize: [100, 40],
        iconAnchor: [50, 20]
      })
    }).addTo(drawnItems);

    // Actualizar ubicacion basada en el centro del poligono dibujado
    formData.value.ubicacion.latitud = center.lat;
    formData.value.ubicacion.longitud = center.lng;
    reverseGeocodeUbicacion(center.lat, center.lng);
  }
};

const reverseGeocodeUbicacion = async (lat: number, lon: number) => {
  mensajeBusqueda.value = 'Actualizando direccion desde el mapa...';

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
    );
    const data = await response.json();

    if (data && data.address) {
      const address = data.address;

      formData.value.ubicacion.direccion =
        address.road || address.neighbourhood || address.suburb || '';
      formData.value.ubicacion.ciudad =
        address.city || address.town || address.village || address.municipality || '';
      formData.value.ubicacion.estado =
        address.state || '';

      mensajeBusqueda.value = 'Direccion actualizada desde el mapa';
      setTimeout(() => {
        mensajeBusqueda.value = '';
      }, 3000);
    } else {
      mensajeBusqueda.value = 'No se pudo obtener la direccion desde el mapa';
    }
  } catch (error) {
    console.error('Error al hacer reverse geocoding:', error);
    mensajeBusqueda.value = 'Error al obtener direccion desde el mapa';
  }
};

// Función para calcular el área de un polígono en metros cuadrados
const calcularAreaMetrosCuadrados = (puntos: L.LatLng[]): number => {
  if (puntos.length < 3) return 0;
  
  const R = 6371000; // Radio de la Tierra en metros
  const toRad = (deg: number) => deg * Math.PI / 180;
  
  let area = 0;
  const n = puntos.length;
  
  for (let i = 0; i < n; i++) {
    const p1 = puntos[i];
    const p2 = puntos[(i + 1) % n];
    
    if (!p1 || !p2) continue;

    const lat1 = toRad(p1.lat);
    const lat2 = toRad(p2.lat);
    const lng1 = toRad(p1.lng);
    const lng2 = toRad(p2.lng);
    
    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  
  area = Math.abs(area * R * R / 2);
  return area;
};

// Función para calcular distancia entre dos puntos en metros
const calcularDistancia = (p1: L.LatLng, p2: L.LatLng): number => {
  const R = 6371000; // Radio de la Tierra en metros
  const toRad = (deg: number) => deg * Math.PI / 180;
  
  const lat1 = toRad(p1.lat);
  const lat2 = toRad(p2.lat);
  const dLat = toRad(p2.lat - p1.lat);
  const dLng = toRad(p2.lng - p1.lng);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c;
};

const buscarEnMapa = async () => {
  const direccionCompleta = `${formData.value.ubicacion.direccion}, ${formData.value.ubicacion.ciudad}, ${formData.value.ubicacion.estado}`;
  
  if (!direccionCompleta.trim()) {
    mensajeBusqueda.value = 'Por favor completa la dirección';
    return;
  }

  mensajeBusqueda.value = 'Buscando ubicación...';

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccionCompleta)}&limit=1`
    );
    const data = await response.json();

    if (data.length === 0) {
      mensajeBusqueda.value = 'No se encontró la ubicación. Intenta con otro nombre';
      return;
    }

    const { lat, lon, display_name } = data[0];
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    // Actualizar coordenadas en el formulario
    formData.value.ubicacion.latitud = latNum;
    formData.value.ubicacion.longitud = lonNum;

    // Remover marcador anterior si existe
    if (locationMarker) {
      map.removeLayer(locationMarker);
    }

    // Crear icono personalizado para el marcador
    const customIcon = L.divIcon({
      html: '<div style="background-color: #3b82f6; width: 28px; height: 28px; border-radius: 50%; border: 4px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>',
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    // Agregar marcador en la ubicación
    locationMarker = L.marker([latNum, lonNum], { icon: customIcon })
      .addTo(map)
      .bindPopup(`<b>${display_name.split(',').slice(0, 2).join(',')}</b>`)
      .openPopup();

    // Mover el mapa a la ubicación con animación
    map.flyTo([latNum, lonNum], 19, {
      duration: 2
    });

    mensajeBusqueda.value = `Ubicación encontrada: ${display_name.split(',')[0]}`;
  } catch (error) {
    console.error('Error al buscar ubicación:', error);
    mensajeBusqueda.value = 'Error al buscar. Verifica tu conexión a internet';
  }
};

// Computed properties para Paso 3
const consumoAnual = computed(() => {
  if (formData.value.consumo.mensual) {
    return (formData.value.consumo.mensual * 12).toLocaleString() + ' kWh';
  }
  return '0 kWh';
});

const gastoMensual = computed(() => {
  if (formData.value.consumo.mensual && formData.value.consumo.costoKwh) {
    return '$' + (formData.value.consumo.mensual * formData.value.consumo.costoKwh).toLocaleString('es-MX', { minimumFractionDigits: 2 });
  }
  return '$0.00';
});

const gastoAnual = computed(() => {
  if (formData.value.consumo.mensual && formData.value.consumo.costoKwh) {
    return '$' + (formData.value.consumo.mensual * formData.value.consumo.costoKwh * 12).toLocaleString('es-MX', { minimumFractionDigits: 2 });
  }
  return '$0.00';
});

// Computed properties para Paso 4
const potenciaSugerida = computed(() => {
  if (formData.value.consumo.mensual) {
    const consumoDiario = formData.value.consumo.mensual / 30;
    const horasSolPico = 5; // Estimación promedio
    const potencia = (consumoDiario / horasSolPico) * 1.25;
    return potencia.toFixed(2);
  }
  return '0.00';
});

const numeroPaneles = computed(() => {
  if (formData.value.sistema.potencia && formData.value.sistema.potenciaPorPanel) {
    return Math.ceil((formData.value.sistema.potencia * 1000) / formData.value.sistema.potenciaPorPanel);
  }
  return 0;
});

const produccionDiaria = computed(() => {
  if (formData.value.sistema.potencia) {
    const horasSolPico = 5;
    const eficiencia = 0.85; // 85% de eficiencia del sistema
    return (formData.value.sistema.potencia * horasSolPico * eficiencia).toFixed(2);
  }
  return '0.00';
});

const produccionMensual = computed(() => {
  return (parseFloat(produccionDiaria.value) * 30).toFixed(2);
});

const produccionAnual = computed(() => {
  return (parseFloat(produccionDiaria.value) * 365).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
});

const porcentajeCobertura = computed(() => {
  const produccion = parseFloat(produccionDiaria.value) * 365;
  if (formData.value.consumo.mensual && produccion > 0) {
    const consumoAnual = formData.value.consumo.mensual * 12;
    return Math.min(100, (produccion / consumoAnual * 100)).toFixed(0);
  }
  return '0';
});

const costoPorWatt = computed(() => {
  if (formData.value.financiero.costoTotal && formData.value.sistema.potencia) {
    return '$' + (formData.value.financiero.costoTotal / (formData.value.sistema.potencia * 1000)).toFixed(2);
  }
  return '$0.00';
});

const ahorroAnual = computed(() => {
  if (formData.value.consumo.mensual && formData.value.consumo.costoKwh) {
    const gastoActual = formData.value.consumo.mensual * formData.value.consumo.costoKwh * 12;
    const cobertura = parseFloat(porcentajeCobertura.value) / 100;
    const ahorro = gastoActual * cobertura;
    return ahorro.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  return '0';
});

const ahorroMensual = computed(() => {
  const anual = parseFloat(ahorroAnual.value.replace(/,/g, ''));
  return (anual / 12).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
});

const periodoRetorno = computed(() => {
  if (formData.value.financiero.costoTotal) {
    const ahorro = parseFloat(ahorroAnual.value.replace(/,/g, ''));
    if (ahorro > 0) {
      return (formData.value.financiero.costoTotal / ahorro).toFixed(1);
    }
  }
  return '0.0';
});

const ahorroTotal25Anos = computed(() => {
  const anual = parseFloat(ahorroAnual.value.replace(/,/g, ''));
  const incremento = 0.04; // 4% incremento anual de tarifa
  let total = 0;
  
  for (let i = 0; i < 25; i++) {
    total += anual * Math.pow(1 + incremento, i);
  }
  
  return total.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
});

const errors = ref<Record<string, string>>({});

// Función para validar cada paso
const validateStep = (step: number): boolean => {
  errors.value = {}; // Limpiar errores previos

  if (step === 1) {
    if (!formData.value.ubicacion.direccion) errors.value.direccion = 'La dirección es obligatoria';
    if (!formData.value.ubicacion.ciudad) errors.value.ciudad = 'La ciudad es obligatoria';
    if (!formData.value.ubicacion.estado) errors.value.estado = 'El estado es obligatorio';
    if (!formData.value.techo.tipo) errors.value.techoTipo = 'Selecciona un tipo de techo';
    if (formData.value.techo.orientacion === null || formData.value.techo.orientacion < 0 || formData.value.techo.orientacion > 360) {
      errors.value.orientacion = 'Ingresa una orientacion valida (0-360)';
    }
    if (!areaCalculadaDesdeMapa.value) errors.value.mapa = 'Debes dibujar el área del techo en el mapa';
  }

  if (step === 2) {
    if (!formData.value.cliente.nombre) errors.value.nombre = 'El nombre es obligatorio';
    if (!formData.value.cliente.email || !/^\S+@\S+\.\S+$/.test(formData.value.cliente.email)) {
      errors.value.email = 'Ingresa un correo electrónico válido';
    }
    if (!formData.value.cliente.telefono) errors.value.telefono = 'El teléfono es obligatorio';
    if (!formData.value.cliente.tipoUsuario) errors.value.tipoUsuario = 'Selecciona el tipo de usuario';
  }

  if (step === 3) {
    if (!formData.value.consumo.mensual || formData.value.consumo.mensual <= 0) {
      errors.value.consumo = 'El consumo debe ser mayor a 0';
    }
    if (!formData.value.consumo.tarifa) errors.value.tarifa = 'Selecciona una tarifa';
    if (!formData.value.consumo.costoKwh || formData.value.consumo.costoKwh <= 0) {
      errors.value.costo = 'El costo por kWh es obligatorio';
    }
  }

  if (step === 4) {
    if (!formData.value.sistema.potencia) errors.value.potencia = 'Define la potencia del sistema';
    if (!formData.value.sistema.tipoPaneles) errors.value.tipoPaneles = 'Selecciona el tipo de panel';
    if (!formData.value.sistema.potenciaPorPanel) errors.value.potenciaPorPanel = 'Ingresa la potencia por panel';
    if (!formData.value.financiero.costoTotal) errors.value.costoTotal = 'Ingresa el costo del proyecto';
  }

  return Object.keys(errors.value).length === 0;
};

// Funciones
function nextStep() {
  if (!validateStep(currentStep.value)) return;
  if (currentStep.value < 4) currentStep.value++;
}

function previousStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

function goToStep(step: number) {
  currentStep.value = step;
}

function obtenerUbicacion() {
  if (navigator.geolocation) {
    mensajeBusqueda.value = 'Obteniendo tu ubicación...';
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        // Actualizar coordenadas
        formData.value.ubicacion.latitud = lat;
        formData.value.ubicacion.longitud = lon;

        // Hacer reverse geocoding para obtener la dirección
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
          );
          const data = await response.json();

          if (data && data.address) {
            const address = data.address;
            
            // Llenar los campos del formulario
            formData.value.ubicacion.direccion = 
              address.road || address.neighbourhood || address.suburb || '';
            formData.value.ubicacion.ciudad = 
              address.city || address.town || address.village || address.municipality || '';
            formData.value.ubicacion.estado = 
              address.state || '';
          }

          // Remover marcador anterior si existe
          if (locationMarker) {
            map.removeLayer(locationMarker);
          }

          // Crear icono personalizado para el marcador
          const customIcon = L.divIcon({
            html: '<div style="background-color: #10b981; width: 28px; height: 28px; border-radius: 50%; border: 4px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>',
            className: '',
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          // Agregar marcador en la ubicación
          locationMarker = L.marker([lat, lon], { icon: customIcon })
            .addTo(map)
            .bindPopup('<b>Tu ubicación actual</b>')
            .openPopup();

          // Centrar el mapa en la ubicación
          map.flyTo([lat, lon], 19, {
            duration: 2
          });

          mensajeBusqueda.value = 'Ubicación obtenida correctamente';
          
          // Limpiar mensaje después de 3 segundos
          setTimeout(() => {
            mensajeBusqueda.value = '';
          }, 3000);

        } catch (error) {
          console.error('Error al obtener dirección:', error);
          mensajeBusqueda.value = 'Ubicación obtenida pero no se pudo determinar la dirección';
          
          // Centrar el mapa de todas formas
          map.flyTo([lat, lon], 19, {
            duration: 2
          });
        }
      },
      (error) => {
        console.error('Error de geolocalización:', error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            mensajeBusqueda.value = 'Permiso denegado. Permite el acceso a tu ubicación en el navegador';
            break;
          case error.POSITION_UNAVAILABLE:
            mensajeBusqueda.value = 'Ubicación no disponible. Intenta de nuevo';
            break;
          case error.TIMEOUT:
            mensajeBusqueda.value = 'Tiempo de espera agotado. Intenta de nuevo';
            break;
          default:
            mensajeBusqueda.value = 'Error al obtener ubicación';
        }
      }
    );
  } else {
    mensajeBusqueda.value = 'Tu navegador no soporta geolocalización';
  }
}

function guardarSimulacion() {
  if (!validateStep(currentStep.value)) return;
  console.log('Guardando simulación:', formData.value);
  alert('Simulación guardada exitosamente!\n\nLos datos han sido procesados.');
}
</script>

<style scoped>
.simulacion-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: #f8fafc;
  min-height: 100vh;
}

.simulacion-header {
  margin-bottom: 2rem;
}

.simulacion-header h1 {
  font-size: 2rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #64748b;
  font-size: 1rem;
}

/* Stepper */
.stepper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  gap: 1rem;
}

.step {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.step:not(:last-child)::after {
  content: '>';
  position: absolute;
  right: -1rem;
  color: #cbd5e1;
  font-size: 1.5rem;
}

.step.active {
  background: #fff7ed;
  border: 2px solid #f97316;
}

.step.completed {
  background: #f0fdf4;
}

.step:hover {
  background: #f8fafc;
}

.step-number {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.25rem;
  flex-shrink: 0;
  transition: all 0.3s;
}

.step.active .step-number {
  background: #f97316;
  color: white;
}

.step.completed .step-number {
  background: #22c55e;
  color: white;
}

.step-info {
  flex: 1;
}

.step-title {
  font-weight: 600;
  color: #1e293b;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.step-description {
  font-size: 0.85rem;
  color: #64748b;
}

/* Form Container */
.form-container {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
}

.step-content h2 {
  font-size: 1.75rem;
  color: #1e293b;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
}

.form-section {
  margin-bottom: 2.5rem;
}

.form-section h3 {
  font-size: 1.25rem;
  color: #475569;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 500;
  color: #475569;
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s;
  background: white;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.form-group input:disabled,
.form-group input[readonly] {
  background: #f8fafc;
  color: #64748b;
  cursor: not-allowed;
}

.form-group small {
  color: #64748b;
  font-size: 0.8rem;
}

.coordinates-input {
  display: grid;
  grid-template-columns: 1fr 1fr auto auto;
  gap: 0.5rem;
}

.map-container {
  margin-top: 1.5rem;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

#map {
  width: 100%;
  height: 450px;
  background: #cbd5e1;
  position: relative;
  z-index: 1;
}

.cursor-crosshair {
  cursor: crosshair !important;
}

.map-controls {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 1000;
  display: flex;
  gap: 0.5rem;
}

.btn-map {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: none;
  background: white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.15);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
  color: #475569;
}

.btn-map:hover {
  background: #f8fafc;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.2);
}

.btn-map.btn-active {
  background: #f97316;
  color: white;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 4px 6px rgba(249, 115, 22, 0.3);
  }
  50% {
    box-shadow: 0 4px 20px rgba(249, 115, 22, 0.6);
  }
}

.map-info {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  z-index: 1000;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.info-badge {
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  font-size: 0.85rem;
  color: #475569;
  font-weight: 500;
}

.info-badge.success {
  background: #22c55e;
  color: white;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.stat-card {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  border: 2px solid #e2e8f0;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}

.stat-card.highlight {
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
  border-color: #f97316;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}

/* Buttons */
.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 2px solid #f1f5f9;
}

.btn-primary,
.btn-secondary,
.btn-success {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #f97316;
  color: white;
  margin-left: auto;
}

.btn-primary:hover {
  background: #ea580c;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

.btn-secondary {
  background: #64748b;
  color: white;
}

.btn-secondary:hover {
  background: #475569;
}

.btn-success {
  background: #22c55e;
  color: white;
  margin-left: auto;
}

.btn-success:hover {
  background: #16a34a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .stepper {
    flex-direction: column;
  }
  
  .step:not(:last-child)::after {
    content: 'v';
    right: auto;
    bottom: -1.5rem;
    top: auto;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .coordinates-input {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  #map {
    height: 350px;
  }
  
  .map-controls {
    flex-direction: column;
    top: 0.5rem;
    left: 0.5rem;
  }
  
  .map-info {
    flex-direction: column;
    left: 0.5rem;
    right: 0.5rem;
    bottom: 0.5rem;
  }
}

/* Estilos para errores */
.input-error {
  border-color: #ef4444 !important;
  background-color: #fef2f2 !important;
}

.map-error {
  border-color: #ef4444 !important;
}

.error-text {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  font-weight: 500;
  animation: shake 0.4s linear;
}

/* Animación opcional para llamar la atención */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
</style>
