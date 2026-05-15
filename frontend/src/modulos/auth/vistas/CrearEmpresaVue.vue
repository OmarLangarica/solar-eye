<template>
    <div class="contenedor">
        <div class="card">
            <div class="header">
                <nav class="navbar">
                    <div class="navbar-brand">
                        <img class="navbar-logo" :src="logoSolarEye" alt="Solar Eye" />
                    </div>
                </nav>
                <p>Crea tu empresa y comienza a usar Solar Eye</p>
            </div>

            <div class="mensaje exito" v-if="mensaje">{{ mensaje }}</div>
            <div class="mensaje error-msg" v-if="error">{{ error }}</div>

            <div class="formulario">
                <div class="grupo">
                    <label>Nombre de la empresa *</label>
                    <input v-model="form.nombre" type="text" placeholder="Ej: Solar Sinaloa S.A." />
                </div>

                <button class="btn-principal" @click="crearEmpresa" :disabled="cargando">
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
import logoSolarEye from '../../../assets/images/LogoSolarEye.png';

const router = useRouter();
const authStore = useAuthStore();

const cargando = ref(false);
const error = ref('');
const mensaje = ref('');

const form = reactive({
    nombre: '',
    color_primario: '#1e3a8a',
    color_secundario: '#2563eb',
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

        const respEmpresa = await empresasApi.post('/', form);
        const empresa_id = respEmpresa.data.insertId;

        await authApi.post('/unirse-empresa', {
            usuario_id: authStore.usuario?.id,
            empresa_id,
            rol: 'admin'
        });

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
    padding: 0 2rem 2rem;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    overflow: hidden;
}

.navbar {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.9rem 1.25rem;
    margin: 0 0 1.25rem;
    width: 100%;
    background: #04142c;
    color: white;
    margin-top: 20px;
}

.navbar-brand { display: flex; align-items: center; gap: 0.75rem; }
.navbar-logo { height: 36px; width: auto; object-fit: contain; }

.header { text-align: center; margin-bottom: 2rem; }
.header p { color: #666; font-size: 0.9rem; margin: 0; }

.mensaje { padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.9rem; }
.mensaje.exito { background: #f0fdf4; color: #16a34a; }
.mensaje.error-msg { background: #fef2f2; color: #ef4444; }

.formulario { display: flex; flex-direction: column; gap: 1.25rem; }
.grupo { display: flex; flex-direction: column; gap: 0.4rem; }
.grupo label { font-size: 0.875rem; font-weight: 600; color: #333; }

.grupo input {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 0.95rem;
    outline: none;
}
.grupo input:focus { border-color: #1e3a8a; }

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

@media (max-width: 480px) {
    .fila-doble { grid-template-columns: 1fr; }
}
</style>