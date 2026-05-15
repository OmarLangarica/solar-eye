<template>
    <div class="contenedor">
        <div class="card">
            <div class="header">
                <nav class="navbar">
                    <div class="navbar-brand">
                        <img class="navbar-logo" :src="logoSolarEye" alt="Solar Eye" />
                    </div>
                </nav>
                <p>Únete a una empresa existente</p>
            </div>

            <div class="mensaje exito" v-if="mensaje">{{ mensaje }}</div>
            <div class="mensaje error-msg" v-if="error">{{ error }}</div>

            <div class="buscador-grupo">
                <input
                    v-model="busqueda"
                    type="text"
                    placeholder="Buscar empresa por nombre..."
                    @input="buscarEmpresas"
                />
            </div>

            <div v-if="cargandoBusqueda" class="cargando">Buscando...</div>

            <div v-else-if="resultados.length > 0" class="lista-resultados">
                <div
                    v-for="empresa in resultados"
                    :key="empresa.id"
                    class="empresa-resultado"
                    :class="{ 'seleccionada': empresaSeleccionada?.id === empresa.id }"
                    @click="empresaSeleccionada = empresa"
                >
                    <div class="empresa-color-strip"></div>
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
import logoSolarEye from '../../../assets/images/LogoSolarEye.png';

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
    padding: 0 2rem 2rem;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: hidden;
}

.navbar {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.9rem 1.25rem;
    margin: 0 0 0.25rem;
    width: 100%;
    background: #04142c;
    color: white;
    margin-top: 20px;
}

.navbar-brand { display: flex; align-items: center; gap: 0.75rem; }
.navbar-logo { height: 36px; width: auto; object-fit: contain; }

.header { text-align: center; }
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
.buscador-grupo input:focus { border-color: #1e3a8a; }

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

.empresa-resultado:hover { border-color: #1e3a8a; background: #eef2ff; }
.empresa-resultado.seleccionada { background: #eef2ff; border-color: #1e3a8a; }

.empresa-color-strip {
    width: 6px;
    height: 36px;
    border-radius: 3px;
    flex-shrink: 0;
    background-color: #1e3a8a;
}

.empresa-info { flex: 1; }
.empresa-info h3 { margin: 0 0 0.2rem; font-size: 0.95rem; color: #333; }

.check { color: #22c55e; font-weight: 700; font-size: 1.1rem; }

.sin-resultados { text-align: center; color: #999; font-size: 0.9rem; padding: 1rem; }

.btn-principal {
    width: 100%;
    padding: 0.85rem;
    background-color: #1e3a8a;
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