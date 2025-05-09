import express from 'express'
import { validateRequestBody, validateRequestParams } from '@auction/common/middlewares'
import { lobbyConfigSchema, lobbyIdSchema, playerStatusSchema } from '../schemas/Lobby'
import { LobbyController } from '../controllers/LobbyController'
import { ActiveLobbyMiddleware } from '../middlewares/ActiveLobbyMiddleware'
import { UserLobbyRepository } from '../repositories/UserLobbyRepository'

export const createLobbyRouter = (controller: LobbyController, userLobbyRepo: UserLobbyRepository): express.Router => {
  const router = express.Router()
  const activeLobbyMiddleware = new ActiveLobbyMiddleware(userLobbyRepo)
  // Define routes without error handlers
  router.post('/create', activeLobbyMiddleware.checkNoActiveLobby, validateRequestBody(lobbyConfigSchema), controller.createLobby)

  router.post('/:id/join', activeLobbyMiddleware.checkNoActiveLobby, validateRequestParams(lobbyIdSchema), controller.joinLobby)

  router.put('/status', activeLobbyMiddleware.attachActiveLobby, validateRequestBody(playerStatusSchema), controller.setStatus)

  router.post('/leave', activeLobbyMiddleware.attachActiveLobby, controller.leaveLobby)

  router.post('/kick/:userId', activeLobbyMiddleware.attachActiveLobby, controller.kickPlayer)

  router.post('/start', activeLobbyMiddleware.attachActiveLobby, controller.startMatch)

  router.get('/', activeLobbyMiddleware.attachActiveLobby, controller.getLobby)

  return router
}
