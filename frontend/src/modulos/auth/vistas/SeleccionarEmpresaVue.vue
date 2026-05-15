<template>
    <div class="contenedor">
        <div class="card">
            <div class="header">
                <nav class="navbar">
                    <div class="navbar-brand">
                        <img class="navbar-logo" :src="logoSolarEye" alt="Solar Eye" />
                    </div>
                </nav>
                <p>Selecciona la empresa a la que deseas acceder</p>
            </div>

            <div v-if="cargando" class="cargando">Cargando empresas...</div>
            <div v-else-if="error" class="error-msg">{{ error }}</div>

            <div v-else-if="empresas.length === 0" class="sin-empresas">
                <p>No perteneces a ninguna empresa aún.</p>
                <div class="opciones">
                    <button class="btn-principal" @click="router.push('/crear-empresa')">
                        + Crear mi empresa
                    </button>
                    <button class="btn-secundario" @click="router.push('/unirse-empresa')">
                        Unirme a una empresa existente
                    </button>
                </div>
            </div>

            <div v-else>
                <div class="lista-empresas">
                    <div
                        v-for="empresa in empresas"
                        :key="empresa.id"
                        class="empresa-card"
                        :class="{ 'empresa-seleccionada': empresaSeleccionada?.id === empresa.id }"
                        @click="seleccionarEmpresa(empresa)"
                        :style="empresaSeleccionada?.id === empresa.id ? { borderColor: '#1e3a8a' } : {}"
                    >
                        <div class="empresa-color-strip" :style="{ backgroundColor: '#1e3a8a' }"></div>
                        <div class="empresa-info">
                            <h3>{{ empresa.nombre }}</h3>
                            <span class="badge" :class="empresa.rol_empresa">
                                {{ empresa.rol_empresa === 'admin' ? 'Administrador' : 'Trabajador' }}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="acciones">
                    <button class="btn-link" @click="router.push('/crear-empresa')">
                        + Crear otra empresa
                    </button>
                    <button class="btn-link" @click="router.push('/unirse-empresa')">
                        Unirme a otra empresa
                    </button>
                </div>

                <button
                    class="btn-entrar"
                    :disabled="!empresaSeleccionada || entrando"
                    @click="entrar"
                >
                    {{ entrando ? 'Entrando...' : 'Entrar →' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/authStore';
import authApi from '../api/authApi';
import logoSolarEye from '../../../assets/images/LogoSolarEye.png';

const router = useRouter();
const authStore = useAuthStore();

const empresas = ref<any[]>([]);
const empresaSeleccionada = ref<any>(null);
const cargando = ref(false);
const entrando = ref(false);
const error = ref('');

const traeEmpresas = async () => {
    try {
        error.value = '';
        cargando.value = true;
        const usuarioId = authStore.usuario?.id;

        if (!usuarioId) {
            error.value = 'No se pudo cargar la sesión. Vuelve a iniciar sesión.';
            empresas.value = [];
            return;
        }

        const resp = await authApi.get(`/empresas/${usuarioId}`);
        empresas.value = resp.data;

        if (empresas.value.length === 1) {
            empresaSeleccionada.value = empresas.value[0];
        }
    } catch (err) {
        error.value = 'No se pudieron cargar tus empresas. Intenta de nuevo.';
        empresas.value = [];
    } finally {
        cargando.value = false;
    }
};

const seleccionarEmpresa = (empresa: any) => {
    empresaSeleccionada.value = empresa;
};

const entrar = async () => {
    if (!empresaSeleccionada.value) return;
    entrando.value = true;

    try {
        authStore.setEmpresaActiva({
            empresa_id: empresaSeleccionada.value.id,
            empresa_nombre: empresaSeleccionada.value.nombre,
            empresa_color_primario: empresaSeleccionada.value.color_primario,
            empresa_color_secundario: empresaSeleccionada.value.color_secundario,
            rol_empresa: empresaSeleccionada.value.rol_empresa
        });

        if (empresaSeleccionada.value.rol_empresa === 'admin') {
            await router.push('/admin/dashboard');
        } else {
            await router.push('/clientes');
        }
    } catch {
        error.value = 'No se pudo entrar a la empresa. Intenta de nuevo.';
        entrando.value = false;
    }
};

onMounted(() => traeEmpresas());
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

.cargando { text-align: center; color: #999; padding: 2rem; }

.error-msg {
    text-align: center;
    color: #b91c1c;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 0.85rem 1rem;
    margin-bottom: 1rem;
}

.sin-empresas { text-align: center; }
.sin-empresas p { color: #666; margin-bottom: 1.5rem; }

.opciones { display: flex; flex-direction: column; gap: 0.75rem; }

.lista-empresas { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; }

.empresa-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    overflow: hidden;
}

.empresa-card:hover { border-color: #1e3a8a; background: #eef2ff; }
.empresa-seleccionada { background: #eef2ff; border-color: #1e3a8a; }

.empresa-color-strip { width: 6px; height: 40px; border-radius: 3px; flex-shrink: 0; }

.empresa-info { flex: 1; }
.empresa-info h3 { margin: 0 0 0.25rem; font-size: 1rem; color: #333; }

.badge {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.15rem 0.6rem;
    border-radius: 999px;
}
.badge.admin { background: #ede9fe; color: #6d28d9; }
.badge.trabajador { background: #dbeafe; color: #1e40af; }

.acciones {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}

.btn-link {
    background: none;
    border: none;
    color: #1e3a8a;
    cursor: pointer;
    font-size: 0.85rem;
    text-decoration: underline;
    padding: 0;
}

.btn-entrar {
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
    margin-bottom: 1rem;
}
.btn-entrar:hover { opacity: 0.9; }
.btn-entrar:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-principal {
    width: 100%;
    padding: 0.75rem;
    background-color: #1e3a8a;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
.btn-principal:hover { opacity: 0.9; }

.btn-secundario {
    width: 100%;
    padding: 0.75rem;
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
.btn-secundario:hover { background-color: #e0e0e0; }
</style>