<script setup lang="ts">
import MenuVue from './modulos/principal/vistas/MenuVue.vue';
import {RouterView} from 'vue-router'
</script>

<template>
  <!--<header>
    <MenuVue/>
  </header>-->
  <RouterView/> 
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
</style>