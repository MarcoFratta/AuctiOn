export const lobbyRoutes = [
  {
    path: '/create',
    name: 'create',
    component: () => import('@/views/lobby/CreateLobbyView.vue'),
    meta: { requiresAuth: true, requiresNoLobby: true },
  },
  {
    path: '/join',
    name: 'join',
    component: () => import('@/views/lobby/JoinView.vue'),
    meta: { requiresAuth: true, requiresNoLobby: true },
  },
  {
    path: '/lobby',
    name: 'lobby',
    component: () => import('@/views/lobby/LobbyView.vue'),
    meta: { requiresAuth: true, requiresLobby: true },
  },
  {
    path: '/join/:lobbyId',
    name: 'JoinLobby',
    component: () => import('@/views/lobby/JoinLobby.vue'),
    meta: { requiresNoLobby: true },
  },
]
