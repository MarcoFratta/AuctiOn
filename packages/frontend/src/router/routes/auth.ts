import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'

export const authRoutes = [
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { requiresAuth: false },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false },
  },
  {
    path: '/forgot',
    name: 'ForgotPassword',
    component: () => import('@/views/auth/ForgotPasswordView.vue'),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/reset/:token',
    name: 'ResetPassword',
    component: () => import('@/views/auth/ResetPasswordView.vue'),
    meta: {
      requiresAuth: false,
    },
  },
]
