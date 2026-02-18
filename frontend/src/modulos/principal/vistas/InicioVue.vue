<template>
  <div class="inicio-container">
    <h1>Bienvenido a Solar Eye</h1>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.inicio-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
  background: white;
}

h1 {
  font-size: 4rem;
  font-weight: 700;
  color: #f97316;
  text-align: center;
}

@media (max-width: 768px) {
  h1 {
    font-size: 2.5rem;
    padding: 2rem;
  }
}
</style>
