
Chatia · VUE
<template>
  <div class="contenedor-flotante">
    <Transition name="fade">
      <div v-if="abierto" class="ventana-chat" role="dialog" aria-label="Asistente SolarEye">
        <div class="header-chat">
          <div class="header-titulo">
            <i class="bi bi-robot header-icono" aria-hidden="true"></i>
            <span>Asistente SolarEye</span>
          </div>
          <button type="button" class="btn-cerrar" aria-label="Cerrar chat" @click="abierto = false">
            <i class="bi bi-x-lg" aria-hidden="true"></i>
          </button>
        </div>
 
        <div class="aviso">Nunca compartas en este chat contraseñas ni datos bancarios.</div>
 
        <div class="cuerpo-chat" ref="chatBox">
          <template v-for="(msg, i) in historial" :key="i">
            <!-- Menú de tarjetas -->
            <div v-if="msg.tipo === 'menu'" class="menu-opciones">
              <button
                v-for="op in opcionesMenu"
                :key="op.titulo"
                type="button"
                class="opcion"
                :disabled="cargando"
                @click="elegirOpcion(op)"
              >
                <span class="opcion-icono"><i class="bi" :class="op.icono" aria-hidden="true"></i></span>
                <span class="opcion-titulo">{{ op.titulo }}</span>
              </button>
            </div>
 
            <!-- Mensajes normales -->
            <div v-else :class="['msg', msg.role]">
              <div v-if="msg.role === 'ia'" class="avatar" aria-hidden="true">
                <i class="bi bi-robot"></i>
              </div>
              <div class="burbuja"><p>{{ msg.content }}</p></div>
            </div>
          </template>
 
          <div v-if="cargando" class="msg ia">
            <div class="avatar" aria-hidden="true"><i class="bi bi-robot"></i></div>
            <div class="burbuja puntos" aria-label="Escribiendo">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
 
        <form class="input-chat" @submit.prevent="enviar()">
          <input
            ref="inputRef"
            v-model="nuevoMsg"
            type="text"
            placeholder="Escribe tu pregunta..."
            autocomplete="off"
          />
          <button type="submit" :disabled="cargando || !nuevoMsg.trim()" aria-label="Enviar">
            <i class="bi bi-arrow-right" aria-hidden="true"></i>
          </button>
        </form>
      </div>
    </Transition>
 
    <button
      v-if="estaAutenticado"
      type="button"
      class="boton-abrir"
      :class="{ 'boton-abrir--oculto-movil': abierto }"
      :aria-label="abierto ? 'Cerrar chat' : 'Abrir chat'"
      @click="abierto = !abierto"
    >
      <i v-if="!abierto" class="bi bi-robot" aria-hidden="true"></i>
      <i v-else class="bi bi-x-lg" aria-hidden="true"></i>
    </button>
  </div>
</template>
 
<script setup lang="ts">
import { ref, nextTick, computed, watch } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../../../stores/authStore';
 
type Mensaje = { role: 'user' | 'ia'; content: string; tipo?: 'texto' | 'menu' };
type OpcionMenu = { titulo: string; icono: string; pregunta: string | null };
 
const BIENVENIDA =
  '¡Hola! Soy el experto en paneles de SolarEye.\nCuando quieras volver a esta pantalla del chat, escribe menú.\n\n¿En qué te puedo ayudar?';
 
// Aquí puedes cambiar los textos, iconos (Bootstrap Icons) y preguntas del menú.
// Si "pregunta" es null, solo invita a escribir en el campo de texto.
const opcionesMenu: OpcionMenu[] = [
  { titulo: 'Hacer una simulación', icono: 'bi-sun', pregunta: '¿Cómo hago una simulación solar paso a paso?' },
  { titulo: 'Clientes y citas', icono: 'bi-people', pregunta: '¿Cómo registro clientes y agendo citas?' },
  { titulo: 'Inventario y componentes', icono: 'bi-box-seam', pregunta: '¿Cómo funciona el inventario y el catálogo de componentes?' },
  { titulo: 'Otras dudas', icono: 'bi-question-circle', pregunta: null }
];
 
const authStore = useAuthStore();
const abierto = ref(false);
const historial = ref<Mensaje[]>([
  { role: 'ia', content: BIENVENIDA },
  { role: 'ia', content: '', tipo: 'menu' }
]);
 
const estaAutenticado = computed(() => authStore.estaAutenticado());
const nuevoMsg = ref('');
const cargando = ref(false);
const chatBox = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
 
const bajarScroll = async () => {
  await nextTick();
  if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight;
};
 
watch(abierto, (valor) => {
  if (valor) bajarScroll();
});
 
const esComandoMenu = (texto: string) =>
  texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase() === 'menu';
 
const mostrarMenu = () => {
  historial.value.push(
    { role: 'ia', content: BIENVENIDA },
    { role: 'ia', content: '', tipo: 'menu' }
  );
  bajarScroll();
};
 
// "mensaje" es lo que se manda a la IA; "etiqueta" es lo que se ve en la burbuja del usuario.
const enviar = async (mensaje?: string, etiqueta?: string) => {
  const texto = (mensaje ?? nuevoMsg.value).trim();
  if (!texto || cargando.value) return;
 
  historial.value.push({ role: 'user', content: etiqueta ?? texto });
  nuevoMsg.value = '';
 
  if (esComandoMenu(texto)) {
    mostrarMenu();
    return;
  }
 
  cargando.value = true;
  await bajarScroll();
 
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
    await bajarScroll();
  }
};
 
const elegirOpcion = (op: OpcionMenu) => {
  if (cargando.value) return;
 
  if (op.pregunta) {
    enviar(op.pregunta, op.titulo);
    return;
  }
 
  historial.value.push({ role: 'user', content: op.titulo });
  historial.value.push({ role: 'ia', content: 'Claro, escríbeme tu duda en el campo de abajo y te ayudo.' });
  bajarScroll();
  inputRef.value?.focus();
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
 
/* ---------- Botón flotante ---------- */
.boton-abrir {
  width: 65px;
  height: 65px;
  border-radius: 50%;
  background-color: #04142c;
  color: white;
  border: none;
  font-size: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s;
}
 
html.theme-dark .boton-abrir {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
}
 
.boton-abrir:hover {
  transform: scale(1.1);
}
 
/* ---------- Ventana ---------- */
.ventana-chat {
  --chat-acento: #1d4f91;
  --chat-acento-soft: #e8f0fb;
 
  width: min(380px, calc(100vw - 24px));
  height: min(560px, calc(100vh - 130px));
  height: min(560px, calc(100dvh - 130px));
  background: var(--se-panel);
  border-radius: 16px;
  box-shadow: var(--se-shadow);
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--se-border);
  color: var(--se-text);
  transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease;
}
 
html.theme-dark .ventana-chat {
  --chat-acento: #93c5fd;
  --chat-acento-soft: #1b2b45;
}
 
.header-chat {
  background: #04142c;
  color: white;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  font-weight: 700;
}
 
.header-titulo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
}
 
.header-titulo span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
 
.header-icono {
  color: #ffffff;
  font-size: 1.25rem;
}
 
.btn-cerrar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
}
 
.btn-cerrar:hover {
  background: rgba(255, 255, 255, 0.12);
}
 
.aviso {
  padding: 8px 14px;
  text-align: center;
  font-size: 0.72rem;
  color: var(--se-text-soft);
  border-bottom: 1px solid var(--se-border);
}
 
/* ---------- Cuerpo ---------- */
.cuerpo-chat {
  flex: 1;
  padding: 14px;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  background: var(--se-panel);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
 
.msg {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}
 
.msg.user {
  justify-content: flex-end;
}
 
.msg.ia {
  justify-content: flex-start;
}
 
.avatar {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #1d4f91;
  color: #ffffff;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
 
.burbuja {
  max-width: 85%;
  padding: 10px 12px;
  border-radius: 14px;
  font-size: 0.92rem;
  line-height: 1.45;
  word-break: break-word;
}
 
.burbuja p {
  margin: 0;
  white-space: pre-line;
}
 
.ia .burbuja {
  background: var(--se-panel-soft);
  color: var(--se-text);
  border-bottom-left-radius: 4px;
}
 
.user .burbuja {
  background: #ffe0b2;
  color: #5d4037;
  border-bottom-right-radius: 4px;
}
 
html.theme-dark .user .burbuja {
  background: #3f5c81;
  color: #fff;
}
 
/* Indicador de "escribiendo" */
.puntos {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 14px;
}
 
.puntos span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--se-text-soft);
  animation: salto 1s infinite ease-in-out;
}
 
.puntos span:nth-child(2) { animation-delay: 0.15s; }
.puntos span:nth-child(3) { animation-delay: 0.3s; }
 
@keyframes salto {
  0%, 80%, 100% { opacity: 0.3; transform: translateY(0); }
  40% { opacity: 1; transform: translateY(-3px); }
}
 
/* ---------- Menú de tarjetas ---------- */
.menu-opciones {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 130px), 1fr));
  gap: 10px;
}
 
.opcion {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 112px;
  padding: 14px 8px;
  background: var(--se-panel);
  color: var(--se-text);
  border: 1px solid var(--se-border);
  border-radius: 14px;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.1);
  font-family: inherit;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
}
 
.opcion:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: var(--chat-acento);
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.15);
}
 
.opcion:focus-visible {
  outline: 2px solid var(--chat-acento);
  outline-offset: 2px;
}
 
.opcion:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
 
.opcion-icono {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--chat-acento-soft);
  color: var(--chat-acento);
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
 
.opcion-titulo {
  font-size: 0.85rem;
  font-weight: 600;
  line-height: 1.25;
  text-align: center;
}
 
/* ---------- Campo de texto ---------- */
.input-chat {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--se-border);
  background: var(--se-panel);
}
 
.input-chat input {
  flex: 1;
  min-width: 0;
  padding: 10px 14px;
  border: 1px solid var(--se-border);
  border-radius: 22px;
  outline: none;
  background: var(--se-panel);
  color: var(--se-text);
  font-size: 16px; /* evita el zoom automático en iPhone */
  font-family: inherit;
}
 
.input-chat input:focus {
  border-color: var(--se-primary, #f97316);
}
 
.input-chat button {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #04142c;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.1rem;
  cursor: pointer;
}
 
.input-chat button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
 
/* ---------- Transición ---------- */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
 
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
 
/* ---------- Celular (y celular en horizontal): pantalla completa ---------- */
@media (max-width: 480px), (max-height: 520px) {
  .contenedor-flotante {
    right: 12px;
    bottom: max(12px, env(safe-area-inset-bottom, 0px));
  }
 
  .ventana-chat {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100vh;
    height: 100dvh;
    margin: 0;
    border: 0;
    border-radius: 0;
  }
 
  .header-chat {
    padding-top: calc(12px + env(safe-area-inset-top, 0px));
  }
 
  .boton-abrir {
    width: 56px;
    height: 56px;
    font-size: 26px;
  }
 
  /* Con el chat abierto se cierra desde la X del encabezado */
  .boton-abrir--oculto-movil {
    display: none;
  }
}
 
@media (prefers-reduced-motion: reduce) {
  .puntos span {
    animation: none;
  }
 
  .opcion,
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}
</style>
 




















