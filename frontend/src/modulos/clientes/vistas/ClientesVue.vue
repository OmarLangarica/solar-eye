<template>
    <div class="clientes-container">

        <div class="encabezado">
            <div>
                <h1>Solar Eye</h1>
                <p>Bienvenido, {{ authStore.usuario?.nombre }} {{ authStore.usuario?.apellido }}</p>
            </div>
            <div class="acciones-header">
                <button class="btn-dashboard" @click="router.push('/dashboard')">Ver dashboard</button>
                <button class="btn-agregar" @click="router.push('/clientes/agregar')">+ Nuevo cliente</button>
                <button class="btn-cerrar-sesion" @click="cerrarSesion">Cerrar sesión</button>
            </div>
        </div>

        
        <div class="mensaje exito" v-if="mensaje">{{ mensaje }}</div>
        <div class="mensaje error-msg" v-if="error">{{ error }}</div>

        <div class="buscador">
            <input v-model="busqueda" type="text" placeholder="Buscar cliente por nombre, email o ciudad..." />
        </div>

        <div class="tabla-container">
            <div v-if="cargando" class="sin-datos">Cargando clientes...</div>

            <table v-else-if="clientesFiltrados.length > 0">
                <thead>
                    <tr>
                        <th>NOMBRE</th>
                        <th>EMAIL</th>
                        <th>TELÉFONO</th>
                        <th>CIUDAD</th>
                        <th>ESTADO</th>
                        <th><span class="centrado">ACCIONES</span></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="cliente in clientesFiltrados" :key="cliente.id">
                        <td>{{ cliente.nombre }} {{ cliente.apellido }}</td>
                        <td>{{ cliente.email ?? '—' }}</td>
                        <td>{{ cliente.telefono ?? '—' }}</td>
                        <td>{{ cliente.ciudad ?? '—' }}</td>
                        <td>{{ cliente.estado ?? '—' }}</td>
                        <td class="acciones">
                            <button class="btn-editar" @click="router.push(`/clientes/editar/${cliente.id}`)">Editar</button>
                            <button class="btn-eliminar" @click="confirmarEliminar(cliente)">Eliminar</button>
                            <button class="btn-simulaciones" @click="router.push({ path: `/simulaciones/${cliente.id}`, query: { nombre: `${cliente.nombre} ${cliente.apellido}` } })">Simulaciones</button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div v-else class="sin-datos">No hay clientes registrados aún.</div>
        </div>

        
        <div v-if="modalEliminarVisible" class="overlay" @click.self="modalEliminarVisible = false">
            <div class="modal-eliminar">
                <h2>¿Eliminar cliente?</h2>
                <p>¿Estás seguro de eliminar a <strong>{{ clienteAEliminar?.nombre }} {{ clienteAEliminar?.apellido }}</strong>? Esta acción no se puede deshacer.</p>
                <div class="modal-botones">
                    <button class="btn-cancelar" @click="modalEliminarVisible = false">Cancelar</button>
                    <button class="btn-confirmar-eliminar" @click="ejecutarEliminar" :disabled="cargando">
                        {{ cargando ? 'Eliminando...' : 'Sí, eliminar' }}
                    </button>
                </div>
            </div>
        </div>
        

    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useClientes } from '../controladores/useClientes';
import { useAuthStore } from '../../../stores/authStore';
import { useAuth } from '../../auth/controladores/useAuth';
import type { Cliente } from '../interfaces/clientes-interface';

const router = useRouter();
const authStore = useAuthStore();
const { cerrarSesion } = useAuth();
const { clientes, cargando, error, mensaje, traeClientes, borrarCliente } = useClientes();

const busqueda = ref('');
const modalEliminarVisible = ref(false);
const clienteAEliminar = ref<Cliente | null>(null);

const clientesFiltrados = computed(() => {
    if (!busqueda.value) return clientes.value;
    const b = busqueda.value.toLowerCase();
    return clientes.value.filter(c =>
        `${c.nombre} ${c.apellido}`.toLowerCase().includes(b) ||
        c.email?.toLowerCase().includes(b) ||
        c.ciudad?.toLowerCase().includes(b)
    );
});

const confirmarEliminar = (cliente: Cliente) => {
    console.log('confirmarEliminar llamado', cliente);
    clienteAEliminar.value = cliente;
    modalEliminarVisible.value = true;
    console.log('modalEliminarVisible:', modalEliminarVisible.value);
};

const ejecutarEliminar = async () => {
    console.log('ejecutarEliminar llamado', clienteAEliminar.value);
    if (clienteAEliminar.value) {
        await borrarCliente(clienteAEliminar.value.id);
        console.log('después de borrar, error:', error.value);
        modalEliminarVisible.value = false;
        clienteAEliminar.value = null;
    }
};

onMounted(() => traeClientes());
</script>

<style scoped>
.clientes-container {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.encabezado {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.encabezado h1 { font-size: 1.8rem; color: #333; margin: 0; }
.encabezado p { color: #666; font-size: 0.9rem; margin: 0.25rem 0 0; }

.acciones-header { display: flex; gap: 1rem; }

.btn-dashboard {
    padding: 0.6rem 1.2rem;
    background-color: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.2s;
}
.btn-dashboard:hover { background-color: #1d4ed8; }

.btn-agregar {
    padding: 0.6rem 1.2rem;
    background-color: #FF7043;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.2s;
}
.btn-agregar:hover { background-color: #F4511E; }

.btn-cerrar-sesion {
    padding: 0.6rem 1.2rem;
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
.btn-cerrar-sesion:hover { background-color: #e0e0e0; }

.mensaje { padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.9rem; }
.mensaje.exito { background: #f0fdf4; color: #16a34a; }
.mensaje.error-msg { background: #fef2f2; color: #ef4444; }

.buscador { margin-bottom: 1.5rem; }
.buscador input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.95rem;
    outline: none;
}
.buscador input:focus { border-color: #FF7043; }

.tabla-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    overflow: hidden;
}

table { width: 100%; border-collapse: collapse; }
thead { background-color: #f5f5f5; }
th { padding: 1rem; text-align: left; font-size: 0.85rem; color: #666; font-weight: 600; }
td { padding: 1rem; border-top: 1px solid #f0f0f0; font-size: 0.95rem; color: #333; }
tr:hover td { background-color: #fafafa; }

.acciones { display: flex; gap: 0.5rem; }

.centrado{
    margin-left: 70px;
}

.btn-editar {
    padding: 0.4rem 0.8rem;
    background-color: #f59e0b;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
}
.btn-editar:hover { background-color: #d97706; }

.btn-simulaciones {
    padding: 0.4rem 0.8rem;
    background-color: #06b6d4;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
}
.btn-simulaciones:hover { background-color: #0891b2; }

.btn-eliminar {
    padding: 0.4rem 0.8rem;
    background-color: #ef4444;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
}
.btn-eliminar:hover { background-color: #dc2626; }

.sin-datos { text-align: center; padding: 3rem; color: #999; }

@media (max-width: 768px) {
    .clientes-container { padding: 1rem; }
    
    .encabezado { flex-direction: column; align-items: flex-start; gap: 1rem; }
    .acciones-header { width: 100%; justify-content: space-between; }
    .btn-dashboard, .btn-agregar, .btn-cerrar-sesion { flex: 1; padding: 0.5rem; text-align: center; }

    /* --- TARJETAS FIJAS A PRUEBA DE FALLOS --- */
    
    .tabla-container {
        box-shadow: none;
        background: transparent;
        overflow: visible !important; /* Dejamos que se vea absolutamente todo */
    }

    /* El box-sizing evita que el padding rompa el ancho de la pantalla */
    table, tbody, tr, td {
        display: block;
        box-sizing: border-box; 
    }

    table {
        width: 100% !important;
        min-width: 0 !important; 
    }
    thead { display: none; }

    tr {
        display: grid;
        grid-template-columns: 1fr 110px; 
        grid-template-rows: repeat(5, auto);
        gap: 5px;
        background: white;
        margin-bottom: 1rem;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    td {
        border: none;
        padding: 0;
        font-size: 0.9rem;
        word-break: break-word; 
    }

    /* Coordenadas exactas para los datos (Columna 1) */
    td:nth-child(1) { grid-column: 1; grid-row: 1; }
    td:nth-child(2) { grid-column: 1; grid-row: 2; }
    td:nth-child(3) { grid-column: 1; grid-row: 3; }
    td:nth-child(4) { grid-column: 1; grid-row: 4; }
    td:nth-child(5) { grid-column: 1; grid-row: 5; }

    td:nth-child(1)::before { content: "Nombre: "; font-weight: 700; color: #666; }
    td:nth-child(2)::before { content: "Email: "; font-weight: 700; color: #666; }
    td:nth-child(3)::before { content: "Teléfono: "; font-weight: 700; color: #666; }
    td:nth-child(4)::before { content: "Ciudad: "; font-weight: 700; color: #666; }
    td:nth-child(5)::before { content: "Estado: "; font-weight: 700; color: #666; }

    /* Coordenadas exactas para los botones (Columna 2) */
    td.acciones {
        grid-column: 2;
        grid-row: 1 / 6; 
        display: flex !important;
        flex-direction: column;
        justify-content: center;
        gap: 0.5rem;
        border-left: 1px solid #eee;
        padding-left: 10px;
    }

    .acciones button { 
        width: 100%; 
        font-size: 0.8rem; 
        padding: 0.5rem 0; 
        margin: 0;
    }
    
    .centrado { display: none; } 
}
/* Diseño Responsivo para el Modal */
@media (max-width: 480px) {
    .modal-eliminar {
        padding: 1.5rem;
        width: 95%;
    }

    .modal-botones {
        flex-direction: column; /* Apila los botones de confirmación */
    }

    .btn-cancelar, .btn-confirmar-eliminar {
        width: 100%;
    }
}
</style>

<!-- Estilos globales para el modal (fuera de scoped porque usa Teleport) -->
<style>
.overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.modal-eliminar {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    position: relative;
    z-index: 10000;
}

.modal-eliminar h2 { margin: 0 0 1rem; color: #333; font-size: 1.3rem; }
.modal-eliminar p { color: #666; margin-bottom: 1.5rem; line-height: 1.5; }

.modal-botones { display: flex; justify-content: flex-end; gap: 0.75rem; }

.btn-cancelar {
    padding: 0.6rem 1.2rem;
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
.btn-cancelar:hover { background-color: #e0e0e0; }

.btn-confirmar-eliminar {
    padding: 0.6rem 1.2rem;
    background-color: #ef4444;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
.btn-confirmar-eliminar:hover { background-color: #dc2626; }
.btn-confirmar-eliminar:disabled { opacity: 0.6; cursor: not-allowed; }


</style>