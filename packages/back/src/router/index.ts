import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import HomeView from '../views/_home/home-view.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      children: [
        {
          path: '/member',
          name: 'member',
          component: () => import('../views/member/member-view.vue'),
        },
        {
          path: '/battle',
          name: 'battle',
          component: () => import('../views/battle/battle-view.vue'),
        },
        {
          path: '/info',
          name: 'info',
          component: () => import('../views/info/info-view.vue'),
        },
        {
          path: '/welfare',
          name: 'welfare',
          component: () => import('../views/welfare/welfare-view.vue'),
        },
      ],
    },
  ],
})

export default router
