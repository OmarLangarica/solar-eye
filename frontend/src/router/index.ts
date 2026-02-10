import MapaVue from '@/modulos/mapa/vistas/MapaVue.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
  //  {
  //    path: '/',
  //    name: 'home',
  //    component: HomeView,
  //  },
  {
      path: '/mapa',
      name: 'Mapa',
      component: MapaVue,
    },
  ],
})

export default router
