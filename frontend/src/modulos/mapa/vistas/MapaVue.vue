<template>
  <div class="calculadora-wrapper">
    <main class="container">
      <div class="text-header">
        <h1>Calculadora Solar</h1>
        <p>Selecciona tu propiedad y calcula tu potencial solar</p>
      </div>

      <div class="grid-layout">
        <div class="card map-card">
          <div id="map" :class="{ 'cursor-crosshair': drawing }"></div>
          <div class="map-controls">
            <button @click="startDrawing" :class="{ 'btn-active': drawing }">
              {{ drawing ? 'Dibujando...' : ' Dibujar Techo' }}
            </button>
            <button @click="resetMap"> Limpiar</button>
          </div>
        </div>

        <div class="card form-card">
          <div class="input-group">
            <label><span class="icon blue"></span> Ubicación (Ciudad, País)</label>
            <div class="input-with-search">
              <input 
                type="text" 
                v-model="ubicacion" 
                @keyup.enter="buscarUbicacion"
                placeholder="ej: Ciudad de México, México"
                :disabled="buscando"
              >
              <button 
                class="btn-search" 
                @click="buscarUbicacion"
                :disabled="buscando || !ubicacion"
              >
                {{ buscando ? 'Buscando' : 'Buscar' }}
              </button>
            </div>
            <span class="hint">{{ mensajeBusqueda || 'Presiona Enter o haz clic en "Ubicación" para buscar la ubicación en el mapa' }}</span>
          </div>

          <div class="input-group">
            <label><span class="icon orange"></span> Tamaño del Techo (m²)</label>
            <div class="input-with-unit">
              <input type="number" v-model="areaMetros" placeholder="ej: 50" :readonly="areaCalculada">
              <span class="unit">m²</span>
            </div>
            <span class="hint">{{ areaCalculada ? ' Área calculada automáticamente del polígono dibujado' : 'Área disponible en tu techo para instalar paneles solares' }}</span>
          </div>

          <div class="input-group">
            <label><span class="icon green"></span> Costo de Electricidad (por kWh)</label>
            <input type="number" placeholder="ej: 0.15">
            <span class="hint">Tarifa actual que pagas por kWh (deja vacío para usar promedio)</span>
          </div>

          <button class="btn-primary">
             Calcular Potencial Solar
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

let map: L.Map
let drawnItems: L.FeatureGroup
let locationMarker: L.Marker | null = null
const drawing = ref(false)
const ubicacion = ref('')
const buscando = ref(false)
const mensajeBusqueda = ref('')
const areaMetros = ref<number | null>(null)
const areaCalculada = ref(false)
let points: L.LatLng[] = []

onMounted(() => {
  map = L.map('map', { zoomControl: false }).setView([24.8091, -107.3940], 19)
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19
  }).addTo(map)
  drawnItems = new L.FeatureGroup()
  map.addLayer(drawnItems)
})

const startDrawing = () => {
  resetMap();          
  drawing.value = true;
  
  setTimeout(() => {
    map.invalidateSize(); 
  }, 10);

  map.on('click', onMapClick);
}

const resetMap = () => {
  drawnItems.clearLayers()
  points = []
  drawing.value = false
  areaMetros.value = null
  areaCalculada.value = false
}

const onMapClick = (e: L.LeafletMouseEvent) => {
  if (!drawing.value) return
  points.push(e.latlng)
  L.circleMarker(e.latlng, { radius: 4, color: '#f97316', fillOpacity: 1 }).addTo(drawnItems)
  if (points.length === 4) {
    const polygon = L.polygon(points, { color: '#f97316', fillColor: '#f97316', fillOpacity: 0.4 })
    drawnItems.addLayer(polygon)
    drawing.value = false
    map.off('click', onMapClick)
    
    // Calcular área en metros cuadrados
    const area = calcularAreaMetrosCuadrados(points)
    areaMetros.value = Math.round(area * 100) / 100 // Redondear a 2 decimales
    areaCalculada.value = true
    
    // Mostrar el área en el polígono
    const center = polygon.getBounds().getCenter()
    L.marker(center, {
      icon: L.divIcon({
        html: `<div style="background: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; color: #f97316; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${areaMetros.value} m²</div>`,
        className: '',
        iconSize: [80, 30]
      })
    }).addTo(drawnItems)
  }
}

// Función para calcular el área de un polígono en metros cuadrados
const calcularAreaMetrosCuadrados = (puntos: L.LatLng[]): number => {
  if (puntos.length < 3) return 0
  
  // Radio de la Tierra en metros
  const R = 6371000
  
  // Convertir a radianes y calcular área usando fórmula esférica
  const toRad = (deg: number) => deg * Math.PI / 180
  
  let area = 0
  const n = puntos.length
  
  for (let i = 0; i < n; i++) {
    const p1 = puntos[i]
    const p2 = puntos[(i + 1) % n]
    
    if (!p1 || !p2) continue

    const lat1 = toRad(p1.lat)
    const lat2 = toRad(p2.lat)
    const lng1 = toRad(p1.lng)
    const lng2 = toRad(p2.lng)
    
    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2))
  }
  
  area = Math.abs(area * R * R / 2)
  
  return area
}

const buscarUbicacion = async () => {
  if (!ubicacion.value.trim()) {
    mensajeBusqueda.value = ' Por favor ingresa una ubicación'
    return
  }

  buscando.value = true
  mensajeBusqueda.value = ' Buscando ubicación...'

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(ubicacion.value)}&limit=1`
    )
    const data = await response.json()

    if (data.length === 0) {
      mensajeBusqueda.value = ' No se encontró la ubicación. Intenta con otro nombre'
      buscando.value = false
      return
    }

    const { lat, lon, display_name } = data[0]
    const latNum = parseFloat(lat)
    const lonNum = parseFloat(lon)

    // Remover marcador anterior si existe
    if (locationMarker) {
      map.removeLayer(locationMarker)
    }

    // Crear icono personalizado para el marcador
    const customIcon = L.divIcon({
      html: '<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    })

    // Agregar marcador en la ubicación
    locationMarker = L.marker([latNum, lonNum], { icon: customIcon })
      .addTo(map)
      .bindPopup(`<b>${display_name}</b>`)
      .openPopup()

    // Mover el mapa a la ubicación con animación
    map.flyTo([latNum, lonNum], 19, {
      duration: 2
    })

    mensajeBusqueda.value = ` Ubicación encontrada: ${display_name.split(',')[0]}`
  } catch (error) {
    console.error('Error al buscar ubicación:', error)
    mensajeBusqueda.value = ' Error al buscar. Verifica tu conexión a internet'
  } finally {
    buscando.value = false
  }
}
</script>

<style scoped>
.calculadora-wrapper {
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

/* Layout */
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 3rem 1rem;
}
.text-header { text-align: center; margin-bottom: 2.5rem; }
.text-header h1 { font-size: 2.5rem; color: #1e293b; margin-bottom: 0.5rem; }
.text-header p { color: #64748b; }

.grid-layout {
  display: grid;
  grid-template-columns: 1.5fr 1fr; 
  gap: 2.5rem;
  align-items: stretch;
}

/* Cards */
.card {
  background: white;
  border-radius: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
  padding: 1.5rem;
}

/* Mapa */

.map-card { 
  padding: 0.6rem; 
  position: relative; 
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
#map {
  width: 100%;
  height: 650px;
  border-radius: 1.5rem;
  background: #cbd5e1;
  position: relative;
  z-index: 1;
}
.map-controls {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  z-index: 1000;
  display: flex;
  gap: 0.5rem;
}
.map-controls button {
  padding: 0.6rem 1rem;
  border-radius: 0.75rem;
  border: none;
  background: white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  font-weight: 600;
  cursor: pointer;
}
.btn-active { background: #f97316 !important; color: white; }

/* Formulario */
.form-card {
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  border: 1px solid #f1f5f9;
}
.input-group label {
  display: block;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: #334155;
}
.input-group input {
  width: 100%;
  padding: 0.8rem 1rem;
  background: #f1f5f9;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  outline: none;
  box-sizing: border-box;
}
.input-group input:focus {  background: #f8fafc; }
.hint { font-size: 0.75rem; color: #94a3b8; display: block;  }

.input-with-unit { position: relative; }
.unit {
  position: absolute;
  right: 1rem;
  top: 0.8rem;
  color: #94a3b8;
  font-size: 0.9rem;
}

.input-with-search { 
  position: relative; 
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.input-with-search input {
  flex: 1;
}
.btn-search {
  padding: 0.8rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
  min-width: 3rem;
}
.btn-search:hover:not(:disabled) {
  background: #2563eb;
  transform: scale(1.05);
}
.btn-search:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Botón Principal */
.btn-primary {
  margin-top: 1rem;
  background: linear-gradient(to right, #f97316, #fb923c);
  color: white;
  border: none;
  padding: 1.2rem;
  border-radius: 1rem;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.3);
}
.btn-primary:hover { transform: translateY(-2px); }

/* Iconos */
.icon.blue { color: #3b82f6; }
.icon.orange { color: #f97316; }
.icon.green { color: #10b981; }

.cursor-crosshair { cursor: crosshair !important; }

/* Responsive */
@media (max-width: 768px) {
  .grid-layout { grid-template-columns: 1fr; }
  .navbar { padding: 1rem; }
}
</style>