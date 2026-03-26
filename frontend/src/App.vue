<script setup lang="ts">
import MenuVue from './modulos/principal/vistas/MenuVue.vue';
import {RouterView} from 'vue-router'
import chatIA from './modulos/IA/components/chatIA.vue';
</script>

<template>
  <RouterView />
  <chatIA />
</template>

<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: #f8fafc;
}
.contenedor-flotante {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
}
</style>