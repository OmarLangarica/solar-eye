import FormularioSimulacionVue from '@/modulos/simulacion/vistas/FormularioSimulacionVue.vue'
import DashboardClientesVue from '@/modulos/clientes/vistas/DashboardClientesVue.vue'
import InicioVue from '@/modulos/principal/vistas/InicioVue.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Inicio',
      component: InicioVue,
    },
    {
      path: '/mapa',
      redirect: '/simulacion'
    },
    {
      path: '/clientes',
      name: 'Clientes',
      component: DashboardClientesVue,
    },
    {
      path: '/simulacion',
      name: 'Simulacion',
      component: FormularioSimulacionVue,
    },
  ],
})

export default router
