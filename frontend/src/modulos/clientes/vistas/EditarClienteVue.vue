<template>
    <div class="contenedor">
        <div class="encabezado">
            <h1>Editar Cliente</h1>
            <button class="btn-volver" @click="router.push('/clientes')">← Volver</button>
        </div>

        <div class="card" v-if="clienteSeleccionado">
            <form @submit="onSubmit" class="formulario">

                <div class="fila-doble">
                    <div class="grupo">
                        <label>Nombre *</label>
                        <input v-model="nombreValue" type="text"
                            :class="{ 'input-error': nombreError }" />
                        <span class="error-msg" v-if="nombreError">{{ nombreError }}</span>
                    </div>
                    <div class="grupo">
                        <label>Apellido *</label>
                        <input v-model="apellidoValue" type="text"
                            :class="{ 'input-error': apellidoError }" />
                        <span class="error-msg" v-if="apellidoError">{{ apellidoError }}</span>
                    </div>
                </div>

                <div class="fila-doble">
                    <div class="grupo">
                        <label>Email</label>
                        <input v-model="emailValue" type="email"
                            :class="{ 'input-error': emailError }" />
                        <span class="error-msg" v-if="emailError">{{ emailError }}</span>
                    </div>
                    <div class="grupo">
                        <label>Teléfono</label>
                        <input v-model="telefonoValue" type="tel"
                            :class="{ 'input-error': telefonoError }" />
                        <span class="error-msg" v-if="telefonoError">{{ telefonoError }}</span>
                    </div>
                </div>

                <div class="grupo">
                    <label>Dirección</label>
                    <input v-model="direccionValue" type="text" />
                </div>

                <div class="fila-triple">
                    <div class="grupo">
                        <label>Ciudad</label>
                        <input v-model="ciudadValue" type="text" />
                    </div>
                    <div class="grupo">
                        <label>Estado</label>
                        <input v-model="estadoValue" type="text" />
                    </div>
                    <div class="grupo">
                        <label>C.P.</label>
                        <input v-model="cpValue" type="text" />
                    </div>
                </div>

                <div class="grupo">
                    <label>Notas</label>
                    <textarea v-model="notasValue" rows="3"></textarea>
                </div>

                <div class="mensaje exito" v-if="mensaje">{{ mensaje }}</div>
                <div class="mensaje error" v-if="error">{{ error }}</div>

                <div class="botones">
                    <button type="button" class="btn-cancelar" @click="router.push('/clientes')">Cancelar</button>
                    <button type="submit" class="btn-guardar" :disabled="cargando">
                        {{ cargando ? 'Actualizando...' : 'Actualizar cliente' }}
                    </button>
                </div>

            </form>
        </div>

        <div v-else class="cargando">Cargando cliente...</div>

    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import { clienteSchema } from '../schemas/clientesSchema';
import { useClientes } from '../controladores/useClientes';

const router = useRouter();
const route = useRoute();
const { cargando, error, mensaje, clienteSeleccionado, traeClienteId, actualizarCliente } = useClientes();

const { handleSubmit, setValues } = useForm({ validationSchema: clienteSchema });
const { value: nombreValue, errorMessage: nombreError } = useField<string>('nombre');
const { value: apellidoValue, errorMessage: apellidoError } = useField<string>('apellido');
const { value: emailValue, errorMessage: emailError } = useField<string>('email');
const { value: telefonoValue, errorMessage: telefonoError } = useField<string>('telefono');
const { value: direccionValue } = useField<string>('direccion');
const { value: ciudadValue } = useField<string>('ciudad');
const { value: estadoValue } = useField<string>('estado');
const { value: cpValue } = useField<string>('codigo_postal');
const { value: notasValue } = useField<string>('notas');

onMounted(async () => {
    const id = Number(route.params.id);
    await traeClienteId(id);

    if (clienteSeleccionado.value) {
        setValues({
            nombre: clienteSeleccionado.value.nombre,
            apellido: clienteSeleccionado.value.apellido,
            email: clienteSeleccionado.value.email ?? '',
            telefono: clienteSeleccionado.value.telefono ?? '',
            direccion: clienteSeleccionado.value.direccion ?? '',
            ciudad: clienteSeleccionado.value.ciudad ?? '',
            estado: clienteSeleccionado.value.estado ?? '',
            codigo_postal: clienteSeleccionado.value.codigo_postal ?? '',
            notas: clienteSeleccionado.value.notas ?? ''
        });
    }
});

const onSubmit = handleSubmit(async (values) => {
    if (!clienteSeleccionado.value) return;

    await actualizarCliente({
        ...clienteSeleccionado.value,
        ...values,
        email: values.email || null,
        telefono: values.telefono || null,
        direccion: values.direccion || null,
        ciudad: values.ciudad || null,
        estado: values.estado || null,
        codigo_postal: values.codigo_postal || null,
        notas: values.notas || null
    });

    if (!error.value) {
        setTimeout(() => router.push('/clientes'), 1500);
    }
});
</script>

<style scoped>
.contenedor {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
}

.encabezado {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.encabezado h1 {
    font-size: 1.8rem;
    color: #333;
    margin: 0;
}

.btn-volver {
    padding: 0.6rem 1.2rem;
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.2s;
}

.btn-volver:hover { background-color: #e0e0e0; }

.card {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.formulario {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.fila-doble {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.fila-triple {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem;
}

.grupo {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.grupo label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #333;
}

.grupo input, .grupo textarea {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.2s;
    font-family: inherit;
}

.grupo input:focus, .grupo textarea:focus { border-color: #FF7043; }
.input-error { border-color: #ef4444 !important; }

.error-msg {
    font-size: 0.8rem;
    color: #ef4444;
}

.mensaje {
    padding: 0.75rem 1rem;
    border-radius: 6px;
    font-size: 0.9rem;
}

.mensaje.exito { background: #f0fdf4; color: #16a34a; }
.mensaje.error { background: #fef2f2; color: #ef4444; }

.botones {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 0.5rem;
}

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

.btn-guardar {
    padding: 0.6rem 1.2rem;
    background-color: #FF7043;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.2s;
}

.btn-guardar:hover { background-color: #F4511E; }
.btn-guardar:disabled { opacity: 0.6; cursor: not-allowed; }

.cargando {
    text-align: center;
    padding: 3rem;
    color: #999;
}
</style>