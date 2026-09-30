<template>
  <header class="se-nav">
    <div class="se-nav__barra">
      <div class="se-nav__logo">Solar Eye</div>

      <button
        type="button"
        class="se-nav__toggle"
        :aria-expanded="abierto"
        aria-controls="se-nav-menu"
        :aria-label="abierto ? 'Cerrar menú' : 'Abrir menú'"
        @click="alternar"
      >
        <i class="bi" :class="abierto ? 'bi-x-lg' : 'bi-list'" aria-hidden="true"></i>
      </button>

      <nav
        id="se-nav-menu"
        class="se-nav__menu"
        :class="{ 'se-nav__menu--abierto': abierto }"
      >
        <RouterLink to="/" active-class="" exact-active-class="se-activo" @click="cerrar">
          Inicio
        </RouterLink>
        <RouterLink to="/clientes" active-class="se-activo" @click="cerrar">
          Gestión de Clientes
        </RouterLink>
        <RouterLink to="/simulacion" active-class="se-activo" @click="cerrar">
          Nueva Simulación
        </RouterLink>
      </nav>
    </div>

    <div v-if="abierto" class="se-nav__fondo" @click="cerrar"></div>
  </header>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

const BREAKPOINT_MOVIL = 768;

const route = useRoute();
const abierto = ref(false);

const cerrar = () => {
  abierto.value = false;
};
const alternar = () => {
  abierto.value = !abierto.value;
};

const alTeclear = (e: KeyboardEvent) => {
  if (e.key === 'Escape') cerrar();
};
const alRedimensionar = () => {
  if (window.innerWidth > BREAKPOINT_MOVIL) cerrar();
};

watch(() => route.fullPath, cerrar);

onMounted(() => {
  window.addEventListener('keydown', alTeclear);
  window.addEventListener('resize', alRedimensionar);
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', alTeclear);
  window.removeEventListener('resize', alRedimensionar);
});
</script>

<style scoped>
.se-nav {
  position: sticky;
  top: 0;
  z-index: 2000;
  background: var(--se-panel);
  border-bottom: 1px solid var(--se-border);
}

.se-nav__barra {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem clamp(1rem, 4vw, 4rem);
  background: var(--se-panel);
}

.se-nav__logo {
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--se-primary);
  white-space: nowrap;
}

.se-nav__menu {
  display: flex;
  gap: 2rem;
}

.se-nav__menu a {
  text-decoration: none;
  color: var(--se-text-soft);
  font-size: 0.9rem;
  font-weight: 500;
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
  transition: color 0.2s, border-color 0.2s;
}

.se-nav__menu a:hover {
  color: var(--se-primary);
}

.se-nav__menu a.se-activo {
  color: var(--se-primary);
  border-bottom-color: var(--se-primary);
}

.se-nav__menu a:focus-visible,
.se-nav__toggle:focus-visible {
  outline: 2px solid var(--se-primary);
  outline-offset: 3px;
  border-radius: 4px;
}

.se-nav__toggle,
.se-nav__fondo {
  display: none;
}

@media (max-width: 768px) {
  .se-nav__toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    font-size: 1.5rem;
    color: var(--se-text);
    background: transparent;
    border: 1px solid var(--se-border);
    border-radius: 10px;
    cursor: pointer;
  }

  .se-nav__menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    gap: 0;
    padding: 0.25rem clamp(1rem, 4vw, 4rem) 0.75rem;
    background: var(--se-panel);
    border-bottom: 1px solid var(--se-border);
    box-shadow: var(--se-shadow);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-8px);
    transition: opacity 0.2s, transform 0.2s, visibility 0.2s;
  }

  .se-nav__menu--abierto {
    opacity: 1;
    visibility: visible;
    transform: none;
  }

  .se-nav__menu a {
    padding: 0.95rem 0;
    font-size: 1rem;
    border-bottom: 1px solid var(--se-border);
  }

  .se-nav__menu a:last-child {
    border-bottom: 0;
  }

  .se-nav__menu a.se-activo {
    font-weight: 600;
    border-bottom-color: var(--se-border);
  }

  .se-nav__fondo {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 1;
    background: rgba(2, 6, 23, 0.45);
  }
}

@media (prefers-reduced-motion: reduce) {
  .se-nav__menu,
  .se-nav__menu a {
    transition: none;
  }
}
</style>