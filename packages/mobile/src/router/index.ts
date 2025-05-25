import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import HomeView from '@/views/_home/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
  ],
})

export default router
