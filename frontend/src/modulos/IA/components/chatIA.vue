<template>
  <div class="contenedor-flotante">
    <Transition name="fade">
      <div v-if="abierto" class="ventana-chat">
        <div class="header-chat">
          <span>Asistente SolarEye</span>
        </div>

        <div class="cuerpo-chat" ref="chatBox">
          <div v-for="(msg, i) in historial" :key="i" :class="['msg', msg.role]">
            <div class="burbuja">
              <small>{{ msg.role === 'user' ? 'Tú' : 'IA SolarEye' }}</small>
              <p>{{ msg.content }}</p>
            </div>
          </div>
          <div v-if="cargando" class="msg ia">
            <div class="burbuja">... escribiendo</div>
          </div>
        </div>

        <div class="input-chat">
          <input 
            v-model="nuevoMsg" 
            @keyup.enter="enviar" 
            placeholder="Pregúntame algo..." 
          />
          <button @click="enviar" :disabled="cargando"></button>
        </div>
      </div>
    </Transition>

    <button
      v-if="estaAutenticado"
      class="boton-abrir"
      @click="abierto = !abierto"
    >
      <span v-if="!abierto"><i class="bi bi-robot"></i></span>
      <span v-else>X</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../../../stores/authStore';

const authStore = useAuthStore();
const abierto = ref(false);
const historial = ref([
  { role: 'ia', content: '¡Hola! Soy el experto en paneles de SolarEye. ¿En qué te ayudo hoy?' }
]);

const estaAutenticado = computed(() => authStore.estaAutenticado());
const nuevoMsg = ref('');
const cargando = ref(false);
const chatBox = ref<HTMLElement | null>(null);

const enviar = async () => {
  if (!nuevoMsg.value.trim() || cargando.value) return;

  const texto = nuevoMsg.value;
  historial.value.push({ role: 'user', content: texto });
  nuevoMsg.value = '';
  cargando.value = true;

  await nextTick();
  if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight;

  try {
    const res = await axios.post('http://localhost:3001/api/ia/chat', { 
      mensaje: texto 
    });
    historial.value.push({ role: 'ia', content: res.data.respuesta });
  } catch (e: any) {
    const msg = e.response?.data?.respuesta || 'Error: Revisa si el backend está prendido.';
    historial.value.push({ role: 'ia', content: msg });
  } finally {
    cargando.value = false;
    await nextTick();
    if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight;
  }
};
</script>

<style scoped>
.contenedor-flotante {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 999999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.boton-abrir {
  width: 65px;
  height: 65px;
  border-radius: 50%;
  background-color: #04142c;
  color: white;
  border: none;
  font-size: 30px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  transition: transform 0.2s;
}

html.theme-dark .boton-abrir {
  box-shadow: 0 4px 15px rgba(0,0,0,0.5);
}

.boton-abrir:hover { transform: scale(1.1); }



.ventana-chat {
  width: 320px;
  height: 450px;
  background: var(--se-panel);
  border-radius: 15px;
  box-shadow: var(--se-shadow);
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--se-border);
  color: var(--se-text);
  transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease;
}

.header-chat {
  background: #04142c;
  color: white;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  font-weight: bold;
}

.cuerpo-chat {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background: var(--se-panel-soft);
}

.msg { margin-bottom: 15px; display: flex; flex-direction: column; }
.user { align-items: flex-end; }
.ia { align-items: flex-start; }

.burbuja {
  max-width: 85%;
  padding: 10px;
  border-radius: 12px;
  font-size: 0.9em;
}

.user .burbuja { background: #ffe0b2; color: #5d4037; border-bottom-right-radius: 2px; }
.ia .burbuja { background: #f5f5f5; color: #333; border-bottom-left-radius: 2px; }

html.theme-dark .ia .burbuja { background: #2a3a53; color: #e5e7eb; }
html.theme-dark .user .burbuja { background: #3f5c81; color: #fff; }

.input-chat { display: flex; padding: 10px; border-top: 1px solid #eee; }
html.theme-dark .input-chat { border-top-color: #334155; }

.input-chat input { flex: 1; border: 1px solid #ddd; padding: 8px; border-radius: 20px; outline: none; background: var(--se-panel); color: var(--se-text); }
html.theme-dark .input-chat input { border-color: #334155; }

.input-chat button { background: none; border: none; font-size: 20px; cursor: pointer; }

.fade-enter-active, .fade-leave-active { transition: all 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(20px); }
</style>