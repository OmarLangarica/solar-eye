<template>
    <div class="contenedor">
        <nav class="navbar">
            <div class="navbar-brand">
                <img class="navbar-logo" :src="logoSolarEye" alt="Solar Eye" />
            </div>

            <div class="navbar-links">
                <button class="nav-link" @click="cambiarEmpresa">Cambiar de empresa</button>
                <button class="nav-link" @click="router.push('/clientes')">← Volver</button>
            </div>
        </nav>

        <div class="encabezado">
            <h1>Nuevo Cliente</h1>
        </div>

        <div class="card">
            <form @submit="onSubmit" class="formulario">

                <div class="fila-doble">
                    <div class="grupo">
                        <label>Nombre *</label>
                        <input v-model="nombreValue" type="text" placeholder="Juan"
                            :class="{ 'input-error': nombreError }" />
                        <span class="error-msg" v-if="nombreError">{{ nombreError }}</span>
                    </div>
                    <div class="grupo">
                        <label>Apellido *</label>
                        <input v-model="apellidoValue" type="text" placeholder="García"
                            :class="{ 'input-error': apellidoError }" />
                        <span class="error-msg" v-if="apellidoError">{{ apellidoError }}</span>
                    </div>
                </div>

                <div class="fila-doble">
                    <div class="grupo">
                        <label>Email</label>
                        <input v-model="emailValue" type="email" placeholder="correo@ejemplo.com"
                            :class="{ 'input-error': emailError }" />
                        <span class="error-msg" v-if="emailError">{{ emailError }}</span>
                    </div>
                    <div class="grupo">
                        <label>Teléfono</label>
                        <input v-model="telefonoValue" type="tel" placeholder="6671234567"
                            :class="{ 'input-error': telefonoError }" />
                        <span class="error-msg" v-if="telefonoError">{{ telefonoError }}</span>
                    </div>
                </div>

                <div class="grupo">
                    <label>Dirección</label>
                    <input v-model="direccionValue" type="text" placeholder="Calle Girasol 123" />
                </div>

                <div class="fila-triple">
                    <div class="grupo">
                        <label>Ciudad</label>
                        <input v-model="ciudadValue" type="text" placeholder="Culiacán" />
                    </div>
                    <div class="grupo">
                        <label>Estado</label>
                        <input v-model="estadoValue" type="text" placeholder="Sinaloa" />
                    </div>
                    <div class="grupo">
                        <label>C.P.</label>
                        <input v-model="cpValue" type="text" placeholder="80000" />
                    </div>
                </div>

                <div class="grupo">
                    <label>Notas</label>
                    <textarea v-model="notasValue" placeholder="Información adicional..." rows="3"></textarea>
                </div>

                <div class="mensaje exito" v-if="mensaje">{{ mensaje }}</div>
                <div class="mensaje error" v-if="error">{{ error }}</div>

                <div class="botones">
                    <button type="button" class="btn-cancelar" @click="router.push('/clientes')">Cancelar</button>
                    <button type="submit" class="btn-guardar" :disabled="cargando">
                        {{ cargando ? 'Guardando...' : 'Guardar cliente' }}
                    </button>
                </div>

            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import { clienteSchema } from '../schemas/clientesSchema';
import { useClientes } from '../controladores/useClientes';
import { useAuthStore } from '../../../stores/authStore';
import logoSolarEye from '../../../assets/images/LogoSolarEye.png';

const router = useRouter();
const authStore = useAuthStore();
const { cargando, error, mensaje, agregarCliente } = useClientes();

const { handleSubmit, resetForm } = useForm({ validationSchema: clienteSchema });
const { value: nombreValue, errorMessage: nombreError } = useField<string>('nombre');
const { value: apellidoValue, errorMessage: apellidoError } = useField<string>('apellido');
const { value: emailValue, errorMessage: emailError } = useField<string>('email');
const { value: telefonoValue, errorMessage: telefonoError } = useField<string>('telefono');
const { value: direccionValue } = useField<string>('direccion');
const { value: ciudadValue } = useField<string>('ciudad');
const { value: estadoValue } = useField<string>('estado');
const { value: cpValue } = useField<string>('codigo_postal');
const { value: notasValue } = useField<string>('notas');

const cambiarEmpresa = () => {
    router.push('/seleccionar-empresa');
};

const onSubmit = handleSubmit(async (values) => {
    const empresa_id = authStore.usuario?.empresa_id;
    if (!empresa_id) return;

    await agregarCliente({
        empresa_id,
        usuario_id: authStore.usuario!.id,
        nombre: values.nombre,
        apellido: values.apellido,
        email: values.email ? values.email : null,
        telefono: values.telefono ? values.telefono : null,
        direccion: values.direccion ? values.direccion : null,
        ciudad: values.ciudad ? values.ciudad : null,
        estado: values.estado ? values.estado : null,
        codigo_postal: values.codigo_postal ? values.codigo_postal : null,
        notas: values.notas ? values.notas : null
    });

    if (!error.value) {
        resetForm();
        setTimeout(() => router.push('/clientes'), 1500);
    }
});
</script>

<style scoped>
.contenedor {
    padding: 0 0 2rem;
    max-width: 800px;
    margin: 0 auto;
}

.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0.9rem 1.25rem;
    margin: 0 calc(50% - 50vw) 1.75rem;
    width: 100vw;
    background: #04142c;
    border-radius: 0;
    box-shadow: 0 10px 24px rgba(15, 47, 99, 0.18);
    flex-wrap: wrap;
}

.navbar-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 0 0 auto;
}

.navbar-logo {
    display: block;
    height: 36px;
    width: auto;
    object-fit: contain;
}

.navbar-links {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    margin-left: auto;
}

.nav-link {
    padding: 0;
    background: transparent;
    color: white;
    border: none;
    outline: none;
    cursor: pointer;
    font-weight: 600;
    text-decoration: none;
    line-height: 1.2;
    transition: opacity 0.2s ease;
}

.nav-link:hover { opacity: 0.8; }

.encabezado {
    margin-bottom: 1.5rem;
}

.encabezado h1 {
    font-size: 1.8rem;
    color: #333;
    margin: 0;
}

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

.grupo input:focus, .grupo textarea:focus { border-color: #1e3a8a; }

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
    background-color: #1e3a8a;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.2s;
}

.btn-guardar:hover { background-color: #2563eb; }
.btn-guardar:disabled { opacity: 0.6; cursor: not-allowed; }

@media (max-width: 768px) {
    .contenedor {
        padding: 1rem; /* Menos margen para ganar espacio */
    }

    .encabezado {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .btn-volver {
        width: 100%;
        text-align: center;
    }

    .card {
        padding: 1.5rem;
    }

    /* Rompemos las filas para que todo sea una sola columna */
    .fila-doble, .fila-triple {
        grid-template-columns: 1fr; 
        gap: 0.8rem;
    }

    /* Estilo para los botones de abajo */
    .botones {
        flex-direction: column-reverse; /* Guardar arriba, Cancelar abajo */
        gap: 1rem;
        margin-top: 1.5rem;
    }

    .btn-cancelar, .btn-guardar {
        width: 100%;
        padding: 0.8rem;
    }
}
</style>