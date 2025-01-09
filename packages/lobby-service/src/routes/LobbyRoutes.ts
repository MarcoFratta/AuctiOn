import express from 'express'
import { validateRequestBody, validateRequestParams } from '../middlewares/ValidationMiddleware'
import { lobbyConfigSchema, lobbyIdSchema, playerStatusSchema } from '../schemas/Lobby'
import { LobbyController } from '../controllers/LobbyController'
import { ErrorLoggerMiddleware, GenericErrorMiddleware, LobbyErrorMiddleware } from '../middlewares/ErrorsMiddleware'
import { UserLobbyRepo } from '../repositories/UserLobbyRepo'
import { ActiveLobbyMiddleware } from '../middlewares/ActiveLobbyMiddleware'
const userLobbyRepo = new UserLobbyRepo()
const activeLobbyMiddleware = new ActiveLobbyMiddleware(userLobbyRepo)

export const createLobbyRouter = (controller: LobbyController): express.Router => {
  const router = express.Router()

  // Define routes without error handlers
  router.post('/create', activeLobbyMiddleware.checkNoActiveLobby, validateRequestBody(lobbyConfigSchema), controller.createLobby)

  router.post('/:id/join', activeLobbyMiddleware.checkNoActiveLobby, validateRequestParams(lobbyIdSchema), controller.joinLobby)

  router.put('/status', activeLobbyMiddleware.attachActiveLobby, validateRequestBody(playerStatusSchema), controller.setStatus)

  router.post('/leave', activeLobbyMiddleware.attachActiveLobby, controller.leaveLobby)

  router.post('/kick/:userId', activeLobbyMiddleware.attachActiveLobby, controller.kickPlayer)

  router.post('/start', activeLobbyMiddleware.attachActiveLobby, controller.startMatch)

  return router
}
