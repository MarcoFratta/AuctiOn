export const gameRoutes = [
  {
    path: '/play',
    name: 'play',
    component: () => import('@/views/auction/PlayView.vue'),
    meta: { requiresAuth: true, requiresLobbyStarted: true },
  },
]
