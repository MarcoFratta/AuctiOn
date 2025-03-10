import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import CreateLobbyView from '@/views/CreateLobbyView.vue'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/create',
      name: 'create',
      component: CreateLobbyView,
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/join',
      name: 'join',
      component: () => import('@/views/JoinView.vue'),
    },
    {
      path: '/lobby',
      name: 'lobby',
      component: () => import('@/views/LobbyView.vue'),
    },
    {
      path: '/play',
      name: 'play',
      component: () => import('@/views/PlayView.vue'),
    },
  ],
})

export default router
