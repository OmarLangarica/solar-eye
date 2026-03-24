<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { RouterView } from 'vue-router';

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
  <header class="app-header">
    <div class="app-brand">Solar Eye</div>
    <button
      class="theme-toggle"
      type="button"
      @click="alternarTema"
      :aria-label="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
    >
      <span class="theme-icon" aria-hidden="true">{{ isDark ? '☀' : '🌙' }}</span>
      <span class="theme-text">{{ isDark ? 'Claro' : 'Oscuro' }}</span>
    </button>
  </header>

  <main class="app-main">
    <RouterView />
  </main>
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

.app-header {
  position: sticky;
  top: 0;
  z-index: 10001;
  height: 58px;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid #e5e7eb;
  backdrop-filter: blur(8px);
}

.app-brand {
  font-weight: 800;
  font-size: 0.98rem;
  color: #f97316;
}

.app-main {
  min-height: calc(100vh - 58px);
}

.theme-toggle {
  border: 1px solid #d1d5db;
  background: #ffffff;
  color: #111827;
  border-radius: 999px;
  padding: 0.4rem 0.8rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.18);
  cursor: pointer;
}

.theme-toggle:hover {
  transform: translateY(-1px);
}

.theme-icon {
  font-size: 1rem;
  line-height: 1;
}

.theme-text {
  font-size: 0.85rem;
}

@media (max-width: 640px) {
  .app-header {
    height: 52px;
    padding: 0 0.75rem;
  }

  .app-main {
    min-height: calc(100vh - 52px);
  }

  .app-brand {
    font-size: 0.9rem;
  }

  .theme-toggle {
    padding: 0.35rem 0.65rem;
  }

  .theme-text {
    font-size: 0.78rem;
  }
}
</style>