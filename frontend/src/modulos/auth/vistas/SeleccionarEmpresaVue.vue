<template>
    <div class="contenedor">
        <div class="card">
            <div class="header">
                <h1>Solar Eye</h1>
                <p>Selecciona la empresa a la que deseas acceder</p>
            </div>

            <div v-if="cargando" class="cargando">Cargando empresas...</div>

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
                        :style="empresaSeleccionada?.id === empresa.id ? { borderColor: empresa.color_primario } : {}"
                    >
                        <div class="empresa-color-strip" :style="{ backgroundColor: empresa.color_primario }"></div>
                        <div class="empresa-info">
                            <h3>{{ empresa.nombre }}</h3>
                            <span class="badge" :class="empresa.rol_empresa">
                                {{ empresa.rol_empresa === 'admin' ? 'Administrador' : 'Trabajador' }}
                            </span>
                        </div>
                        <!-- <span class="empresa-plan">{{ empresa.plan }}</span> -->
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
                    :style="empresaSeleccionada ? { backgroundColor: empresaSeleccionada.color_primario } : {}"
                >
                    {{ entrando ? 'Entrando...' : 'Entrar →' }}
                </button>
            </div>

            <button class="btn-cerrar-sesion" @click="cerrarSesion">Cerrar sesión</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/authStore';
import authApi from '../api/authApi';

const router = useRouter();
const authStore = useAuthStore();

const empresas = ref<any[]>([]);
const empresaSeleccionada = ref<any>(null);
const cargando = ref(false);
const entrando = ref(false);

const traeEmpresas = async () => {
    try {
        cargando.value = true;
        const resp = await authApi.get(`/empresas/${authStore.usuario?.id}`);
        empresas.value = resp.data;

        // Si solo tiene una empresa, la selecciona automáticamente
        if (empresas.value.length === 1) {
            empresaSeleccionada.value = empresas.value[0];
        }
    } catch {
        empresas.value = [];
    } finally {
        cargando.value = false;
    }
};

const seleccionarEmpresa = (empresa: any) => {
    empresaSeleccionada.value = empresa;
};

const entrar = () => {
    if (!empresaSeleccionada.value) return;
    entrando.value = true;

    authStore.setEmpresaActiva({
        empresa_id: empresaSeleccionada.value.id,
        empresa_nombre: empresaSeleccionada.value.nombre,
        empresa_color_primario: empresaSeleccionada.value.color_primario,
        empresa_color_secundario: empresaSeleccionada.value.color_secundario,
        rol_empresa: empresaSeleccionada.value.rol_empresa
    });

    if (empresaSeleccionada.value.rol_empresa === 'admin') {
        router.push('/admin/dashboard');
    } else {
        router.push('/clientes');
    }
};

const cerrarSesion = () => {
    authStore.cerrarSesion();
    router.push('/login');
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
    padding: 2rem;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.header { text-align: center; margin-bottom: 2rem; }
.header h1 { font-size: 1.8rem; color: #333; margin: 0 0 0.5rem; }
.header p { color: #666; font-size: 0.9rem; margin: 0; }

.cargando { text-align: center; color: #999; padding: 2rem; }

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

.empresa-card:hover { border-color: #FF7043; background: #fff7ed; }
.empresa-seleccionada { background: #fff7ed; }

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

.empresa-plan { font-size: 0.8rem; color: #999; text-transform: capitalize; }

.acciones {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}

.btn-link {
    background: none;
    border: none;
    color: #FF7043;
    cursor: pointer;
    font-size: 0.85rem;
    text-decoration: underline;
    padding: 0;
}

.btn-entrar {
    width: 100%;
    padding: 0.85rem;
    background-color: #FF7043;
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
    background-color: #FF7043;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
.btn-principal:hover { background-color: #F4511E; }

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

.btn-cerrar-sesion {
    width: 100%;
    padding: 0.6rem;
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    font-size: 0.85rem;
}
.btn-cerrar-sesion:hover { color: #ef4444; }
</style>