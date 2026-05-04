<template>
    <div class="contenedor">
        <div class="encabezado">
            <div>
                <h1>Editar empresa</h1>
                <p>Modifica los datos de la empresa</p>
            </div>
            <button class="btn-secundario" @click="router.push('/superadmin/empresas')">← Volver</button>
        </div>

        <div v-if="cargando && !form.nombre" class="estado-carga">Cargando datos...</div>

        <div class="card" v-else>
            <div class="mensaje exito" v-if="mensaje">{{ mensaje }}</div>
            <div class="mensaje error-msg" v-if="error">{{ error }}</div>

            <div class="formulario">
                <div class="grupo">
                    <label>Nombre de la empresa *</label>
                    <input v-model="form.nombre" type="text" />
                </div>

                <div class="fila-doble">
                    <div class="grupo">
                        <label>Color primario</label>
                        <div class="color-grupo">
                            <input v-model="form.color_primario" type="color" class="input-color" />
                            <input v-model="form.color_primario" type="text" class="input-hex" />
                        </div>
                    </div>
                    <div class="grupo">
                        <label>Color secundario</label>
                        <div class="color-grupo">
                            <input v-model="form.color_secundario" type="color" class="input-color" />
                            <input v-model="form.color_secundario" type="text" class="input-hex" />
                        </div>
                    </div>
                </div>

                <div class="fila-doble">
                    <div class="grupo">
                        <label>Plan</label>
                        <select v-model="form.plan">
                            <option value="basico">Básico</option>
                            <option value="profesional">Profesional</option>
                            <option value="enterprise">Enterprise</option>
                        </select>
                    </div>
                    <div class="grupo">
                        <label>Estado</label>
                        <select v-model="form.activo">
                            <option :value="true">Activa</option>
                            <option :value="false">Inactiva</option>
                        </select>
                    </div>
                </div>

                <!-- Preview branding -->
                <div class="preview-branding">
                    <h3>Preview de branding</h3>
                    <div class="preview-card" :style="{ borderTopColor: form.color_primario }">
                        <div class="preview-header" :style="{ backgroundColor: form.color_primario }">
                            <span>{{ form.nombre || 'Nombre de la empresa' }}</span>
                        </div>
                        <div class="preview-body">
                            <button class="preview-btn" :style="{ backgroundColor: form.color_primario }">
                                Botón primario
                            </button>
                            <button class="preview-btn-sec" :style="{ color: form.color_primario, borderColor: form.color_primario }">
                                Botón secundario
                            </button>
                        </div>
                    </div>
                </div>

                <div class="botones">
                    <button class="btn-secundario" @click="router.push('/superadmin/empresas')">Cancelar</button>
                    <button class="btn-principal" @click="editarEmpresa" :disabled="guardando">
                        {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import empresasApi from '../api/empresasApi';

const router = useRouter();
const route = useRoute();
const id = Number(route.params.id);

const cargando = ref(false);
const guardando = ref(false);
const error = ref('');
const mensaje = ref('');

const form = reactive({
    id,
    nombre: '',
    color_primario: '#FF7043',
    color_secundario: '#F4511E',
    plan: 'profesional',
    activo: true
});

const traeEmpresa = async () => {
    try {
        cargando.value = true;
        const resp = await empresasApi.get(`/${id}`);
        const data = Array.isArray(resp.data) ? resp.data[0] : resp.data;
        Object.assign(form, {
            nombre: data.nombre,
            color_primario: data.color_primario ?? '#FF7043',
            color_secundario: data.color_secundario ?? '#F4511E',
            plan: data.plan,
            activo: Boolean(data.activo)
        });
    } catch {
        error.value = 'No se pudo cargar la empresa';
    } finally {
        cargando.value = false;
    }
};

const editarEmpresa = async () => {
    if (!form.nombre.trim()) {
        error.value = 'El nombre de la empresa es requerido';
        return;
    }
    try {
        guardando.value = true;
        error.value = '';
        await empresasApi.put('/', { ...form, activo: Boolean(form.activo) });
        mensaje.value = 'Empresa actualizada correctamente';
        setTimeout(() => router.push('/superadmin/empresas'), 1500);
    } catch {
        error.value = 'No se pudo actualizar la empresa';
    } finally {
        guardando.value = false;
    }
};

onMounted(() => traeEmpresa());
</script>

<style scoped>
.contenedor { padding: 2rem; max-width: 700px; margin: 0 auto; }

.encabezado {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.encabezado h1 { font-size: 1.8rem; color: #333; margin: 0; }
.encabezado p { color: #666; font-size: 0.9rem; margin: 0.25rem 0 0; }

.estado-carga { text-align: center; padding: 3rem; color: #999; }

.card {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.mensaje { padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.9rem; }
.mensaje.exito { background: #f0fdf4; color: #16a34a; }
.mensaje.error-msg { background: #fef2f2; color: #ef4444; }

.formulario { display: flex; flex-direction: column; gap: 1.25rem; }
.fila-doble { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.grupo { display: flex; flex-direction: column; gap: 0.4rem; }
.grupo label { font-size: 0.875rem; font-weight: 600; color: #333; }

.grupo input, .grupo select {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 0.95rem;
    outline: none;
}
.grupo input:focus, .grupo select:focus { border-color: #FF7043; }

.color-grupo { display: flex; gap: 0.5rem; align-items: center; }
.input-color { width: 48px; height: 42px; border: 1px solid #ddd; border-radius: 5px; cursor: pointer; padding: 2px; }
.input-hex { flex: 1; }

.preview-branding { margin-top: 0.5rem; }
.preview-branding h3 { font-size: 0.875rem; font-weight: 600; color: #333; margin: 0 0 0.75rem; }

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

.preview-body {
    padding: 1rem;
    display: flex;
    gap: 0.75rem;
    background: #fafafa;
}

.preview-btn {
    padding: 0.5rem 1rem;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 0.85rem;
    cursor: default;
}

.preview-btn-sec {
    padding: 0.5rem 1rem;
    background: white;
    border: 1px solid;
    border-radius: 5px;
    font-size: 0.85rem;
    cursor: default;
}

.botones { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 0.5rem; }

.btn-principal {
    padding: 0.6rem 1.5rem;
    background-color: #FF7043;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
.btn-principal:hover { background-color: #F4511E; }
.btn-principal:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-secundario {
    padding: 0.6rem 1.5rem;
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
.btn-secundario:hover { background-color: #e0e0e0; }

@media (max-width: 640px) {
    .contenedor { padding: 1rem; }
    .fila-doble { grid-template-columns: 1fr; }
    .botones { flex-direction: column; }
    .btn-principal, .btn-secundario { width: 100%; text-align: center; }
}
</style>