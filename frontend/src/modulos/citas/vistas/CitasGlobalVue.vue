<template>
    <div class="contenedor">

        <nav class="navbar">
            <div class="navbar-brand">
                <img class="navbar-logo" :src="logoSolarEye" alt="Solar Eye" />
            </div>

            <div class="navbar-links">
                <button v-if="authStore.usuario?.rol_empresa === 'admin'" class="nav-link" @click="router.push('/admin/dashboard')">← Volver</button>
                <button v-if="authStore.usuario?.rol_empresa === 'trabajador'" class="nav-link" @click="router.push('/dashboard')">← Volver</button>               
            </div>

            <div class="navbar-user">
                <span class="navbar-user-name">{{ authStore.usuario?.nombre }} {{ authStore.usuario?.apellido }}</span>
                <button class="nav-link" @click="cambiarEmpresa" aria-label="Cambiar de Empresa" title="Cambiar de Empresa"><i class="bi bi-building-down"></i></button>
                <button class="nav-link nav-link--logout" @click="cerrarSesion" aria-label="Cerrar sesión" title="Cerrar sesión">
                    <i class="bi bi-box-arrow-right" aria-hidden="true"></i>
                </button>
            </div>
        </nav>

        <!-- Encabezado -->
        <div class="encabezado">
            <div>
                <h1>Agenda de citas</h1>
                <p>{{ empresaNombre }} — {{ labelVista }}</p>
            </div>
            <div class="acciones-header">
                <div class="vista-toggle">
                    <button :class="{ activo: vista === 'dia' }" @click="vista = 'dia'">Día</button>
                    <button :class="{ activo: vista === 'semana' }" @click="vista = 'semana'">Semana</button>
                    <button :class="{ activo: vista === 'mes' }" @click="vista = 'mes'">Mes</button>
                </div>
                <button class="btn-principal" @click="abrirModalNueva">+ Nueva cita</button>
            </div>
        </div>

        <!-- Navegación de fecha -->
        <div class="nav-fecha">
            <button class="btn-nav" @click="navegar(-1)">‹</button>
            <h2 class="fecha-titulo">{{ tituloFecha }}</h2>
            <button class="btn-nav" @click="navegar(1)">›</button>
            <button class="btn-hoy" @click="irHoy">Hoy</button>
        </div>

        <!-- Leyenda -->
        <div class="leyenda">
            <span v-for="tipo in tiposCita" :key="tipo.valor" class="leyenda-item">
                <span class="leyenda-dot" :class="tipo.valor"></span>
                {{ tipo.label }}
            </span>
        </div>

        <!-- Vista DÍA -->
        <div v-if="vista === 'dia'" class="vista-dia">
            <div class="columna-horas">
                <div v-for="hora in horas" :key="hora" class="celda-hora">{{ hora }}</div>
            </div>
            <div class="columna-eventos">
                <div v-for="hora in horas" :key="hora" class="celda-evento"
                    @click="abrirModalNuevaEnHora(hora)">
                </div>
                <div v-for="cita in citasDelDia" :key="cita.id"
                    class="evento"
                    :class="[cita.tipo, cita.estado]"
                    :style="posicionEvento(cita)"
                    @click.stop="abrirDetalle(cita)">
                    <div class="evento-nombre">{{ cita.cliente_nombre }} {{ cita.cliente_apellido }}</div>
                    <div class="evento-tipo">{{ labelTipo(cita.tipo) }}</div>
                    <div class="evento-hora">{{ formatHora(cita.fecha_inicio) }}</div>
                </div>
            </div>
        </div>

        <!-- Vista SEMANA (estilo tarjetas por columna) -->
        <div v-else-if="vista === 'semana'" class="vista-semana tarjeta-semana">
            <div class="semana-header tarjeta-header">
                <div class="col-horas-header"></div>
                <div v-for="dia in diasSemana" :key="dia.fecha"
                    class="dia-header tarjeta-dia"
                    :class="{ hoy: esHoy(dia.fecha ?? '') }">
                    <div class="dia-top">
                        <div>
                            <span class="dia-nombre">{{ dia.nombre }}</span>
                            <span class="dia-numero">{{ dia.numero }}</span>
                        </div>
                        <div class="dia-progreso"><span></span></div>
                    </div>
                </div>
            </div>
            <div class="semana-body tarjeta-body">
                <div class="col-horas">
                    <div v-for="hora in horas" :key="hora" class="celda-hora-sem">{{ hora }}</div>
                </div>
                <div v-for="dia in diasSemana" :key="dia.fecha" class="col-dia tarjeta-col">
                    <div class="dia-column" @click="abrirModalNuevaEnFechaHora(dia.fecha || '', '09:00')">
                        <div v-if="citasPorDia(dia.fecha ?? '').length === 0" class="placeholder-dia">Sin citas</div>
                        <div v-for="cita in citasPorDia(dia.fecha ?? '').sort((a,b)=> new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime())" :key="cita.id"
                            class="card-cita"
                            :class="[cita.tipo, cita.estado]"
                            @click.stop="abrirDetalle(cita)">
                            <div class="card-top">
                                <div class="card-title">{{ cita.cliente_nombre }} {{ cita.cliente_apellido }}</div>
                                <div class="card-badge">{{ labelTipo(cita.tipo) }}</div>
                            </div>
                            <div class="card-meta">
                                <div class="card-time">{{ formatHora(cita.fecha_inicio) }}</div>
                                <div class="card-usuario">{{ cita.usuario_nombre ?? '' }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Vista MES -->
        <div v-else class="vista-mes">
            <div class="mes-header">
                <div v-for="d in ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']" :key="d" class="mes-dia-nombre">{{ d }}</div>
            </div>
            <div class="mes-grid">
                <div v-for="celda in celdasMes" :key="celda.key"
                    class="mes-celda"
                    :class="{ 'otro-mes': !celda.esEsteMes, 'hoy': celda.esHoy }"
                    @click="seleccionarDiaMes(celda)">
                    <div class="mes-numero">{{ celda.dia }}</div>
                    <div class="mes-eventos">
                        <div v-for="cita in celda.citas.slice(0, 3)" :key="cita.id"
                            class="mes-evento"
                            :class="cita.tipo"
                            @click.stop="abrirDetalle(cita)">
                            {{ cita.cliente_nombre }}
                        </div>
                        <div v-if="celda.citas.length > 3" class="mes-mas">
                            +{{ celda.citas.length - 3 }} más
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal nueva cita -->
        <Teleport to="body">
            <div v-if="modalNueva" class="agenda-overlay" @click.self="modalNueva = false">
                <div class="agenda-modal">
                    <h2>Nueva cita</h2>
                    <div class="formulario">
                        <div class="grupo">
                            <label>Cliente *</label>
                            <select v-model="formNueva.cliente_id">
                                <option value="">Selecciona un cliente</option>
                                <option v-for="c in clientes" :key="c.id" :value="c.id">
                                    {{ c.nombre }} {{ c.apellido }}
                                </option>
                            </select>
                        </div>
                        <div class="grupo">
                            <label>Tipo de cita</label>
                            <select v-model="formNueva.tipo">
                                <option value="visita_tecnica">Visita técnica</option>
                                <option value="llamada">Llamada</option>
                                <option value="videollamada">Videollamada</option>
                            </select>
                        </div>
                        <div class="fila-doble">
                            <div class="grupo">
                                <label>Fecha y hora inicio *</label>
                                <input v-model="formNueva.fecha_inicio" type="datetime-local" />
                            </div>
                            <div class="grupo">
                                <label>Fecha y hora fin</label>
                                <input v-model="formNueva.fecha_fin" type="datetime-local" />
                            </div>
                        </div>
                        <div class="grupo">
                            <label>Notas</label>
                            <textarea v-model="formNueva.notas" rows="3" placeholder="Notas adicionales..."></textarea>
                        </div>
                    </div>
                    <div class="agenda-modal-botones">
                        <button class="btn-cancelar" @click="modalNueva = false">Cancelar</button>
                        <button class="btn-confirmar" @click="crearCita" :disabled="guardando">
                            {{ guardando ? 'Guardando...' : 'Crear cita' }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Modal detalle/editar cita -->
        <Teleport to="body">
            <div v-if="modalDetalle" class="agenda-overlay" @click.self="modalDetalle = false">
                <div class="agenda-modal agenda-modal--detalle">
                    <div class="agenda-detalle-header" :class="citaSeleccionada?.tipo">
                        <div>
                            <h2>{{ citaSeleccionada?.cliente_nombre }} {{ citaSeleccionada?.cliente_apellido }}</h2>
                            <span class="detalle-tipo">{{ labelTipo(citaSeleccionada?.tipo) }}</span>
                        </div>
                        <button class="btn-cerrar" @click="modalDetalle = false">✕</button>
                    </div>

                    <div class="detalle-info">
                        <div class="detalle-fila">
                            <span class="detalle-label"><i class="bi bi-calendar"></i> Fecha inicio</span>
                            <span>{{ formatFechaCompleta(citaSeleccionada?.fecha_inicio) }}</span>
                        </div>
                        <div class="detalle-fila" v-if="citaSeleccionada?.fecha_fin">
                            <span class="detalle-label"><i class="bi bi-flag"></i> Fecha fin</span>
                            <span>{{ formatFechaCompleta(citaSeleccionada?.fecha_fin) }}</span>
                        </div>
                        <div class="detalle-fila">
                            <span class="detalle-label"><i class="bi bi-bar-chart"></i> Estado</span>
                            <span class="badge-estado" :class="citaSeleccionada?.estado">
                                {{ citaSeleccionada?.estado }}
                            </span>
                        </div>
                        <div class="detalle-fila" v-if="citaSeleccionada?.usuario_nombre">
                            <span class="detalle-label"><i class="bi bi-person"></i> Asignado a</span>
                            <span>{{ citaSeleccionada?.usuario_nombre }} {{ citaSeleccionada?.usuario_apellido }}</span>
                        </div>
                        <div class="detalle-fila" v-if="citaSeleccionada?.simulacion_nombre">
                            <span class="detalle-label"><i class="bi bi-lightning-charge"></i> Simulación</span>
                            <span>{{ citaSeleccionada?.simulacion_nombre }}</span>
                        </div>
                        <div class="detalle-fila" v-if="citaSeleccionada?.notas">
                            <span class="detalle-label"><i class="bi bi-journal"></i> Notas</span>
                            <span>{{ citaSeleccionada?.notas }}</span>
                        </div>
                    </div>

                    <div class="acciones-estado">
                        <button class="btn-estado verde"
                            v-if="citaSeleccionada?.estado !== 'realizada'"
                            @click="cambiarEstado('realizada')">
                            ✔ Marcar realizada
                        </button>
                        <button class="btn-estado amarillo"
                            v-if="citaSeleccionada?.estado === 'pendiente'"
                            @click="cambiarEstado('confirmada')">
                            ✔ Confirmar
                        </button>
                        <button class="btn-estado gris"
                            v-if="!['cancelada','realizada'].includes(citaSeleccionada?.estado ?? '')"
                            @click="cambiarEstado('cancelada')">
                            ✕ Cancelar
                        </button>
                        <button class="btn-estado rojo" @click="eliminarCita">
                            🗑 Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/authStore';
import axios from 'axios';
import logoSolarEye from '../../../assets/images/LogoSolarEye.png';
import { useAuth } from '../../auth/controladores/useAuth';

const router = useRouter();
const authStore = useAuthStore();
const { cerrarSesion } = useAuth();
const empresa_id = authStore.usuario?.empresa_id;
const empresaNombre = authStore.usuario?.empresa_nombre ?? '';

const citasApi = axios.create({ baseURL: 'http://localhost:3001/api/citas' });
const clientesApi = axios.create({ baseURL: 'http://localhost:3001/api/clientes' });

const citas = ref<any[]>([]);
const clientes = ref<any[]>([]);
const vista = ref<'dia' | 'semana' | 'mes'>('semana');
const fechaActual = ref(new Date());
const modalNueva = ref(false);
const modalDetalle = ref(false);
const citaSeleccionada = ref<any>(null);
const guardando = ref(false);

const formNueva = reactive({
    cliente_id: '',
    tipo: 'visita_tecnica',
    fecha_inicio: '',
    fecha_fin: '',
    notas: ''
});

const volver = () => {
    router.push('/clientes');
};

const cambiarEmpresa = () => {
    router.push('/seleccionar-empresa');
};

const tiposCita = [
    { valor: 'visita_tecnica', label: 'Visita técnica' },
    { valor: 'llamada', label: 'Llamada' },
    { valor: 'videollamada', label: 'Videollamada' },
];

const labelTipo = (tipo?: string) => tiposCita.find(t => t.valor === tipo)?.label ?? tipo ?? '';

const horas = Array.from({ length: 14 }, (_, i) => {
    const h = i + 7;
    return `${h.toString().padStart(2, '0')}:00`;
});

const formatHora = (fecha: string) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
};

const formatFechaCompleta = (fecha?: string) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleString('es-MX', {
        weekday: 'long', day: '2-digit', month: 'long',
        hour: '2-digit', minute: '2-digit'
    });
};

const isoFecha = (d: Date) => d.toISOString().split('T')[0];

const labelVista = computed(() => {
    if (vista.value === 'dia') return formatFechaCompleta(fechaActual.value.toISOString()).split(',').slice(0, 2).join(',');
    if (vista.value === 'semana') return `Semana del ${diasSemana.value[0]?.numero} al ${diasSemana.value[6]?.numero}`;
    return tituloFecha.value;
});

const tituloFecha = computed(() => {
    const opciones: Intl.DateTimeFormatOptions = vista.value === 'dia'
        ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
        : vista.value === 'semana'
        ? { day: 'numeric', month: 'long', year: 'numeric' }
        : { month: 'long', year: 'numeric' };
    return fechaActual.value.toLocaleDateString('es-MX', opciones);
});

const navegar = (dir: number) => {
    const nueva = new Date(fechaActual.value);
    if (vista.value === 'dia') nueva.setDate(nueva.getDate() + dir);
    else if (vista.value === 'semana') nueva.setDate(nueva.getDate() + dir * 7);
    else nueva.setMonth(nueva.getMonth() + dir);
    fechaActual.value = nueva;
};

const irHoy = () => { fechaActual.value = new Date(); };

const esHoy = (fecha: string) => fecha === isoFecha(new Date());

const citasDelDia = computed(() => {
    const hoy = isoFecha(fechaActual.value);
    return citas.value.filter(c => c.fecha_inicio?.startsWith(hoy));
});

const posicionEvento = (cita: any) => {
    const inicio = new Date(cita.fecha_inicio);
    const horaInicio = inicio.getHours() + inicio.getMinutes() / 60;
    const top = (horaInicio - 7) * 60;
    const altura = cita.fecha_fin
        ? Math.max((new Date(cita.fecha_fin).getTime() - inicio.getTime()) / 60000, 30)
        : 60;
    return { top: `${top}px`, height: `${altura}px` };
};

const diasSemana = computed(() => {
    const inicio = new Date(fechaActual.value);
    const diaSemana = inicio.getDay();
    inicio.setDate(inicio.getDate() - diaSemana);
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(inicio);
        d.setDate(d.getDate() + i);
        return {
            fecha: isoFecha(d),
            nombre: d.toLocaleDateString('es-MX', { weekday: 'short' }),
            numero: d.getDate()
        };
    });
});

const citasPorDia = (fecha: string) =>
    citas.value.filter(c => c.fecha_inicio?.startsWith(fecha));

const celdasMes = computed(() => {
    const anio = fechaActual.value.getFullYear();
    const mes = fechaActual.value.getMonth();
    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0);
    const inicio = new Date(primerDia);
    inicio.setDate(1 - primerDia.getDay());

    const celdas = [];
    const hoy = isoFecha(new Date());

    for (let i = 0; i < 42; i++) {
        const d = new Date(inicio);
        d.setDate(d.getDate() + i);
        const fechaStr = isoFecha(d);
        celdas.push({
            key: fechaStr,
            dia: d.getDate(),
            fecha: fechaStr,
            esEsteMes: d.getMonth() === mes,
            esHoy: fechaStr === hoy,
            citas: citas.value.filter(c => c.fecha_inicio?.startsWith(fechaStr))
        });
    }
    return celdas;
});

const seleccionarDiaMes = (celda: any) => {
    fechaActual.value = new Date(celda.fecha + 'T12:00:00');
    vista.value = 'dia';
};

const abrirModalNueva = () => {
    console.log('abrirModalNueva ejecutado');
    const ahora = new Date();
    ahora.setMinutes(0, 0, 0);
    formNueva.cliente_id = '';
    formNueva.tipo = 'visita_tecnica';
    formNueva.fecha_inicio = ahora.toISOString().slice(0, 16);
    formNueva.fecha_fin = '';
    formNueva.notas = '';
    modalNueva.value = true;
};

const abrirModalNuevaEnHora = (hora: string) => {
    const fecha = isoFecha(fechaActual.value);
    formNueva.fecha_inicio = `${fecha}T${hora}`;
    formNueva.cliente_id = '';
    formNueva.tipo = 'visita_tecnica';
    formNueva.fecha_fin = '';
    formNueva.notas = '';
    modalNueva.value = true;
};

const abrirModalNuevaEnFechaHora = (fecha: string, hora: string) => {
    formNueva.fecha_inicio = `${fecha}T${hora}`;
    formNueva.cliente_id = '';
    formNueva.tipo = 'visita_tecnica';
    formNueva.fecha_fin = '';
    formNueva.notas = '';
    modalNueva.value = true;
};

const abrirDetalle = (cita: any) => {
    citaSeleccionada.value = cita;
    modalDetalle.value = true;
};

const crearCita = async () => {
    if (!formNueva.cliente_id || !formNueva.fecha_inicio) return;
    try {
        guardando.value = true;
        await citasApi.post('/', {
            empresa_id,
            cliente_id: Number(formNueva.cliente_id),
            usuario_id: authStore.usuario?.id,
            tipo: formNueva.tipo,
            fecha_inicio: formNueva.fecha_inicio,
            fecha_fin: formNueva.fecha_fin || null,
            estado: 'pendiente',
            notas: formNueva.notas || null
        });
        modalNueva.value = false;
        await cargarCitas();
    } catch {
        alert('Error al crear la cita');
    } finally {
        guardando.value = false;
    }
};

const cambiarEstado = async (estado: string) => {
    if (!citaSeleccionada.value) return;
    try {
        await citasApi.put('/', { ...citaSeleccionada.value, estado });
        modalDetalle.value = false;
        await cargarCitas();
    } catch {
        alert('Error al actualizar la cita');
    }
};

const eliminarCita = async () => {
    if (!citaSeleccionada.value) return;
    if (!confirm('¿Eliminar esta cita?')) return;
    try {
        await citasApi.delete('/', { data: { id: citaSeleccionada.value.id } });
        modalDetalle.value = false;
        await cargarCitas();
    } catch {
        alert('Error al eliminar la cita');
    }
};


const cargarCitas = async () => {
    if (!empresa_id) return;
    try {
        const rol = authStore.usuario?.rol_empresa;
        
        if (rol === 'admin') {
            // Admin ve todas las citas de la empresa
            const resp = await citasApi.get(`/?empresa_id=${empresa_id}`);
            citas.value = Array.isArray(resp.data) ? resp.data : [];
        } else {
            const resp = await citasApi.get(`/?empresa_id=${empresa_id}`);
            const todas = Array.isArray(resp.data) ? resp.data : [];
            citas.value = todas.filter(c => c.usuario_id === authStore.usuario?.id);
        }
    } catch (error) {
        console.error('Error al cargar citas:', error);
    }
};

const cargarClientes = async () => {
    if (!empresa_id) return;
    const rol = authStore.usuario?.rol_empresa;

    try {
        if (rol === 'trabajador') {
            const resp = await clientesApi.get(`/usuario/${authStore.usuario?.id}`);
            clientes.value = Array.isArray(resp.data) ? resp.data : [];
        } else {
            const resp = await clientesApi.get(`/empresa/${empresa_id}`);
            clientes.value = Array.isArray(resp.data) ? resp.data : [];
        }
    } catch (error) {
        console.error('Error al cargar clientes:', error);
    }
};

onMounted(async () => {
    await Promise.all([
        cargarCitas(),
        cargarClientes()
    ]);
});
</script>

<style scoped>
.contenedor { padding: 0 0 2rem; max-width: 1400px; margin: 0 auto; }

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

/* Encabezado */
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

.acciones-header { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }

.btn-principal { padding: 0.6rem 1.2rem; background-color: #04142c; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-principal:hover { background-color: #1e3a8a; }
.btn-volver { padding: 0.6rem 1.2rem; background-color: #f5f5f5; color: #333; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-volver:hover { background-color: #e0e0e0; }

/* Toggle vista */
.vista-toggle { display: flex; border: 1px solid #ddd; border-radius: 6px; overflow: hidden; }
.vista-toggle button { padding: 0.5rem 1rem; border: none; background: white; cursor: pointer; font-size: 0.9rem; color: #555; transition: all 0.2s; }
.vista-toggle button:hover { background: #f5f5f5; }
.vista-toggle button.activo { background: #04142c; color: white; font-weight: 600; }

/* Navegación fecha */
.nav-fecha {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    background: white;
    padding: 0.75rem 1.25rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.btn-nav { background: none; border: 1px solid #ddd; border-radius: 6px; width: 32px; height: 32px; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; }
.btn-nav:hover { background: #f5f5f5; }
.fecha-titulo { flex: 1; margin: 0; font-size: 1.1rem; color: #333; text-transform: capitalize; }
.btn-hoy { padding: 0.4rem 0.9rem; background: #f5f5f5; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
.btn-hoy:hover { background: #e0e0e0; }

/* Leyenda */
.leyenda { display: flex; gap: 1.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
.leyenda-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: #555; }
.leyenda-dot { width: 10px; height: 10px; border-radius: 50%; }
.leyenda-dot.visita_tecnica { background: #04142c; }
.leyenda-dot.llamada { background: #3b82f6; }
.leyenda-dot.videollamada { background: #8b5cf6; }

/* ─── Vista DÍA ─────────────────────────────────────────────── */
.vista-dia {
    display: flex;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    overflow: hidden;
    min-height: 840px;
}

.columna-horas {
    width: 64px;
    flex-shrink: 0;
    border-right: 1px solid #f0f0f0;
}

.celda-hora {
    height: 60px;
    padding: 4px 8px;
    font-size: 0.75rem;
    color: #999;
    border-bottom: 1px solid #f5f5f5;
}

.columna-eventos {
    flex: 1;
    position: relative;
}

.celda-evento {
    height: 60px;
    border-bottom: 1px solid #f5f5f5;
    cursor: pointer;
}
.celda-evento:hover { background: #eff6ff; }

.evento {
    position: absolute;
    left: 4px;
    right: 4px;
    border-radius: 6px;
    padding: 4px 8px;
    cursor: pointer;
    overflow: hidden;
    z-index: 2;
    border-left: 3px solid;
    transition: opacity 0.2s;
}
.evento:hover { opacity: 0.85; }

.evento.visita_tecnica { background: #eff6ff; border-left-color: #04142c; }
.evento.llamada { background: #eff6ff; border-left-color: #3b82f6; }
.evento.videollamada { background: #f5f3ff; border-left-color: #8b5cf6; }
.evento.cancelada { opacity: 0.4; }
.evento.realizada { opacity: 0.6; }

.evento-nombre { font-size: 0.82rem; font-weight: 600; color: #333; }
.evento-tipo { font-size: 0.72rem; color: #666; }
.evento-hora { font-size: 0.7rem; color: #999; }

/* ─── Vista SEMANA ──────────────────────────────────────────── */
.vista-semana {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    overflow: hidden;
}

.semana-header {
    display: grid;
    grid-template-columns: 64px repeat(7, 1fr);
    border-bottom: 1px solid #f0f0f0;
    background: #fafafa;
}

.dia-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.75rem 0.5rem;
    border-left: 1px solid #f0f0f0;
}

.dia-header.hoy .dia-numero {
    background: #04142c;
    color: white;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.dia-nombre { font-size: 0.75rem; color: #999; text-transform: capitalize; }
.dia-numero { font-size: 1rem; font-weight: 600; color: #333; margin-top: 0.2rem; }

.semana-body {
    display: grid;
    grid-template-columns: 64px repeat(7, 1fr);
    min-height: 840px;
}

.col-horas {
    border-right: 1px solid #f0f0f0;
}

.celda-hora-sem {
    height: 60px;
    padding: 4px 8px;
    font-size: 0.72rem;
    color: #999;
    border-bottom: 1px solid #f5f5f5;
}

.col-dia {
    border-left: 1px solid #f0f0f0;
    position: relative;
}

.celda-sem {
    height: 60px;
    border-bottom: 1px solid #f5f5f5;
    cursor: pointer;
}
.celda-sem:hover { background: #eff6ff; }

.evento-sem {
    position: absolute;
    left: 2px;
    right: 2px;
    border-radius: 4px;
    padding: 2px 4px;
    cursor: pointer;
    overflow: hidden;
    z-index: 2;
    border-left: 3px solid;
    min-height: 20px;
}
.evento-sem.visita_tecnica { background: #eff6ff; border-left-color: #04142c; }
.evento-sem.llamada { background: #eff6ff; border-left-color: #3b82f6; }
.evento-sem.videollamada { background: #f5f3ff; border-left-color: #8b5cf6; }
.evento-sem.cancelada { opacity: 0.4; }
.evento-sem.realizada { opacity: 0.6; }

.evento-nombre-sem { font-size: 0.72rem; font-weight: 600; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.evento-hora-sem { font-size: 0.65rem; color: #666; }

/* Estilos tipo "cuadritos" para vista semana */
.tarjeta-semana { background: transparent; }
.tarjeta-header { display: grid; grid-template-columns: 64px repeat(7, 1fr); gap: 12px; align-items: start; }
.tarjeta-dia { padding: 12px 10px; border-radius: 10px; margin: 8px 10px; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.04); border: 1px solid #f0f0f0; }
.tarjeta-dia .dia-top { display:flex; justify-content:space-between; align-items:center; gap:8px; }
.tarjeta-dia .dia-progreso { width: 60px; height: 8px; background: #f3f3f3; border-radius: 6px; overflow:hidden; }
.tarjeta-dia .dia-progreso span { display:block; width:40%; height:100%; background: linear-gradient(90deg,#04142c,#1e3a8a); }

.tarjeta-body { display: grid; grid-template-columns: 64px repeat(7, 1fr); gap: 12px; align-items: start; }
.tarjeta-col { padding: 0 10px; }
.dia-column { display:flex; flex-direction:column; gap:10px; padding: 12px; min-height: 560px; border-radius: 10px; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border:1px solid #f0f0f0; }
.placeholder-dia { color:#999; font-size:0.9rem; padding:18px 10px; text-align:center; }

.card-cita { border-radius: 10px; padding: 10px 12px; box-shadow: 0 1px 6px rgba(16,24,40,0.04); cursor: pointer; transition: transform 0.12s, box-shadow 0.12s; display:flex; flex-direction:column; gap:6px; }
.card-cita:hover { transform: translateY(-3px); box-shadow: 0 6px 18px rgba(16,24,40,0.08); }
.card-cita.visita_tecnica { background: #eff6ff; border-left: 4px solid #04142c; }
.card-cita.llamada { background: #eff6ff; border-left: 4px solid #3b82f6; }
.card-cita.videollamada { background: #f5f3ff; border-left: 4px solid #8b5cf6; }
.card-cita.cancelada { opacity: 0.5; }

.card-top { display:flex; justify-content:space-between; align-items:center; gap:8px; }
.card-title { font-weight:700; color:#222; font-size:0.95rem; }
.card-badge { background: rgba(0,0,0,0.06); color:#444; padding:4px 8px; border-radius:999px; font-size:0.75rem; }
.card-meta { display:flex; justify-content:space-between; gap:8px; font-size:0.82rem; color:#555; }
.card-time { color:#333; font-weight:600; }
.card-usuario { color:#777; }

/* ─── Vista MES ─────────────────────────────────────────────── */
.vista-mes {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    overflow: hidden;
}

.mes-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    background: #fafafa;
    border-bottom: 1px solid #f0f0f0;
}

.mes-dia-nombre {
    padding: 0.75rem;
    text-align: center;
    font-size: 0.8rem;
    font-weight: 600;
    color: #666;
}

.mes-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
}

.mes-celda {
    min-height: 110px;
    padding: 0.4rem;
    border-right: 1px solid #f0f0f0;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: background 0.15s;
}
.mes-celda:hover { background: #eff6ff; }
.mes-celda.otro-mes { background: #fafafa; }
.mes-celda.otro-mes .mes-numero { color: #ccc; }
.mes-celda.hoy .mes-numero {
    background: #04142c;
    color: white;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
}

.mes-numero { font-size: 0.85rem; font-weight: 600; color: #333; margin-bottom: 0.25rem; }

.mes-eventos { display: flex; flex-direction: column; gap: 2px; }

.mes-evento {
    font-size: 0.72rem;
    padding: 1px 4px;
    border-radius: 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
}
.mes-evento.visita_tecnica { background: #eff6ff; color: #04142c; border-left: 2px solid #04142c; }
.mes-evento.llamada { background: #eff6ff; color: #3b82f6; border-left: 2px solid #3b82f6; }
.mes-evento.videollamada { background: #f5f3ff; color: #8b5cf6; border-left: 2px solid #8b5cf6; }

.mes-mas { font-size: 0.7rem; color: #999; padding: 0 4px; }

/* ─── Overlay y Modal (prefijo agenda- para evitar conflictos globales) ─── */
.agenda-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
}

.agenda-modal {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    width: 100%;
    max-width: 520px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.agenda-modal h2 {
    margin: 0 0 1.5rem;
    font-size: 1.3rem;
    color: #333;
}

.agenda-modal--detalle {
    max-width: 480px;
}

.agenda-modal-botones {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

/* ─── Detalle header (renombrado de .detalle-header) ─────────── */
.agenda-detalle-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1.25rem 1.5rem;
    border-radius: 8px 8px 0 0;
    margin: -2rem -2rem 1.5rem;
}
.agenda-detalle-header.visita_tecnica { background: #eff6ff; }
.agenda-detalle-header.llamada { background: #eff6ff; }
.agenda-detalle-header.videollamada { background: #f5f3ff; }

.agenda-detalle-header h2 { margin: 0 0 0.25rem; font-size: 1.2rem; color: #333; }

/* ─── Resto de estilos internos del modal (sin conflicto) ────── */
.formulario { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
.fila-doble { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.grupo { display: flex; flex-direction: column; gap: 0.4rem; }
.grupo label { font-size: 0.875rem; font-weight: 600; color: #333; }
.grupo input, .grupo select, .grupo textarea { padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 0.95rem; outline: none; font-family: inherit; }
.grupo input:focus, .grupo select:focus, .grupo textarea:focus { border-color: #04142c; }

.btn-cancelar { padding: 0.6rem 1.2rem; background: #f5f5f5; color: #333; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-confirmar { padding: 0.6rem 1.2rem; background: #04142c; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-confirmar:hover { background: #1e3a8a; }
.btn-confirmar:disabled { opacity: 0.6; cursor: not-allowed; }

.detalle-tipo { font-size: 0.82rem; color: #666; }
.btn-cerrar { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #666; padding: 0.25rem; }

.detalle-info { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }
.detalle-fila { display: flex; align-items: flex-start; gap: 0.75rem; font-size: 0.9rem; }
.detalle-label { color: #999; min-width: 110px; font-size: 0.82rem; }

.badge-estado { padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.78rem; font-weight: 600; text-transform: capitalize; }
.badge-estado.pendiente { background: #fef9c3; color: #854d0e; }
.badge-estado.confirmada { background: #dcfce7; color: #166534; }
.badge-estado.realizada { background: #dbeafe; color: #1e40af; }
.badge-estado.cancelada { background: #fee2e2; color: #991b1b; }
.badge-estado.reprogramada { background: #ede9fe; color: #6d28d9; }

.acciones-estado { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.btn-estado { padding: 0.5rem 0.9rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; }
.btn-estado.verde { background: #dcfce7; color: #166534; }
.btn-estado.verde:hover { background: #bbf7d0; }
.btn-estado.amarillo { background: #fef9c3; color: #854d0e; }
.btn-estado.amarillo:hover { background: #fef08a; }
.btn-estado.gris { background: #f5f5f5; color: #555; }
.btn-estado.gris:hover { background: #e0e0e0; }
.btn-estado.rojo { background: #fee2e2; color: #991b1b; }
.btn-estado.rojo:hover { background: #fecaca; }

@media (max-width: 768px) {
    .contenedor { padding: 1rem; }
    .encabezado { flex-direction: column; align-items: flex-start; }
    .acciones-header { width: 100%; flex-wrap: wrap; }
    .semana-body, .semana-header { grid-template-columns: 40px repeat(7, 1fr); }
    .mes-celda { min-height: 70px; }
    .fila-doble { grid-template-columns: 1fr; }
    .agenda-modal { padding: 1.25rem; }
}
</style>