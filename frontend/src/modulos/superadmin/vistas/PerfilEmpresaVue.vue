<template>
    <div class="contenedor">
        <nav class="navbar">
            <div class="navbar-brand">
                <img class="navbar-logo" :src="logoSolarEye" alt="Solar Eye" />
            </div>

            <div class="navbar-links">
                <button
                    v-if="authStore.usuario?.rol_empresa === 'admin'"
                    class="nav-link"
                    @click="router.push('/admin/dashboard')"
                >← Volver</button>
            </div>

            <div class="navbar-user">
                <span class="navbar-user-name">{{ authStore.usuario?.nombre }} {{ authStore.usuario?.apellido }}</span>
                <button class="nav-link" @click="cambiarEmpresa" aria-label="Cambiar de Empresa" title="Cambiar de Empresa"><i class="bi bi-building-down"></i></button>
                <button class="nav-link nav-link--logout" @click="cerrarSesion" aria-label="Cerrar sesión" title="Cerrar sesión">
                    <i class="bi bi-box-arrow-right" aria-hidden="true"></i>
                </button>
            </div>
        </nav>
        <div class="encabezado">
            <div>
                <h1>Perfil público de la empresa</h1>
                <p>Esta información será visible en la página de inicio para tus clientes potenciales</p>
            </div>
        </div>

        <div class="mensaje exito" v-if="mensaje">{{ mensaje }}</div>
        <div class="mensaje error-msg" v-if="error">{{ error }}</div>

        <div class="layout">
            <!-- Formulario -->
            <div class="formulario-col">
                <div class="card">
                    <h3>Información básica</h3>
                    <div class="formulario">
                        <div class="grupo">
                            <label>Nombre de la empresa</label>
                            <input v-model="form.nombre" type="text" disabled class="input-disabled" />
                            <span class="ayuda">El nombre se gestiona desde el panel de superadmin</span>
                        </div>
                        <div class="grupo">
                            <label>Slogan</label>
                            <input v-model="form.slogan" type="text" placeholder="Ej: Energía solar para tu hogar y negocio" />
                        </div>
                        <div class="grupo">
                            <label>Descripción</label>
                            <textarea v-model="form.descripcion" rows="5"
                                placeholder="Describe tu empresa, experiencia, servicios que ofreces..."></textarea>
                        </div>
                        <div class="fila-doble">
                            <div class="grupo">
                                <label>Ciudad</label>
                                <input v-model="form.ciudad" type="text" placeholder="Ej: Culiacán" />
                            </div>
                            <div class="grupo">
                                <label>Estado</label>
                                <input v-model="form.estado_republica" type="text" placeholder="Ej: Sinaloa" />
                            </div>
                        </div>
                        <div class="grupo">
                            <label>Dirección</label>
                            <input v-model="form.direccion" type="text" placeholder="Calle, número, colonia" />
                        </div>
                    </div>
                </div>

                <div class="card">
                    <h3>Datos de contacto</h3>
                    <div class="formulario">
                        <div class="fila-doble">
                            <div class="grupo">
                                <label>Teléfono</label>
                                <input v-model="form.telefono" type="text" placeholder="+52 667 123 4567" />
                            </div>
                            <div class="grupo">
                                <label>WhatsApp</label>
                                <input v-model="form.whatsapp" type="text" placeholder="+52 667 123 4567" />
                            </div>
                        </div>
                        <div class="grupo">
                            <label>Correo de contacto</label>
                            <input v-model="form.email_contacto" type="email" placeholder="contacto@tuempresa.com" />
                        </div>
                        <div class="grupo">
                            <label>Sitio web</label>
                            <input v-model="form.sitio_web" type="text" placeholder="https://tuempresa.com" />
                        </div>
                        <div class="fila-doble">
                            <div class="grupo">
                                <label>Facebook</label>
                                <input v-model="form.facebook" type="text" placeholder="https://facebook.com/tuempresa" />
                            </div>
                            <div class="grupo">
                                <label>Instagram</label>
                                <input v-model="form.instagram" type="text" placeholder="https://instagram.com/tuempresa" />
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <h3>Imágenes</h3>
                    <div class="formulario">
                        <div class="grupo">
                            <label>URL de imagen de portada</label>
                            <input v-model="form.imagen_portada" type="text"
                                placeholder="https://... (imagen horizontal 1200x400px recomendado)" />
                            <div class="preview-img" v-if="form.imagen_portada">
                                <img :src="form.imagen_portada" alt="Portada" />
                            </div>
                        </div>
                        <div class="grupo">
                            <label>URL de logo de la empresa</label>
                            <input v-model="form.imagen_logo" type="text"
                                placeholder="https://... (imagen cuadrada recomendado)" />
                            <div class="preview-logo" v-if="form.imagen_logo">
                                <img :src="form.imagen_logo" alt="Logo" />
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <h3>Visibilidad pública</h3>
                    <div class="toggle-row">
                        <div>
                            <p class="toggle-label">Mostrar en la página de inicio</p>
                            <p class="toggle-desc">Cuando está activado, tu empresa aparece en la landing page para clientes potenciales</p>
                        </div>
                        <label class="toggle">
                            <input type="checkbox" v-model="form.publica" />
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                <div class="botones">
                    <button class="btn-principal" @click="guardar" :disabled="guardando">
                        {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
                    </button>
                </div>
            </div>

            <!-- Preview -->
            <div class="preview-col">
                <div class="preview-sticky">
                    <p class="preview-titulo">Vista previa</p>
                    <div class="empresa-preview-card">
                        <div class="preview-portada"
                            :style="form.imagen_portada ? { backgroundImage: `url(${form.imagen_portada})` } : {}">
                            <div class="preview-portada-overlay"></div>
                        </div>
                        <div class="preview-body-card">
                            <div class="preview-logo-row">
                                <div class="preview-logo-circle"
                                    :style="{ backgroundColor: form.color_primario ?? '#1d4f91' }">
                                    <img v-if="form.imagen_logo" :src="form.imagen_logo" alt="Logo" />
                                    <span v-else>{{ form.nombre?.charAt(0) }}</span>
                                </div>
                                <div>
                                    <div class="preview-nombre">{{ form.nombre || 'Nombre de la empresa' }}</div>
                                    <div class="preview-ubicacion" v-if="form.ciudad">
                                        {{ form.ciudad }}{{ form.estado_republica ? ', ' + form.estado_republica : '' }}
                                    </div>
                                </div>
                            </div>
                            <p class="preview-slogan" v-if="form.slogan">{{ form.slogan }}</p>
                            <p class="preview-descripcion" v-if="form.descripcion">
                                {{ form.descripcion.slice(0, 120) }}{{ form.descripcion.length > 120 ? '...' : '' }}
                            </p>
                            <div class="preview-contacto" v-if="form.telefono || form.email_contacto">
                                <span v-if="form.telefono">{{ form.telefono }}</span>
                                <span v-if="form.email_contacto">{{ form.email_contacto }}</span>
                            </div>
                            <button class="preview-btn-contactar"
                                :style="{ backgroundColor: form.color_primario ?? '#1d4f91' }">
                                Contactar empresa
                            </button>
                        </div>
                    </div>
                    <p class="preview-nota">Así verán tu empresa los visitantes de la página de inicio</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/authStore';
import empresasApi from '../api/empresasApi';
import logoSolarEye from '../../../assets/images/LogoSolarEye.png';
import { useAuth } from '../../auth/controladores/useAuth';

const router = useRouter();
const authStore = useAuthStore();
const empresa_id = authStore.usuario?.empresa_id;
const { cerrarSesion } = useAuth();

const guardando = ref(false);
const error = ref('');
const mensaje = ref('');

const form = reactive({
    id: empresa_id,
    nombre: '',
    slogan: '',
    descripcion: '',
    telefono: '',
    email_contacto: '',
    sitio_web: '',
    direccion: '',
    ciudad: '',
    estado_republica: '',
    facebook: '',
    instagram: '',
    whatsapp: '',
    imagen_portada: '',
    imagen_logo: '',
    color_primario: '#1d4f91',
    publica: false
});

const cambiarEmpresa = () => {
    router.push('/seleccionar-empresa');
};

const guardar = async () => {
    try {
        guardando.value = true;
        error.value = '';
        await empresasApi.put('/perfil', { ...form });
        mensaje.value = 'Perfil actualizado correctamente';
        setTimeout(() => mensaje.value = '', 3000);
    } catch {
        error.value = 'No se pudo guardar el perfil';
    } finally {
        guardando.value = false;
    }
};

onMounted(async () => {
    if (!empresa_id) return;
    const resp = await empresasApi.get(`/${empresa_id}`);
    const data = Array.isArray(resp.data) ? resp.data[0] : resp.data;
    if (data) Object.assign(form, {
        nombre: data.nombre ?? '',
        slogan: data.slogan ?? '',
        descripcion: data.descripcion ?? '',
        telefono: data.telefono ?? '',
        email_contacto: data.email_contacto ?? '',
        sitio_web: data.sitio_web ?? '',
        direccion: data.direccion ?? '',
        ciudad: data.ciudad ?? '',
        estado_republica: data.estado_republica ?? '',
        facebook: data.facebook ?? '',
        instagram: data.instagram ?? '',
        whatsapp: data.whatsapp ?? '',
        imagen_portada: data.imagen_portada ?? '',
        imagen_logo: data.imagen_logo ?? '',
        color_primario: data.color_primario ?? '#1d4f91',
        publica: Boolean(data.publica)
    });
});
</script>

<style scoped>

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

.navbar-links,
.navbar-user {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}

.navbar-user {
    margin-left: auto;
    justify-content: flex-end;
}

.navbar-user-name {
    color: white;
    font-weight: 600;
    white-space: nowrap;
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

.nav-link--logout {
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1.15rem;
}

.contenedor {
    padding: 0 2rem 2rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.encabezado { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.encabezado h1 { font-size: 1.8rem; color: #333; margin: 0; }
.encabezado p { color: #666; font-size: 0.9rem; margin: 0.25rem 0 0; }

.btn-volver { padding: 0.6rem 1.2rem; background: #f5f5f5; color: #333; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-volver:hover { background: #e0e0e0; }

.mensaje { padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.9rem; }
.mensaje.exito { background: #f0fdf4; color: #16a34a; }
.mensaje.error-msg { background: #fef2f2; color: #ef4444; }

.layout { display: grid; grid-template-columns: 1fr 360px; gap: 2rem; align-items: start; }

.formulario-col { display: flex; flex-direction: column; gap: 1.5rem; }

.card { background: white; border-radius: 8px; padding: 1.75rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.card h3 { font-size: 1rem; font-weight: 700; color: #04142c; margin: 0 0 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid #f0f0f0; }

.formulario { display: flex; flex-direction: column; gap: 1.1rem; }
.fila-doble { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.grupo { display: flex; flex-direction: column; gap: 0.4rem; }
.grupo label { font-size: 0.875rem; font-weight: 600; color: #333; }
.ayuda { font-size: 0.75rem; color: #999; }

.grupo input, .grupo select, .grupo textarea {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 0.95rem;
    outline: none;
    font-family: inherit;
    transition: border-color 0.2s;
}
.grupo input:focus, .grupo select:focus, .grupo textarea:focus { border-color: #1d4f91; }
.input-disabled { background: #f9f9f9; color: #666; cursor: not-allowed; }

.preview-img { margin-top: 0.75rem; border-radius: 8px; overflow: hidden; max-height: 150px; }
.preview-img img { width: 100%; height: 150px; object-fit: cover; }
.preview-logo { margin-top: 0.75rem; }
.preview-logo img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd; }

/* Toggle */
.toggle-row { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
.toggle-label { font-size: 0.95rem; font-weight: 600; color: #333; margin: 0 0 0.25rem; }
.toggle-desc { font-size: 0.82rem; color: #666; margin: 0; }

.toggle { position: relative; display: inline-block; width: 52px; height: 28px; flex-shrink: 0; }
.toggle input { opacity: 0; width: 0; height: 0; }
.toggle-slider {
    position: absolute; inset: 0;
    background: #ddd;
    border-radius: 28px;
    cursor: pointer;
    transition: background 0.2s;
}
.toggle-slider::before {
    content: '';
    position: absolute;
    width: 20px; height: 20px;
    left: 4px; top: 4px;
    background: white;
    border-radius: 50%;
    transition: transform 0.2s;
}
.toggle input:checked + .toggle-slider { background: #1d4f91; }
.toggle input:checked + .toggle-slider::before { transform: translateX(24px); }

.botones { display: flex; justify-content: flex-end; }
.btn-principal { padding: 0.75rem 2rem; background: #1d4f91; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 1rem; }
.btn-principal:hover { background: #163d72; }
.btn-principal:disabled { opacity: 0.6; cursor: not-allowed; }

/* Preview sticky */
.preview-col { position: sticky; top: 100px; }
.preview-sticky { display: flex; flex-direction: column; gap: 0.75rem; }
.preview-titulo { font-size: 0.85rem; font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 0.05em; margin: 0; }
.preview-nota { font-size: 0.78rem; color: #999; text-align: center; margin: 0; }

.empresa-preview-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(4,20,44,0.12);
    border: 1px solid #e8edf2;
}

.preview-portada {
    height: 100px;
    background: linear-gradient(135deg, #04142c, #1d4f91);
    background-size: cover;
    background-position: center;
    position: relative;
}
.preview-portada-overlay {
    position: absolute;
    inset: 0;
    background: rgba(4,20,44,0.3);
}

.preview-body-card { padding: 1.25rem; }

.preview-logo-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; margin-top: -40px; position: relative; z-index: 1; }

.preview-logo-circle {
    width: 56px;
    height: 56px;
    border-radius: 10px;
    border: 3px solid white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    font-weight: 700;
    color: white;
    overflow: hidden;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.preview-logo-circle img { width: 100%; height: 100%; object-fit: cover; }

.preview-nombre { font-size: 1rem; font-weight: 700; color: #04142c; margin-top: 15px; }
.preview-ubicacion { font-size: 0.78rem; color: #888; }
.preview-slogan { font-size: 0.85rem; font-weight: 600; color: #1d4f91; margin: 0 0 0.5rem; }
.preview-descripcion { font-size: 0.82rem; color: #555; line-height: 1.5; margin: 0 0 0.75rem; }
.preview-contacto { display: flex; flex-direction: column; gap: 0.2rem; margin-bottom: 0.75rem; }
.preview-contacto span { font-size: 0.78rem; color: #666; }

.preview-btn-contactar {
    width: 100%;
    padding: 0.6rem;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: default;
    font-size: 0.9rem;
    font-weight: 600;
}

@media (max-width: 960px) {
    .layout { grid-template-columns: 1fr; }
    .preview-col { position: static; }
    .fila-doble { grid-template-columns: 1fr; }
}
</style>