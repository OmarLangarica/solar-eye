<template>
  <div class="calculadora-wrapper">
    <header class="navbar">
      <div class="logo"><span>☀️</span> Solar Eye</div>
      <nav class="menu">
        <a href="#">Inicio</a>
        <a href="#" class="active">Calculadora</a>
        <a href="#">Cómo Funciona</a>
      </nav>
    </header>

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
            <input type="text" placeholder="ej: Ciudad de México, México">
            <span class="hint">La ubicación determina la cantidad de radiación solar disponible</span>
          </div>

          <div class="input-group">
            <label><span class="icon orange"></span> Tamaño del Techo (m²)</label>
            <div class="input-with-unit">
              <input type="number" placeholder="ej: 50">
              <span class="unit">m²</span>
            </div>
            <span class="hint">Área disponible en tu techo para instalar paneles solares</span>
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
console.log("Hello");

import 'leaflet/dist/leaflet.css'

let map: L.Map
let drawnItems: L.FeatureGroup
const drawing = ref(false)
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
  }
}
</script>

<style scoped>
.calculadora-wrapper {
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

/* Navbar */
.navbar {
  background: white;
  padding: 1rem 4rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
}
.logo { font-weight: bold; font-size: 1.25rem; color: #f97316; }
.menu { display: flex; gap: 2rem; }
.menu a { text-decoration: none; color: #64748b; font-size: 0.9rem; font-weight: 500; }
.menu a.active { color: #f97316; border-bottom: 2px solid #f97316; padding-bottom: 4px; }

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
.input-group input:focus { ring: 2px solid #f97316; background: #f8fafc; }
.hint { font-size: 0.75rem; color: #94a3b8; display: block; mt: 0.5rem; }

.input-with-unit { position: relative; }
.unit {
  position: absolute;
  right: 1rem;
  top: 0.8rem;
  color: #94a3b8;
  font-size: 0.9rem;
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