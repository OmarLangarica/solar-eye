import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import LoginVue from '../modulos/auth/vistas/LoginVue.vue';
import ClientesVue from '../modulos/clientes/vistas/ClientesVue.vue';
import AgregarClienteVue from '../modulos/clientes/vistas/AgregarClienteVue.vue';
import EditarClienteVue from '../modulos/clientes/vistas/EditarClienteVue.vue';
import FormularioSimulacionVue from '@/modulos/simulacion/vistas/FormularioSimulacionVue.vue';

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
            path: '/simulaciones',
            name: 'simulaciones',
            component: FormularioSimulacionVue
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