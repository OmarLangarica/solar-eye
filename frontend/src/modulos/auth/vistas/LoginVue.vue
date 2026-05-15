<template>
    <div class="contenedor">
        <div class="login-card">

            <nav class="navbar">
                <div class="navbar-brand">
                    <img class="navbar-logo" :src="logoSolarEye" alt="Solar Eye" />
                </div>
            </nav>

            <div class="pestanas">
                <button @click="cambiarModo('signin')" :class="{ activa: modoActual === 'signin' }" class="pestana">
                    Iniciar Sesión
                </button>
                <button @click="cambiarModo('signup')" :class="{ activa: modoActual === 'signup' }" class="pestana">
                    Registrarse
                </button>
            </div>

            <form v-if="modoActual === 'signin'" @submit.prevent="onSubmitLogin" class="formulario">
                <h2>Inicio de sesión</h2>

                <div class="grupo">
                    <label>Correo electrónico</label>
                    <input
                        v-model="emailValue"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        :class="{ 'input-error': emailError }"
                    />
                    <span class="error" v-if="emailError">{{ emailError }}</span>
                </div>

                <div class="grupo">
                    <label>Contraseña</label>
                    <input
                        v-model="passwordValue"
                        type="password"
                        placeholder="••••••••"
                        :class="{ 'input-error': passwordError }"
                    />
                    <span class="error" v-if="passwordError">{{ passwordError }}</span>
                </div>

                <div class="error" v-if="error">{{ error }}</div>

                <button type="submit" :disabled="cargando">
                    {{ cargando ? 'Ingresando...' : 'Iniciar sesión' }}
                </button>
            </form>

            <form v-else @submit.prevent="onSubmitRegistro" class="formulario">
                <h2>Registro de usuario</h2>

                <div class="fila-doble">
                    <div class="grupo">
                        <label>Nombre</label>
                        <input
                            v-model="regNombre"
                            type="text"
                            :class="{ 'input-error': regNombreError }"
                        />
                        <span class="error" v-if="regNombreError">{{ regNombreError }}</span>
                    </div>
                    <div class="grupo">
                        <label>Apellido</label>
                        <input
                            v-model="regApellido"
                            type="text"
                            :class="{ 'input-error': regApellidoError }"
                        />
                        <span class="error" v-if="regApellidoError">{{ regApellidoError }}</span>
                    </div>
                </div>

                <div class="grupo">
                    <label>Correo electrónico</label>
                    <input
                        v-model="regEmail"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        :class="{ 'input-error': regEmailError }"
                    />
                    <span class="error" v-if="regEmailError">{{ regEmailError }}</span>
                </div>

                <div class="grupo">
                    <label>Teléfono <span class="opcional">(opcional)</span></label>
                    <input
                        v-model="regTelefono"
                        type="tel"
                        :class="{ 'input-error': regTelefonoError }"
                    />
                    <span class="error" v-if="regTelefonoError">{{ regTelefonoError }}</span>
                </div>

                <div class="grupo">
                    <label>Contraseña</label>
                    <input
                        v-model="regPassword"
                        type="password"
                        placeholder="••••••••"
                        :class="{ 'input-error': regPasswordError }"
                    />
                    <span class="error" v-if="regPasswordError">{{ regPasswordError }}</span>
                </div>

                <div class="error" v-if="error">{{ error }}</div>
                <div class="exito" v-if="exitoRegistro">✓ Cuenta creada, ahora inicia sesión</div>

                <button type="submit" :disabled="cargando">
                    {{ cargando ? 'Registrando...' : 'Registrar usuario' }}
                </button>
            </form>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import { loginSchema, registroSchema } from '../schemas/authSchema';
import { useAuth } from '../controladores/useAuth';
import { useAuthStore } from '../../../stores/authStore';

const router = useRouter();
const authStore = useAuthStore();
const { error, cargando, login, registrar, limpiarError } = useAuth();

const modoActual = ref<'signin' | 'signup'>('signin');
const exitoRegistro = ref(false);

import logoSolarEye from '../../../assets/images/LogoSolarEye.png';

// Login
const { handleSubmit: handleLogin } = useForm({ validationSchema: loginSchema });
const { value: emailValue, errorMessage: emailError } = useField<string>('email');
const { value: passwordValue, errorMessage: passwordError } = useField<string>('password');

const onSubmitLogin = handleLogin(async (values) => {
    const ok = await login({ email: values.email, password: values.password });
    if (ok) {
        const rol = authStore.usuario?.rol;
        if (rol === 'superadmin') {
            router.push('/superadmin/empresas');
            return;
        }
        // Usuario normal → verificar empresas
        router.push('/seleccionar-empresa');
    }
});

const cambiarModo = (nuevoModo: 'signin' | 'signup') => {
    modoActual.value = nuevoModo;
    limpiarError();
};

// Registro
const { handleSubmit: handleRegistro, resetForm: resetRegistro } = useForm({ validationSchema: registroSchema });
const { value: regNombre, errorMessage: regNombreError } = useField<string>('nombre');
const { value: regApellido, errorMessage: regApellidoError } = useField<string>('apellido');
const { value: regEmail, errorMessage: regEmailError } = useField<string>('email');
const { value: regTelefono, errorMessage: regTelefonoError } = useField<string>('telefono');
const { value: regPassword, errorMessage: regPasswordError } = useField<string>('password');

const onSubmitRegistro = handleRegistro(async (values) => {
    const ok = await registrar({
        nombre: values.nombre,
        apellido: values.apellido,
        email: values.email,
        password_hash: values.password,
        telefono: values.telefono ?? null,
    });

    if (ok) {
        exitoRegistro.value = true;
        resetRegistro();
        setTimeout(() => {
            modoActual.value = 'signin';
            exitoRegistro.value = false;
        }, 2000);
    }
});


</script>

<style scoped>
.contenedor {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
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
}

.navbar-brand { display: flex; align-items: center; gap: 0.75rem; }
.navbar-logo { height: 36px; width: auto; object-fit: contain; }

.login-card {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    width: 100%;
    max-width: 550px;        
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.login-header {
    text-align: center;
    margin-bottom: 1.5rem;
}

.logo {
    font-size: 2.5rem;
}

.login-header h1 {
    font-size: 1.6rem;
    font-weight: 700;
    color: #333;
    margin: 0;
}

.pestanas {
    display: flex;
    margin-bottom: 20px;
    border-bottom: 2px solid #ddd;
}

.pestana {
    flex: 1;
    padding: 10px;
    background-color: #f5f5f5;
    border: none;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.3s ease;
    font-size: 0.95rem;
}

.pestana:hover {
    background-color: #e0e0e0;
}

.pestana.activa {
    background-color: #1e3a8a;
    color: white;
    border-bottom: 2px solid #1e3a8a;
}

.formulario {
    display: flex;
    flex-direction: column;
    gap: 1em;
}

.formulario h2 {
    font-size: 1.1rem;
    color: #333;
    margin-bottom: 0.25rem;
}

.fila-doble {
    display: grid;
    grid-template-columns: 1fr 1fr;
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

.opcional {
    font-weight: 400;
    color: #999;
    font-size: 0.8rem;
}

.grupo input {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.2s;
}

.grupo input:focus {
    border-color: #FF7043;
}

.input-error {
    border-color: #ef4444 !important;
}

.error {
    color: red;
    font-size: 0.85em;
    margin-top: 0.25rem;
}

.exito {
    text-align: center;
    background: #f0fdf4;
    color: #16a34a;
    padding: 0.5rem;
    border-radius: 6px;
    font-size: 0.9rem;
}

button[type="submit"] {
    padding: 10px;
    background-color: #1e3a8a;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: background-color 0.3s ease;
}

button[type="submit"]:hover {
    background-color: #2563eb;
}

button[type="submit"]:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Media Query para Tablets y Celulares (Pantallas menores a 768px) */
@media (max-width: 768px) {
    .login-card {
        padding: 1.5rem;
        max-width: 90%; /* Para que no pegue a los bordes del cel */
    }

    .fila-doble {
        grid-template-columns: 1fr; /* Cambiamos de 2 columnas a 1 sola */
        gap: 0.5rem;
    }

    .login-header h1 {
        font-size: 1.4rem;
    }
}

/* Media Query para celulares muy pequeños (Pantallas menores a 480px) */
@media (max-width: 480px) {
    .contenedor {
        padding: 1rem;
        align-items: flex-start; /* Para que el login no quede mocho si es muy largo */
    }

    .pestana {
        font-size: 0.85rem; /* Letra un poco más chica para que quepa el texto */
        padding: 8px 4px;
    }
    
    button[type="submit"] {
        font-size: 0.9rem;
    }
}
</style>