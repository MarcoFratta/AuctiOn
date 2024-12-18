import express from 'express'
import { validateRequestBody, validateRequestParams } from '../middlewares/ValidationMiddleware'
import { lobbyConfigSchema, lobbyId, playerStatusSchema } from '../schemas/Lobby'
import { LobbyController } from '../controllers/LobbyController'
import { ErrorLoggerMiddleware, GenericErrorMiddleware, LobbyErrorMiddleware } from '../middlewares/ErrorsMiddleware'
import { AuthMiddleware } from '../middlewares/AuthMiddleware'

const errorsMiddlewares = [ErrorLoggerMiddleware, LobbyErrorMiddleware, GenericErrorMiddleware]
export const createLobbyRouter = (controller: LobbyController): express.Router => {
    const router = express.Router()
    router.use(AuthMiddleware)
    // Routes
    router.post('/create', validateRequestBody(lobbyConfigSchema),
        controller.createLobby, errorsMiddlewares)

    router.post('/join/:id', validateRequestParams(lobbyId), controller.joinLobby,
        errorsMiddlewares)
    router.put('/status/:id',
        validateRequestParams(lobbyId),
        validateRequestBody(playerStatusSchema), controller.setStatus,
        errorsMiddlewares)
    router.post('/leave/:id', validateRequestParams(lobbyId), controller.leaveLobby,
        errorsMiddlewares)
    router.post('/kick/:id', validateRequestParams(lobbyId), controller.kickPlayer,
        errorsMiddlewares)
    router.post('/start/:id', validateRequestParams(lobbyId), controller.startMatch,
        errorsMiddlewares)

    return router
}
