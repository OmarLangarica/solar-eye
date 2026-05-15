<template>
    <div class="contenedor">
        <div class="encabezado">
            <div>
                <h1>Categorías</h1>
                <p>Organiza tus productos por categoría</p>
            </div>
            <button class="btn-secundario" @click="router.push('/inventario')">← Volver</button>
        </div>

        <div class="mensaje exito" v-if="mensaje">{{ mensaje }}</div>
        <div class="mensaje error-msg" v-if="error">{{ error }}</div>

        <!-- Formulario agregar -->
        <div class="card-form">
            <h3>{{ editando ? 'Editar categoría' : 'Nueva categoría' }}</h3>
            <div class="form-inline">
                <input v-model="form.nombre" type="text" placeholder="Nombre de la categoría *" class="input-nombre" />
                <input v-model="form.descripcion" type="text" placeholder="Descripción (opcional)" class="input-desc" />
                <button class="btn-principal" @click="guardarCategoria" :disabled="guardando">
                    {{ guardando ? '...' : editando ? 'Actualizar' : '+ Agregar' }}
                </button>
                <button v-if="editando" class="btn-cancelar-edit" @click="cancelarEdicion">✕</button>
            </div>
        </div>

        <!-- Lista de categorías -->
        <div class="tabla-container">
            <div v-if="cargando" class="sin-datos">Cargando categorías...</div>
            <table v-else-if="categorias.length > 0">
                <thead>
                    <tr>
                        <th>NOMBRE</th>
                        <th>DESCRIPCIÓN</th>
                        <th>ACCIONES</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="cat in categorias" :key="cat.id">
                        <td><strong>{{ cat.nombre }}</strong></td>
                        <td class="texto-gris">{{ cat.descripcion ?? '—' }}</td>
                        <td class="acciones">
                            <button class="btn-editar" @click="abrirEdicion(cat)">Editar</button>
                            <button class="btn-eliminar" @click="confirmarEliminar(cat)">Eliminar</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-else class="sin-datos">No hay categorías registradas.</div>
        </div>

        <!-- Modal eliminar -->
        <div v-if="modalEliminar" class="overlay" @click.self="modalEliminar = false">
            <div class="modal">
                <h2>¿Eliminar categoría?</h2>
                <p>¿Eliminar <strong>{{ categoriaAEliminar?.nombre }}</strong>? Los productos de esta categoría quedarán sin categoría.</p>
                <div class="modal-botones">
                    <button class="btn-cancelar" @click="modalEliminar = false">Cancelar</button>
                    <button class="btn-confirmar-eliminar" @click="ejecutarEliminar" :disabled="guardando">
                        {{ guardando ? 'Eliminando...' : 'Sí, eliminar' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/authStore';
import inventarioApi from '../api/inventarioApi';

const router = useRouter();
const authStore = useAuthStore();
const empresa_id = authStore.usuario?.empresa_id;

const categorias = ref<any[]>([]);
const cargando = ref(false);
const guardando = ref(false);
const error = ref('');
const mensaje = ref('');
const modalEliminar = ref(false);
const categoriaAEliminar = ref<any>(null);
const editando = ref(false);

const form = reactive({ id: 0, nombre: '', descripcion: '' });

const mostrarMensaje = (msg: string) => {
    mensaje.value = msg;
    setTimeout(() => mensaje.value = '', 3000);
};

const cargarCategorias = async () => {
    if (!empresa_id) return;
    cargando.value = true;
    const resp = await inventarioApi.get(`/categorias/${empresa_id}`);
    categorias.value = resp.data;
    cargando.value = false;
};

const guardarCategoria = async () => {
    if (!form.nombre.trim()) { error.value = 'El nombre es requerido'; return; }
    try {
        guardando.value = true;
        error.value = '';
        if (editando.value) {
            await inventarioApi.put('/categorias', { ...form, empresa_id });
            mostrarMensaje('Categoría actualizada correctamente');
        } else {
            await inventarioApi.post('/categorias', { ...form, empresa_id });
            mostrarMensaje('Categoría agregada correctamente');
        }
        form.id = 0;
        form.nombre = '';
        form.descripcion = '';
        editando.value = false;
        await cargarCategorias();
    } catch {
        error.value = 'No se pudo guardar la categoría';
    } finally {
        guardando.value = false;
    }
};

const abrirEdicion = (cat: any) => {
    form.id = cat.id;
    form.nombre = cat.nombre;
    form.descripcion = cat.descripcion ?? '';
    editando.value = true;
};

const cancelarEdicion = () => {
    form.id = 0;
    form.nombre = '';
    form.descripcion = '';
    editando.value = false;
};

const confirmarEliminar = (cat: any) => {
    categoriaAEliminar.value = cat;
    modalEliminar.value = true;
};

const ejecutarEliminar = async () => {
    if (!categoriaAEliminar.value) return;
    try {
        guardando.value = true;
        await inventarioApi.delete('/categorias', {
            data: { id: categoriaAEliminar.value.id, empresa_id }
        });
        modalEliminar.value = false;
        mostrarMensaje('Categoría eliminada correctamente');
        await cargarCategorias();
    } catch {
        error.value = 'No se pudo eliminar la categoría';
    } finally {
        guardando.value = false;
    }
};

onMounted(() => cargarCategorias());
</script>

<style scoped>
.contenedor { padding: 2rem; max-width: 900px; margin: 0 auto; }
.encabezado { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.encabezado h1 { font-size: 1.8rem; color: #333; margin: 0; }
.encabezado p { color: #666; font-size: 0.9rem; margin: 0.25rem 0 0; }
.btn-secundario { padding: 0.6rem 1.2rem; background-color: #f5f5f5; color: #333; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-secundario:hover { background-color: #e0e0e0; }
.mensaje { padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.9rem; }
.mensaje.exito { background: #f0fdf4; color: #16a34a; }
.mensaje.error-msg { background: #fef2f2; color: #ef4444; }
.card-form { background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 1.5rem; }
.card-form h3 { margin: 0 0 1rem; font-size: 1rem; color: #333; }
.form-inline { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; }
.input-nombre { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 0.95rem; outline: none; min-width: 180px; }
.input-nombre:focus { border-color: #1e3a8a; }
.input-desc { flex: 2; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 0.95rem; outline: none; min-width: 200px; }
.input-desc:focus { border-color: #1e3a8a; }
.btn-principal { padding: 0.6rem 1.2rem; background-color: #1e3a8a; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; white-space: nowrap; }
.btn-principal:hover { background-color: #2563eb; }
.btn-principal:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-cancelar-edit { padding: 0.6rem 0.8rem; background: #f5f5f5; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; font-size: 0.9rem; }
.tabla-container { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
thead { background-color: #f5f5f5; }
th { padding: 1rem; text-align: left; font-size: 0.85rem; color: #666; font-weight: 600; }
td { padding: 0.85rem 1rem; border-top: 1px solid #f0f0f0; font-size: 0.9rem; }
tr:hover td { background-color: #fafafa; }
.texto-gris { color: #666; }
.acciones { display: flex; gap: 0.5rem; }
.btn-editar { padding: 0.4rem 0.8rem; background-color: #1e3a8a; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; }
.btn-editar:hover { background-color: #2563eb; }
.btn-eliminar { padding: 0.4rem 0.8rem; background-color: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; }
.btn-eliminar:hover { background-color: #dc2626; }
.sin-datos { text-align: center; padding: 3rem; color: #999; }
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.modal { background: white; border-radius: 12px; padding: 2rem; width: 90%; max-width: 400px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
.modal h2 { margin: 0 0 1rem; color: #333; font-size: 1.3rem; }
.modal p { color: #666; margin-bottom: 1.5rem; line-height: 1.5; }
.modal-botones { display: flex; justify-content: flex-end; gap: 0.75rem; }
.btn-cancelar { padding: 0.6rem 1.2rem; background: #f5f5f5; color: #333; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-cancelar:hover { background: #e0e0e0; }
.btn-confirmar-eliminar { padding: 0.6rem 1.2rem; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-confirmar-eliminar:hover { background: #dc2626; }
.btn-confirmar-eliminar:disabled { opacity: 0.6; cursor: not-allowed; }
@media (max-width: 640px) { .contenedor { padding: 1rem; } .form-inline { flex-direction: column; } .input-nombre, .input-desc { width: 100%; } }
</style>