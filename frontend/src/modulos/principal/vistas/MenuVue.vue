<template>
  <header class="navbar">
    <div class="logo">Solar Eye</div>
    <nav class="menu">
      <RouterLink to="/">Inicio</RouterLink>
      <RouterLink to="/clientes">Gestión de Clientes</RouterLink>
      <RouterLink to="/simulacion">Nueva Simulación</RouterLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<style scoped>
/* Navbar */
.navbar {
  background: white;
  padding: 1rem 4rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  position: relative;
  z-index: 2000;
}
.logo { 
  font-weight: bold; 
  font-size: 1.25rem; 
  color: #f97316; 
}
.menu { 
  display: flex; 
  gap: 2rem; 
}
.menu a { 
  text-decoration: none; 
  color: #64748b; 
  font-size: 0.9rem; 
  font-weight: 500;
  transition: all 0.3s;
}
.menu a:hover {
  color: #f97316;
}
.menu a.active,
.menu a.router-link-active { 
  color: #f97316; 
  border-bottom: 2px solid #f97316; 
  padding-bottom: 4px; 
}
</style>