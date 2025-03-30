import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { authRoutes } from './routes/auth'
import { lobbyRoutes } from './routes/lobby'
import { gameRoutes } from './routes/game'
import { useAuthStore } from '@/stores/authStore'
import { useAuth } from '@/composables/useAuth'
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { userRoutes } from '@/router/routes/user.ts'
import NotFoundView from '@/views/NotFoundView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    ...authRoutes,
    ...lobbyRoutes,
    ...gameRoutes,
    ...userRoutes,
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
    },
  ],
})
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const { refresh } = useAuth()

  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      try {
        await refresh()
        next()
      } catch (_error) {
        next({ name: 'login', query: { redirect: to.fullPath } })
      }
    } else {
      next()
    }
  } else {
    next()
  }
})
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresNoLobby) {
    const lobbyStore = useLobbyStore()
    if (!lobbyStore.lobby) {
      next()
    } else {
      next({ name: 'lobby' })
    }
  } else {
    next()
  }
})

export default router
