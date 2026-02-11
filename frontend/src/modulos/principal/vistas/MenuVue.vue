<template>
  <header class="navbar">
    <div class="logo"><span>☀️</span> Solar Eye</div>
    <nav class="menu">
      <a href="#">Inicio</a>
      <RouterLink to="/mapa" class="active">Calculadora</RouterLink>
      <a href="#">Cómo Funciona</a>
    </nav>
  </header>
</template>

<script setup lang="ts">

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
}
.menu a.active { 
  color: #f97316; 
  border-bottom: 2px solid #f97316; 
  padding-bottom: 4px; 
}
</style>