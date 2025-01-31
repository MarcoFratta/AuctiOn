import { Router } from 'express'
import { ProxyController } from '../controllers/ProxyController'
import { AuthMiddleware } from '../middlewares/AuthMiddleware'

export class Routes {
  public auctionWsPros

  constructor(private proxy: ProxyController) {
    this.auctionWsPros = this.proxy.createProxy('auction')
  }

  createRoutes = (): Router => {
    const router = Router()
    router.use('/users', AuthMiddleware, this.proxy.createProxy('users'))
    router.use('/lobbies', AuthMiddleware, this.proxy.createProxy('lobby'))
    router.use('/auctions', AuthMiddleware, this.auctionWsPros)
    router.use('/auth', this.proxy.createProxy('auth'))
    return router
  }
}
