export const gameRoutes = [
  {
    path: '/play',
    name: 'play',
    component: () => import('@/views/auction/PlayView.vue'),
    meta: {
      requiresAuth: true,
      requiresLobby: true,
    },
  },
  {
    path: '/results',
    name: 'results',
    component: () => import('@/views/LeaderboardView.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/rules',
    name: 'rules',
    component: () => import('@/views/rules/GameRulesView.vue'),
  },
]
