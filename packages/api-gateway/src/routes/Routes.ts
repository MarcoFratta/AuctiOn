import { Router } from 'express'
import { ProxyController } from '../controllers/ProxyController'
import { AuthMiddleware } from '../middlewares/AuthMiddleware'

export class Routes {
  constructor(private proxy: ProxyController) {}

  createRoutes = (): Router => {
    const router = Router()
    router.use('/users', this.proxy.createProxy('users'))
    router.use('/lobbies', AuthMiddleware, this.proxy.createProxy('lobby'))
    router.use('/auth', this.proxy.createProxy('auth'))
    return router
  }
}
