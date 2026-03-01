import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import LoginVue from '../modulos/auth/vistas/LoginVue.vue';
import ClientesVue from '../modulos/clientes/vistas/ClientesVue.vue';
import AgregarClienteVue from '../modulos/clientes/vistas/AgregarClienteVue.vue';
import EditarClienteVue from '../modulos/clientes/vistas/EditarClienteVue.vue';
import SimulacionesVue from '@/modulos/simulaciones/vistas/SimulacionesVue.vue';
import NuevaSimulacionPaso1Vue from '../modulos/simulaciones/vistas/NuevaSimulacionPaso1Vue.vue';
import NuevaSimulacionPaso2Vue from '@/modulos/simulaciones/vistas/NuevaSimulacionPaso2Vue.vue';
import NuevaSimulacionPaso3Vue from '@/modulos/simulaciones/vistas/NuevaSimulacionPaso3Vue.vue';
import ResultadosSimulacionVue from '@/modulos/simulaciones/vistas/ResultadosSimulacionVue.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: LoginVue,
            meta: { publica: true }
        },
       /* {
            path: '/',
            redirect: '/clientes'
        },*/
        {
            path: '/clientes',
            name: 'clientes',
            component: ClientesVue
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
            path: '/simulaciones/nueva/:cliente_id',
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
    ]
});

// Guard de navegación — protege todas las rutas privadas
router.beforeEach((to) => {
    const authStore = useAuthStore();

    if (!to.meta.publica && !authStore.estaAutenticado()) {
        return { name: 'login' };
    }
});

export default router;