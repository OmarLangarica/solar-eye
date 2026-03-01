<template>
    <div class="contenedor">

        <!-- Encabezado -->
        <div class="encabezado">
            <div>
                <h1>Nueva Simulación</h1>
                <p>Cliente: <strong>{{ route.query.nombre }}</strong></p>
            </div>
            <button class="btn-volver" @click="router.push({ path: `/simulaciones/${cliente_id}`, query: { nombre: route.query.nombre } })">
                ← Volver
            </button>
        </div>

        <!-- Indicador de pasos -->
        <div class="pasos">
            <div class="paso activo">
                <div class="paso-numero">1</div>
                <span>Datos generales</span>
            </div>
            <div class="paso-linea"></div>
            <div class="paso">
                <div class="paso-numero">2</div>
                <span>Techo</span>
            </div>
            <div class="paso-linea"></div>
            <div class="paso">
                <div class="paso-numero">3</div>
                <span>Consumo</span>
            </div>
            <div class="paso-linea"></div>
            <div class="paso">
                <div class="paso-numero">4</div>
                <span>Resultados</span>
            </div>
        </div>

        <!-- Formulario -->
        <div class="card">
            <h2>Paso 1 — Datos generales</h2>
            <p class="subtitulo">Ingresa el nombre y descripción del proyecto de simulación.</p>

            <form @submit="onSubmit" class="formulario">

                <div class="grupo">
                    <label>Nombre del proyecto *</label>
                    <input
                        v-model="nombreValue"
                        type="text"
                        placeholder="Ej: Casa principal, Local comercial..."
                        :class="{ 'input-error': nombreError }"
                    />
                    <span class="error-msg" v-if="nombreError">{{ nombreError }}</span>
                </div>

                <div class="grupo">
                    <label>Descripción <span class="opcional">(opcional)</span></label>
                    <textarea
                        v-model="descripcionValue"
                        placeholder="Agrega notas o detalles adicionales del proyecto..."
                        rows="4"
                    ></textarea>
                </div>

                <div class="mensaje error-msg-box" v-if="error">{{ error }}</div>

                <div class="botones">
                    <button
                        type="submit"
                        class="btn-siguiente"
                        :disabled="cargando"
                    >
                        {{ cargando ? 'Creando...' : 'Siguiente →' }}
                    </button>
                </div>

            </form>
        </div>

    </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import { paso1Schema } from '../schemas/simulacionesSchema';
import { useSimulaciones } from '../controladores/useSimulaciones';
import { useAuthStore } from '../../../stores/authStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { cargando, error, agregarSimulacion } = useSimulaciones();

const cliente_id = Number(route.params.cliente_id);

const { handleSubmit } = useForm({ validationSchema: paso1Schema });
const { value: nombreValue, errorMessage: nombreError } = useField<string>('nombre_proyecto');
const { value: descripcionValue } = useField<string>('descripcion');

const onSubmit = handleSubmit(async (values) => {
    const simulacion_id = await agregarSimulacion({
        cliente_id,
        usuario_id: authStore.usuario!.id,
        nombre_proyecto: values.nombre_proyecto,
        descripcion: values.descripcion ?? null,
        estado: 'borrador'
    });

    if (simulacion_id) {
        router.push({
            path: `/simulaciones/nueva/${cliente_id}/paso2/${simulacion_id}`,
            query: { nombre: route.query.nombre }
        });
    }
});
</script>

<style scoped>
.contenedor {
    padding: 2rem;
    max-width: 750px;
    margin: 0 auto;
}

.encabezado {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.encabezado h1 { font-size: 1.8rem; color: #333; margin: 0; }
.encabezado p { color: #666; font-size: 0.9rem; margin: 0.25rem 0 0; }

.btn-volver {
    padding: 0.6rem 1.2rem;
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
.btn-volver:hover { background-color: #e0e0e0; }

/* Indicador de pasos */
.pasos {
    display: flex;
    align-items: center;
    margin-bottom: 2rem;
    background: white;
    padding: 1.25rem 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.paso {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    flex: 1;
}

.paso-numero {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: #e0e0e0;
    color: #999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.95rem;
}

.paso span {
    font-size: 0.8rem;
    color: #999;
    font-weight: 500;
}

.paso.activo .paso-numero {
    background-color: #FF7043;
    color: white;
}

.paso.activo span { color: #FF7043; font-weight: 700; }

.paso.completado .paso-numero {
    background-color: #4ade80;
    color: white;
}

.paso.completado span { color: #16a34a; }

.paso-linea {
    flex: 1;
    height: 2px;
    background-color: #e0e0e0;
    margin-bottom: 1.2rem;
}

/* Card */
.card {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.card h2 { font-size: 1.2rem; color: #333; margin: 0 0 0.5rem; }

.subtitulo { color: #666; font-size: 0.9rem; margin-bottom: 1.5rem; }

.formulario { display: flex; flex-direction: column; gap: 1.25rem; }

.grupo { display: flex; flex-direction: column; gap: 0.4rem; }

.grupo label { font-size: 0.875rem; font-weight: 600; color: #333; }

.opcional { font-weight: 400; color: #999; font-size: 0.8rem; }

.grupo input, .grupo textarea {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.2s;
    font-family: inherit;
}

.grupo input:focus, .grupo textarea:focus { border-color: #FF7043; }

.input-error { border-color: #ef4444 !important; }

.error-msg { font-size: 0.8rem; color: #ef4444; }

.error-msg-box {
    padding: 0.75rem;
    background: #fef2f2;
    color: #ef4444;
    border-radius: 6px;
    font-size: 0.9rem;
}

.botones { display: flex; justify-content: flex-end; margin-top: 0.5rem; }

.btn-siguiente {
    padding: 0.75rem 2rem;
    background-color: #FF7043;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 1rem;
    transition: background-color 0.2s;
}

.btn-siguiente:hover { background-color: #F4511E; }
.btn-siguiente:disabled { opacity: 0.6; cursor: not-allowed; }
</style>