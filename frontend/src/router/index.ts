import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import InicioVue from '../modulos/principal/vistas/InicioVue.vue';
import DashboardVue from '../modulos/principal/vistas/DashboardVue.vue';
import LoginVue from '../modulos/auth/vistas/LoginVue.vue';
import ClientesVue from '../modulos/clientes/vistas/ClientesVue.vue';
import AgregarClienteVue from '../modulos/clientes/vistas/AgregarClienteVue.vue';
import EditarClienteVue from '../modulos/clientes/vistas/EditarClienteVue.vue';
import SimulacionesVue from '@/modulos/simulaciones/vistas/SimulacionesVue.vue';
import NuevaSimulacionPaso1Vue from '../modulos/simulaciones/vistas/NuevaSimulacionPaso1Vue.vue';
import NuevaSimulacionPaso2Vue from '@/modulos/simulaciones/vistas/NuevaSimulacionPaso2Vue.vue';
import NuevaSimulacionPaso3Vue from '@/modulos/simulaciones/vistas/NuevaSimulacionPaso3Vue.vue';
import ResultadosSimulacionVue from '@/modulos/simulaciones/vistas/ResultadosSimulacionVue.vue';
import AdminDashboardVue from '@/modulos/admin/vistas/AdminDashboardVue.vue';
import AdminUsuariosVue from '@/modulos/admin/vistas/AdminUsuariosVue.vue';
import AdminClientesVue from '@/modulos/admin/vistas/AdminClientesVue.vue';
import AdminAgregarUsuarioVue from '@/modulos/admin/vistas/AdminAgregarUsuarioVue.vue';
import AdminEditarUsuarioVue from '@/modulos/admin/vistas/AdminEditarUsuarioVue.vue';
import SuperAdminAgregarEmpresaVue from '@/modulos/superadmin/vistas/SuperAdminAgregarEmpresaVue.vue';
import SuperAdminEmpresasVue from '@/modulos/superadmin/vistas/SuperAdminEmpresasVue.vue';
import SuperAdminEditarEmpresaVue from '@/modulos/superadmin/vistas/SuperAdminEditarEmpresaVue.vue';
import SeleccionarEmpresaVue from '@/modulos/auth/vistas/SeleccionarEmpresaVue.vue';
import CrearEmpresaVue from '@/modulos/auth/vistas/CrearEmpresaVue.vue';
import UnirseEmpresaVue from '@/modulos/auth/vistas/UnirseEmpresaVue.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'inicio',
            component: InicioVue,
            meta: { publica: true }
        },
        {
            path: '/login',
            name: 'login',
            component: LoginVue,
            meta: { publica: true }
        },

        //Rutas trabajador
        {
            path: '/clientes',
            name: 'clientes',
            component: ClientesVue
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: DashboardVue
        },
        {
            path: '/clientes/agregar',
            name: 'agregar-cliente',
            component: AgregarClienteVue
        },
        {
            path: '/clientes/editar/:id',
            name: 'editar-cliente',
            component: EditarClienteVue
        },
        {
            path: '/simulaciones/nueva/:cliente_id/:simulacion_id?',
            name: 'nueva-simulacion-paso1',
            component: NuevaSimulacionPaso1Vue
        },
        {
            path: '/simulaciones/nueva/:cliente_id/paso2/:simulacion_id',
            name: 'nueva-simulacion-paso2',
            component: NuevaSimulacionPaso2Vue
        },
        {
            path: '/simulaciones/nueva/:cliente_id/paso3/:simulacion_id',
            name: 'nueva-simulacion-paso3',
            component: NuevaSimulacionPaso3Vue
        },
        {
            path: '/simulaciones/resultados/:simulacion_id',
            name: 'resultados-simulacion',
            component: ResultadosSimulacionVue
        },
        {
            path: '/simulaciones/:cliente_id',
            name: 'simulaciones',
            component: SimulacionesVue
        },

        //Rutas admin
        {
            path: '/admin/dashboard',
            name: 'admin-dashboard',
            component: AdminDashboardVue,
            meta: { soloAdmin: true }
        },
        {
            path: '/admin/usuarios',
            name: 'admin-usuarios',
            component: AdminUsuariosVue,
            meta: { soloAdmin: true }
        },
        {
            path: '/admin/clientes',
            name: 'admin-clientes',
            component: AdminClientesVue,
            meta: { soloAdmin: true }
        },
        {
            path: '/admin/usuarios/agregar',
            name: 'admin-agregar-usuario',
            component: AdminAgregarUsuarioVue,
            meta: { soloAdmin: true }
        },
        {
            path: '/admin/usuarios/editar/:id',
            name: 'admin-editar-usuario',
            component: AdminEditarUsuarioVue,
            meta: { soloAdmin: true }
        },
        {
        path: '/superadmin/empresas',
        name: 'superadmin-empresas',
        component: SuperAdminEmpresasVue,
        meta: { soloSuperadmin: true }
    },
    {
        path: '/superadmin/empresas/agregar',
        name: 'superadmin-agregar-empresa',
        component: SuperAdminAgregarEmpresaVue,
        meta: { soloSuperadmin: true }
    },
    {
        path: '/superadmin/empresas/editar/:id',
        name: 'superadmin-editar-empresa',
        component: SuperAdminEditarEmpresaVue,
        meta: { soloSuperadmin: true }
    },
    {
    path: '/seleccionar-empresa',
    name: 'seleccionar-empresa',
    component: SeleccionarEmpresaVue,
    meta: { publica: false }
    },
    {
        path: '/crear-empresa',
        name: 'crear-empresa',
        component: CrearEmpresaVue,
        meta: { publica: false }
    },
    {
        path: '/unirse-empresa',
        name: 'unirse-empresa',
        component: UnirseEmpresaVue,
        meta: { publica: false }
    },
    ]
});

// Guard actualizado:
router.beforeEach((to) => {
    const authStore = useAuthStore();
    const autenticado = authStore.estaAutenticado();
    const rol = authStore.usuario?.rol;
    const tieneEmpresa = authStore.tieneEmpresa();

    // Si está autenticado y va al login o inicio
    if (autenticado && (to.name === 'login' || to.name === 'inicio')) {
        if (rol === 'superadmin') return { name: 'superadmin-empresas' };
        if (!tieneEmpresa) return { name: 'seleccionar-empresa' };
        if (authStore.esAdmin()) return { name: 'admin-dashboard' };
        return { name: 'clientes' };
    }

    // Si no está autenticado
    if (!to.meta.publica && !autenticado) return { name: 'login' };

    // Si está autenticado pero no tiene empresa y no está en rutas de selección
    if (autenticado && !tieneEmpresa && rol !== 'superadmin' &&
        !['seleccionar-empresa', 'crear-empresa', 'unirse-empresa'].includes(to.name as string)) {
        return { name: 'seleccionar-empresa' };
    }

    if (to.meta.soloSuperadmin && rol !== 'superadmin') return { name: 'clientes' };
    if (to.meta.soloAdmin && !authStore.esAdmin() && rol !== 'superadmin') return { name: 'clientes' };
});

export default router;