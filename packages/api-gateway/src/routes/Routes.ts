import { Router } from 'express'
import { ProxyController } from '../controllers/ProxyController'
import { AuthMiddleware } from '../middlewares/AuthMiddleware'

export const createRoutes = (proxy: ProxyController): Router => {
  const router = Router()
  router.use('/users', AuthMiddleware, proxy.createProxy('users'))

  router.use('/lobby', AuthMiddleware, proxy.createProxy('lobby'))

  router.use('/auth', proxy.createProxy('auth'))
  return router
}
