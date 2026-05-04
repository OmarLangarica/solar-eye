<template>
    <div class="contenedor">
        <div class="card">
            <div class="header">
                <h1>Solar Eye</h1>
                <p>Únete a una empresa existente</p>
            </div>

            <div class="mensaje exito" v-if="mensaje">{{ mensaje }}</div>
            <div class="mensaje error-msg" v-if="error">{{ error }}</div>

            <!-- Buscador -->
            <div class="buscador-grupo">
                <input
                    v-model="busqueda"
                    type="text"
                    placeholder="Buscar empresa por nombre..."
                    @input="buscarEmpresas"
                />
            </div>

            <!-- Resultados -->
            <div v-if="cargandoBusqueda" class="cargando">Buscando...</div>

            <div v-else-if="resultados.length > 0" class="lista-resultados">
                <div
                    v-for="empresa in resultados"
                    :key="empresa.id"
                    class="empresa-resultado"
                    :class="{ 'seleccionada': empresaSeleccionada?.id === empresa.id }"
                    @click="empresaSeleccionada = empresa"
                    :style="empresaSeleccionada?.id === empresa.id ? { borderColor: empresa.color_primario } : {}"
                >
                    <div class="empresa-color-strip" :style="{ backgroundColor: empresa.color_primario }"></div>
                    <div class="empresa-info">
                        <h3>{{ empresa.nombre }}</h3>
                    </div>
                    <span v-if="empresaSeleccionada?.id === empresa.id" class="check">✓</span>
                </div>
            </div>

            <div v-else-if="busqueda && !cargandoBusqueda" class="sin-resultados">
                No se encontraron empresas con ese nombre.
            </div>

            <button
                class="btn-principal"
                @click="unirseAEmpresa"
                :disabled="!empresaSeleccionada || cargando"
                :style="empresaSeleccionada ? { backgroundColor: empresaSeleccionada.color_primario } : {}"
            >
                {{ cargando ? 'Uniéndose...' : 'Unirme a esta empresa →' }}
            </button>

            <button class="btn-volver" @click="router.push('/seleccionar-empresa')">
                ← Volver
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/authStore';
import empresasApi from '../../superadmin/api/empresasApi';
import authApi from '../api/authApi';

const router = useRouter();
const authStore = useAuthStore();

const busqueda = ref('');
const resultados = ref<any[]>([]);
const empresaSeleccionada = ref<any>(null);
const cargandoBusqueda = ref(false);
const cargando = ref(false);
const error = ref('');
const mensaje = ref('');

let timeoutBusqueda: ReturnType<typeof setTimeout> | null = null;

const buscarEmpresas = () => {
    if (timeoutBusqueda) clearTimeout(timeoutBusqueda);
    if (!busqueda.value.trim()) {
        resultados.value = [];
        return;
    }
    timeoutBusqueda = setTimeout(async () => {
        try {
            cargandoBusqueda.value = true;
            const resp = await empresasApi.get('/');
            const todas = resp.data as any[];
            resultados.value = todas.filter(e =>
                e.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) && e.activo
            );
        } catch {
            resultados.value = [];
        } finally {
            cargandoBusqueda.value = false;
        }
    }, 400);
};

const unirseAEmpresa = async () => {
    if (!empresaSeleccionada.value) return;
    try {
        cargando.value = true;
        error.value = '';

        await authApi.post('/unirse-empresa', {
            usuario_id: authStore.usuario?.id,
            empresa_id: empresaSeleccionada.value.id,
            rol: 'trabajador'
        });

        authStore.setEmpresaActiva({
            empresa_id: empresaSeleccionada.value.id,
            empresa_nombre: empresaSeleccionada.value.nombre,
            empresa_color_primario: empresaSeleccionada.value.color_primario,
            empresa_color_secundario: empresaSeleccionada.value.color_secundario,
            rol_empresa: 'trabajador'
        });

        mensaje.value = `¡Te uniste a ${empresaSeleccionada.value.nombre}!`;
        setTimeout(() => router.push('/clientes'), 1500);

    } catch {
        error.value = 'No se pudo unir a la empresa';
    } finally {
        cargando.value = false;
    }
};
</script>

<style scoped>
.contenedor {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    padding: 1rem;
}

.card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.header { text-align: center; }
.header h1 { font-size: 1.8rem; color: #333; margin: 0 0 0.5rem; }
.header p { color: #666; font-size: 0.9rem; margin: 0; }

.mensaje { padding: 0.75rem 1rem; border-radius: 6px; font-size: 0.9rem; }
.mensaje.exito { background: #f0fdf4; color: #16a34a; }
.mensaje.error-msg { background: #fef2f2; color: #ef4444; }

.buscador-grupo input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.95rem;
    outline: none;
    box-sizing: border-box;
}
.buscador-grupo input:focus { border-color: #FF7043; }

.cargando { text-align: center; color: #999; padding: 1rem; }

.lista-resultados { display: flex; flex-direction: column; gap: 0.5rem; max-height: 250px; overflow-y: auto; }

.empresa-resultado {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    padding: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
}

.empresa-resultado:hover { border-color: #FF7043; background: #fff7ed; }
.empresa-resultado.seleccionada { background: #fff7ed; }

.empresa-color-strip { width: 6px; height: 36px; border-radius: 3px; flex-shrink: 0; }

.empresa-info { flex: 1; }
.empresa-info h3 { margin: 0 0 0.2rem; font-size: 0.95rem; color: #333; }
.empresa-plan { font-size: 0.75rem; color: #999; text-transform: capitalize; }

.check { color: #22c55e; font-weight: 700; font-size: 1.1rem; }

.sin-resultados { text-align: center; color: #999; font-size: 0.9rem; padding: 1rem; }

.btn-principal {
    width: 100%;
    padding: 0.85rem;
    background-color: #FF7043;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 1rem;
    transition: opacity 0.2s;
}
.btn-principal:hover { opacity: 0.9; }
.btn-principal:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-volver {
    width: 100%;
    padding: 0.6rem;
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    font-size: 0.85rem;
}
.btn-volver:hover { color: #333; }
</style>