<template>
  <div class="mapa-container">
    <div class="controls">
      <button class="draw-btn" @click="startDrawing">
        Dibujar techo
      </button>
      <button class="clear-btn" @click="resetMap">
        Limpiar
      </button>
    </div>

    <div id="map" :class="{ drawing: drawing }"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

let map: L.Map
let drawnItems: L.FeatureGroup

const drawing = ref(false)
let points: L.LatLng[] = []

onMounted(() => {
  map = L.map('map').setView([24.8091, -107.3940], 13)

  L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { maxZoom: 19 }
  ).addTo(map)

  drawnItems = new L.FeatureGroup()
  map.addLayer(drawnItems)
})

// Iniciar dibujo
const startDrawing = () => {
  resetMap()          
  drawing.value = true
  map.on('click', onMapClick)
}

// Reset TOTAL (como antes de dibujar)
const resetMap = () => {
  drawing.value = false
  points = []

  // Quitar dibujos
  if (drawnItems) {
    drawnItems.clearLayers()
  }

  // Quitar eventos
  if (map) {
    map.off('click', onMapClick)
  }
}

// Click en el mapa
const onMapClick = (e: L.LeafletMouseEvent) => {
  if (!drawing.value) return

  points.push(e.latlng)

  // Dibujar punto
  L.circleMarker(e.latlng, {
    radius: 5,
    color: '#2ecc71'
  }).addTo(drawnItems)

  // Al llegar a 4 puntos → crear polígono
  if (points.length === 4) {
    const polygon = L.polygon(points, {
      color: '#2ecc71'
    })

    drawnItems.addLayer(polygon)

    console.log('Techo dibujado:', points)

    // Salir automáticamente del modo dibujo
    drawing.value = false
    map.off('click', onMapClick)
  }
}
</script>

<style scoped>
.mapa-container {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 1;
}

#map {
  width: 100%;
  height: calc(100vh - 56px);
  position: relative;
  z-index: 1;
}

/* Cursor de dibujo */
#map.drawing {
  cursor: crosshair;
}

.controls {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
  display: flex;
  gap: 8px;
}

.draw-btn {
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.clear-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.draw-btn:hover {
  background-color: #27ae60;
}

.clear-btn:hover {
  background-color: #2980b9;
}
</style>
