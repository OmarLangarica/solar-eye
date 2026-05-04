<template>
    <div class="contenedor">
        <div class="encabezado">
            <div>
                <h1>Clientes globales</h1>
                <p>Todos los clientes registrados en el sistema</p>
            </div>
            <div class="acciones-header">
                <button class="btn-secundario" @click="cambiarEmpresa">Cambiar de empresa</button>
                <button class="btn-exportar" @click="exportarExcel"> Exportar Excel</button>
                <button class="btn-secundario" @click="router.push('/admin/dashboard')">← Volver</button>
            </div>
        </div>

        <div class="mensaje error-msg" v-if="error">{{ error }}</div>

        <!-- Filtros -->
        <div class="filtros">
            <input
                v-model="busqueda"
                type="text"
                placeholder="Buscar por nombre, email o ciudad..."
                class="input-busqueda"
            />
            <select v-model="filtroTrabajador" class="select-filtro">
                <option value="">Todos los trabajadores</option>
                <option v-for="t in trabajadores" :key="t.id" :value="t.id">
                    {{ t.nombre }} {{ t.apellido }}
                </option>
            </select>
        </div>

        <div class="tabla-container">
            <div v-if="cargando" class="sin-datos">Cargando clientes...</div>

            <table v-else-if="clientesFiltrados.length > 0">
                <thead>
                    <tr>
                        <th>NOMBRE</th>
                        <th>EMAIL</th>
                        <th>CIUDAD</th>
                        <th>ESTADO</th>
                        <th>TRABAJADOR</th>
                        <th>SIMULACIONES</th>
                        <th>ACCIONES</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="c in clientesFiltrados" :key="c.id">
                        <td>{{ c.nombre }} {{ c.apellido }}</td>
                        <td>{{ c.email ?? '—' }}</td>
                        <td>{{ c.ciudad ?? '—' }}</td>
                        <td>{{ c.estado ?? '—' }}</td>
                        <td>
                            <span class="badge-trabajador">
                                {{ c.trabajador_nombre }} {{ c.trabajador_apellido }}
                            </span>
                        </td>
                        <td class="centrado">
                            <span class="badge-sims">{{ c.total_simulaciones ?? 0 }}</span>
                        </td>
                        <td>
                            <button
                                class="btn-consultar-sims"
                                @click="router.push({ path: `/simulaciones/${c.id}`, query: { nombre: `${c.nombre} ${c.apellido}`, readonly: '1' } })"
                            >
                                Ver simulaciones
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div v-else class="sin-datos">No se encontraron clientes.</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import * as XLSX from 'xlsx-js-style';
import adminApi from '../api/adminApi';
import { useAuthStore } from '../../../stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const clientes = ref<any[]>([]);
const trabajadores = ref<any[]>([]);
const cargando = ref(false);
const error = ref('');
const busqueda = ref('');
const filtroTrabajador = ref('');

const cambiarEmpresa = () => {
    router.push('/seleccionar-empresa');
};

const clientesFiltrados = computed(() => {
    let lista = clientes.value;

    if (filtroTrabajador.value) {
        lista = lista.filter(c => c.usuario_id === Number(filtroTrabajador.value));
    }

    if (busqueda.value.trim()) {
        const b = busqueda.value.toLowerCase();
        lista = lista.filter(c =>
            `${c.nombre} ${c.apellido}`.toLowerCase().includes(b) ||
            c.email?.toLowerCase().includes(b) ||
            c.ciudad?.toLowerCase().includes(b)
        );
    }

    return lista;
});

const traeClientes = async () => {
    const empresaId = authStore.usuario?.empresa_id;
    if (!empresaId) {
        error.value = 'No hay empresa activa seleccionada';
        clientes.value = [];
        trabajadores.value = [];
        return;
    }

    try {
        cargando.value = true;
        error.value = '';

        const [respClientes, respUsuarios] = await Promise.all([
            adminApi.get('/clientes/globales'),
            adminApi.get(`/empresa/${empresaId}/usuarios`)
        ]);

        const clientesEmpresa = (respClientes.data as any[]).filter((c: any) => c.empresa_id === empresaId);

        // Obtiene conteo de simulaciones por cliente
        const clientesConConteo = await Promise.all(
            clientesEmpresa.map(async (c: any) => {
                try {
                    const resp = await adminApi.get(`/simulaciones-por-cliente/${c.id}`);
                    return { ...c, total_simulaciones: resp.data.total ?? 0 };
                } catch {
                    return { ...c, total_simulaciones: 0 };
                }
            })
        );

        clientes.value = clientesConConteo;
        trabajadores.value = respUsuarios.data.filter((u: any) => u.rol_empresa === 'trabajador' || u.rol_empresa === 'admin');

    } catch (err) {
        error.value = 'No se pudieron cargar los clientes';
    } finally {
        cargando.value = false;
    }
};

const exportarExcel = () => {
    const fechaExportacion = new Date().toLocaleString('es-ES', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });

    const encabezados = ['Nombre', 'Apellido', 'Email', 'Teléfono', 'Ciudad', 'Estado', 'Trabajador', 'Simulaciones'];
    const filas = clientesFiltrados.value.map(c => [
        c.nombre ?? '',
        c.apellido ?? '',
        c.email ?? '',
        c.telefono ?? '',
        c.ciudad ?? '',
        c.estado ?? '',
        `${c.trabajador_nombre ?? ''} ${c.trabajador_apellido ?? ''}`.trim(),
        c.total_simulaciones ?? 0
    ]);

    const datos = [
        ['Solar Eye - Clientes globales'],
        [`Exportado: ${fechaExportacion}`],
        [],
        encabezados,
        ...filas
    ];

    const hoja = XLSX.utils.aoa_to_sheet(datos);

    hoja['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: encabezados.length - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: encabezados.length - 1 } }
    ];

    hoja['!cols'] = [
        { wch: 20 },
        { wch: 20 },
        { wch: 32 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
        { wch: 28 },
        { wch: 14 }
    ];

    hoja['A1'].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 14 },
        fill: { patternType: 'solid', fgColor: { rgb: '1D4ED8' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
            top: { style: 'thin', color: { rgb: '1D4ED8' } },
            bottom: { style: 'thin', color: { rgb: '1D4ED8' } },
            left: { style: 'thin', color: { rgb: '1D4ED8' } },
            right: { style: 'thin', color: { rgb: '1D4ED8' } }
        }
    };

    hoja['A2'].s = {
        font: { italic: true, color: { rgb: '475569' }, sz: 10 },
        alignment: { horizontal: 'left', vertical: 'center' }
    };

    encabezados.forEach((_, index) => {
        const celda = XLSX.utils.encode_cell({ r: 3, c: index });
        if (hoja[celda]) {
            hoja[celda].s = {
                font: { bold: true, color: { rgb: 'FFFFFF' } },
                fill: { patternType: 'solid', fgColor: { rgb: '0F172A' } },
                alignment: { horizontal: 'center', vertical: 'center' },
                border: {
                    top: { style: 'thin', color: { rgb: '334155' } },
                    bottom: { style: 'thin', color: { rgb: '334155' } },
                    left: { style: 'thin', color: { rgb: '334155' } },
                    right: { style: 'thin', color: { rgb: '334155' } }
                }
            };
        }
    });

    filas.forEach((_, rowIndex) => {
        const filaExcel = rowIndex + 4;
        const fondo = rowIndex % 2 === 0 ? 'F8FAFC' : 'FFFFFF';

        encabezados.forEach((_, colIndex) => {
            const celda = XLSX.utils.encode_cell({ r: filaExcel, c: colIndex });
            if (!hoja[celda]) {
                return;
            }

            hoja[celda].s = {
                fill: { patternType: 'solid', fgColor: { rgb: fondo } },
                alignment: {
                    horizontal: colIndex === 7 ? 'center' : 'left',
                    vertical: 'center'
                },
                border: {
                    top: { style: 'thin', color: { rgb: 'E2E8F0' } },
                    bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
                    left: { style: 'thin', color: { rgb: 'E2E8F0' } },
                    right: { style: 'thin', color: { rgb: 'E2E8F0' } }
                }
            };
        });
    });

    hoja['!rows'] = [
        { hpt: 24 },
        { hpt: 18 },
        { hpt: 8 },
        { hpt: 22 },
        ...filas.map(() => ({ hpt: 20 }))
    ];

    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Clientes');

    XLSX.writeFile(libro, `clientes_solar_eye_${new Date().toISOString().split('T')[0]}.xlsx`);
};

onMounted(() => traeClientes());
</script>

<style scoped>
.contenedor { padding: 2rem; max-width: 1200px; margin: 0 auto; }

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

.acciones-header { display: flex; gap: 1rem; flex-wrap: wrap; }

.btn-exportar {
    padding: 0.6rem 1.2rem;
    background-color: #22c55e;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
.btn-exportar:hover { background-color: #16a34a; }

.btn-secundario {
    padding: 0.6rem 1.2rem;
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
.btn-secundario:hover { background-color: #e0e0e0; }

.mensaje.error-msg {
    padding: 0.75rem 1rem;
    border-radius: 6px;
    margin-bottom: 1rem;
    background: #fef2f2;
    color: #ef4444;
}

.filtros {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
}

.input-busqueda {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.95rem;
    outline: none;
    min-width: 200px;
}
.input-busqueda:focus { border-color: #FF7043; }

.select-filtro {
    padding: 0.75rem 1rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.95rem;
    outline: none;
    background: white;
    cursor: pointer;
    min-width: 200px;
}
.select-filtro:focus { border-color: #FF7043; }

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

.badge-trabajador {
    background: #ede9fe;
    color: #6d28d9;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 600;
}

.badge-sims {
    background: #fff7ed;
    color: #c2410c;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 700;
}

.btn-consultar-sims {
    padding: 0.4rem 0.8rem;
    background-color: #2563eb;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
}
.btn-consultar-sims:hover { background-color: #1d4ed8; }

.centrado { text-align: center; }
.sin-datos { text-align: center; padding: 3rem; color: #999; }

@media (max-width: 768px) {
    .contenedor { padding: 1rem; }
    .encabezado { flex-direction: column; align-items: flex-start; }
    .acciones-header { width: 100%; }
    .btn-exportar, .btn-secundario { flex: 1; text-align: center; }
    .filtros { flex-direction: column; }
    .input-busqueda, .select-filtro { width: 100%; }
    th:nth-child(2), td:nth-child(2),
    th:nth-child(4), td:nth-child(4) { display: none; }
}
</style>