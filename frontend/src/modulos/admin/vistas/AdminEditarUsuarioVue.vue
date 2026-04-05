<template>
    <div class="contenedor">
        <div class="encabezado">
            <div>
                <h1>Editar usuario</h1>
                <p>Modifica los datos del trabajador</p>
            </div>
            <button class="btn-secundario" @click="router.push('/admin/usuarios')">← Volver</button>
        </div>

        <div v-if="cargando" class="estado-carga">Cargando datos...</div>

        <div class="card" v-else>
            <div class="mensaje exito" v-if="mensaje">{{ mensaje }}</div>
            <div class="mensaje error-msg" v-if="error">{{ error }}</div>

            <div class="formulario">
                <div class="fila-doble">
                    <div class="grupo">
                        <label>Nombre *</label>
                        <input v-model="form.nombre" type="text" />
                    </div>
                    <div class="grupo">
                        <label>Apellido *</label>
                        <input v-model="form.apellido" type="text" />
                    </div>
                </div>
                <div class="grupo">
                    <label>Email *</label>
                    <input v-model="form.email" type="email" />
                </div>
                <div class="grupo">
                    <label>Teléfono</label>
                    <input v-model="form.telefono" type="tel" />
                </div>
                <div class="grupo">
                    <label>Rol</label>
                    <select v-model="form.rol">
                        <option value="trabajador">Trabajador</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div class="grupo">
                    <label>Estado</label>
                    <select v-model="form.activo">
                        <option :value="true">Activo</option>
                        <option :value="false">Inactivo</option>
                    </select>
                </div>

                <div class="botones">
                    <button class="btn-secundario" @click="router.push('/admin/usuarios')">Cancelar</button>
                    <button class="btn-principal" @click="editarUsuario" :disabled="guardando">
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
import adminApi from '../api/adminApi';

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
    apellido: '',
    email: '',
    telefono: '',
    rol: 'trabajador',
    activo: true
});

const traeUsuario = async () => {
    try {
        cargando.value = true;
        const resp = await adminApi.get(`/${id}`);
        const data = Array.isArray(resp.data) ? resp.data[0] : resp.data;
        Object.assign(form, {
            nombre: data.nombre,
            apellido: data.apellido,
            email: data.email,
            telefono: data.telefono ?? '',
            rol: data.rol,
            activo: Boolean(data.activo)
        });
    } catch (err) {
        error.value = 'No se pudo cargar el usuario';
    } finally {
        cargando.value = false;
    }
};

const editarUsuario = async () => {
    if (!form.nombre || !form.apellido || !form.email) {
        error.value = 'Nombre, apellido y email son requeridos';
        return;
    }
    try {
        guardando.value = true;
        error.value = '';
        await adminApi.put('/', { ...form, activo: Boolean(form.activo) });
        mensaje.value = 'Usuario actualizado correctamente';
        setTimeout(() => router.push('/admin/usuarios'), 1500);
    } catch (err) {
        error.value = 'No se pudo actualizar el usuario';
    } finally {
        guardando.value = false;
    }
};

onMounted(() => traeUsuario());
</script>

<style scoped>
.contenedor { padding: 2rem; max-width: 600px; margin: 0 auto; }

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