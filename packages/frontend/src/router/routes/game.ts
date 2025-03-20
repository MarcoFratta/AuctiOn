export const gameRoutes = [
  {
    path: '/play',
    name: 'play',
    component: () => import('@/views/auction/PlayView.vue'),
    meta: {
      requiresAuth: true,
      requiresLobbyStarted: true,
      requiresLobby: true,
    },
  },
  {
    path: '/leaderboard',
    name: 'leaderboard',
    component: () => import('@/views/AuctionEndView.vue'),
    meta: {
      requiresAuth: true,
    },
  },
]
