export const userRoutes = [
  {
    path: '/account',
    name: 'account',
    component: () => import('@/views/account/AccountSettingsView.vue'),
    meta: {
      requiresAuth: true,
    },
  },
]
