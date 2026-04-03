<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { RouterView } from 'vue-router';
import chatIA from './modulos/IA/components/chatIA.vue';

type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'solar-eye-theme';
const theme = ref<ThemeMode>('light');

const isDark = computed(() => theme.value === 'dark');

const aplicaTema = (modo: ThemeMode) => {
  const root = document.documentElement;
  root.classList.toggle('theme-dark', modo === 'dark');
  root.classList.toggle('theme-light', modo === 'light');
};

const alternarTema = () => {
  theme.value = isDark.value ? 'light' : 'dark';
};

onMounted(() => {
  const guardado = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
  const preferenciaSistema = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  theme.value = guardado === 'dark' || guardado === 'light' ? guardado : preferenciaSistema;
  aplicaTema(theme.value);
});

watch(theme, (modo) => {
  aplicaTema(modo);
  localStorage.setItem(STORAGE_KEY, modo);
  window.dispatchEvent(new CustomEvent('solar-eye-theme-changed', { detail: { mode: modo } }));
});
</script>

<template>
  <button
    class="theme-toggle-flotante"
    type="button"
    @click="alternarTema"
    :aria-label="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
    :title="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
  >
    <i v-if="isDark" class="bi bi-brightness-high theme-icon-flotante" aria-hidden="true"></i>
    <i v-else class="bi bi-moon theme-icon-flotante" aria-hidden="true"></i>
  </button>

  <main class="app-main">
    <RouterView />
  </main>

  <div class="contenedor-flotante">
    <chatIA />
  </div>
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

.app-main {
  min-height: 100vh;
}

.theme-toggle-flotante {
  position: fixed;
  bottom: 16px;
  left: 16px;
  z-index: 10000;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.theme-toggle-flotante:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.16);
  background: rgba(255, 255, 255, 1);
}

.theme-toggle-flotante:active {
  transform: scale(0.95);
}

.theme-icon-flotante {
  font-size: 1.2rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
}

/* Tema oscuro */
:root.theme-dark .theme-icon-flotante {
  color: #ffffff;
}
:root.theme-dark .theme-toggle-flotante {
  background: rgba(30, 30, 30, 0.9);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

:root.theme-dark .theme-toggle-flotante:hover {
  background: rgba(50, 50, 50, 0.95);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

@media (max-width: 640px) {
  .theme-toggle-flotante {
    width: 40px;
    height: 40px;
    bottom: 12px;
    left: 12px;
  }

  .theme-icon-flotante {
    font-size: 1rem;
  }
}
</style>