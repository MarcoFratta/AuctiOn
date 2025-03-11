import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import CreateLobbyView from '@/views/lobby/CreateLobbyView.vue'
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
      component: () => import('@/views/lobby/JoinView.vue'),
    },
    {
      path: '/lobby',
      name: 'lobby',
      component: () => import('@/views/lobby/LobbyView.vue'),
    },
    {
      path: '/join/:lobbyId',
      name: 'JoinLobby',
      component: () => import('@/views/lobby/JoinLobby.vue'),
      meta: { requiresAuth: true }, // Mark it as requiring authentication
    },
    {
      path: '/play',
      name: 'play',
      component: () => import('@/views/auction/PlayView.vue'),
    },
  ],
})

export default router
