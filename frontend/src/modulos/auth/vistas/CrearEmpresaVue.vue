<template>
    <div class="contenedor">
        <div class="card">
            <div class="header">
                <h1>Solar Eye</h1>
                <p>Crea tu empresa y comienza a usar Solar Eye</p>
            </div>

            <div class="mensaje exito" v-if="mensaje">{{ mensaje }}</div>
            <div class="mensaje error-msg" v-if="error">{{ error }}</div>

            <div class="formulario">
                <div class="grupo">
                    <label>Nombre de la empresa *</label>
                    <input v-model="form.nombre" type="text" placeholder="Ej: Solar Sinaloa S.A." />
                </div>

                <div class="fila-doble">
                    <div class="grupo">
                        <label>Color primario</label>
                        <div class="color-grupo">
                            <input v-model="form.color_primario" type="color" class="input-color" />
                            <input v-model="form.color_primario" type="text" class="input-hex" placeholder="#FF7043" />
                        </div>
                    </div>
                    <div class="grupo">
                        <label>Color secundario</label>
                        <div class="color-grupo">
                            <input v-model="form.color_secundario" type="color" class="input-color" />
                            <input v-model="form.color_secundario" type="text" class="input-hex" placeholder="#F4511E" />
                        </div>
                    </div>
                </div>

                <!-- Preview -->
                <div class="preview-branding">
                    <p class="preview-label">Vista previa</p>
                    <div class="preview-card" :style="{ borderTopColor: form.color_primario }">
                        <div class="preview-header" :style="{ backgroundColor: form.color_primario }">
                            {{ form.nombre || 'Nombre de tu empresa' }}
                        </div>
                        <div class="preview-body">
                            <button class="preview-btn" :style="{ backgroundColor: form.color_primario }">
                                Botón primario
                            </button>
                        </div>
                    </div>
                </div>

                <button class="btn-principal" @click="crearEmpresa" :disabled="cargando"
                    :style="{ backgroundColor: form.color_primario }">
                    {{ cargando ? 'Creando empresa...' : 'Crear empresa →' }}
                </button>

                <button class="btn-volver" @click="router.push('/seleccionar-empresa')">
                    ← Volver
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/authStore';
import empresasApi from '../../superadmin/api/empresasApi';
import authApi from '../api/authApi';

const router = useRouter();
const authStore = useAuthStore();

const cargando = ref(false);
const error = ref('');
const mensaje = ref('');

const form = reactive({
    nombre: '',
    color_primario: '#FF7043',
    color_secundario: '#F4511E',
    plan: 'basico',
    activo: true
});

const crearEmpresa = async () => {
    if (!form.nombre.trim()) {
        error.value = 'El nombre de la empresa es requerido';
        return;
    }
    try {
        cargando.value = true;
        error.value = '';

        // Crea la empresa
        const respEmpresa = await empresasApi.post('/', form);
        const empresa_id = respEmpresa.data.insertId;

        // Une al usuario como admin de la empresa
        await authApi.post('/unirse-empresa', {
            usuario_id: authStore.usuario?.id,
            empresa_id,
            rol: 'admin'
        });

        // Establece la empresa activa en el store
        authStore.setEmpresaActiva({
            empresa_id,
            empresa_nombre: form.nombre,
            empresa_color_primario: form.color_primario,
            empresa_color_secundario: form.color_secundario,
            rol_empresa: 'admin'
        });

        mensaje.value = '¡Empresa creada correctamente!';
        setTimeout(() => router.push('/admin/dashboard'), 1500);

    } catch {
        error.value = 'No se pudo crear la empresa';
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
}

.header { text-align: center; margin-bottom: 2rem; }
.header h1 { font-size: 1.8rem; color: #333; margin: 0 0 0.5rem; }
.header p { color: #666; font-size: 0.9rem; margin: 0; }

.mensaje { padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.9rem; }
.mensaje.exito { background: #f0fdf4; color: #16a34a; }
.mensaje.error-msg { background: #fef2f2; color: #ef4444; }

.formulario { display: flex; flex-direction: column; gap: 1.25rem; }
.fila-doble { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.grupo { display: flex; flex-direction: column; gap: 0.4rem; }
.grupo label { font-size: 0.875rem; font-weight: 600; color: #333; }

.grupo input {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 0.95rem;
    outline: none;
}
.grupo input:focus { border-color: #FF7043; }

.color-grupo { display: flex; gap: 0.5rem; align-items: center; }
.input-color { width: 48px; height: 42px; border: 1px solid #ddd; border-radius: 5px; cursor: pointer; padding: 2px; }
.input-hex { flex: 1; }

.preview-label { font-size: 0.875rem; font-weight: 600; color: #333; margin: 0 0 0.5rem; }

.preview-card {
    border-radius: 8px;
    border-top: 4px solid;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.preview-header {
    padding: 0.75rem 1rem;
    color: white;
    font-weight: 600;
    font-size: 0.9rem;
}

.preview-body { padding: 1rem; background: #fafafa; }

.preview-btn {
    padding: 0.5rem 1rem;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 0.85rem;
    cursor: default;
}

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

@media (max-width: 480px) {
    .fila-doble { grid-template-columns: 1fr; }
}
</style>