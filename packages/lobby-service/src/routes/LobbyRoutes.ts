import express from 'express';
import { validateRequestBody, validateRequestParams } from '../middlewares/ValidationMiddleware';
import { lobbyConfigSchema, lobbyIdSchema, playerStatusSchema } from '../schemas/Lobby';
import { LobbyController } from '../controllers/LobbyController';
import { ErrorLoggerMiddleware, GenericErrorMiddleware, LobbyErrorMiddleware } from '../middlewares/ErrorsMiddleware';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import { UserLobbyRepo } from '../repositories/UserLobbyRepo';
import { ActiveLobbyMiddleware } from '../middlewares/ActiveLobbyMiddleware';

const errorsMiddlewares = [ErrorLoggerMiddleware, LobbyErrorMiddleware, GenericErrorMiddleware];

const userLobbyRepo = new UserLobbyRepo();
const activeLobbyMiddleware = new ActiveLobbyMiddleware(userLobbyRepo);

export const createLobbyRouter = (controller: LobbyController): express.Router => {
  const router = express.Router();
  router.use(AuthMiddleware);
  // Routes
  router.post(
    '/create',
    activeLobbyMiddleware.checkNoActiveLobby,
    validateRequestBody(lobbyConfigSchema),
    controller.createLobby,
    errorsMiddlewares
  );

  router.post(
    '/:id/join',
    activeLobbyMiddleware.checkNoActiveLobby,
    validateRequestParams(lobbyIdSchema),
    controller.joinLobby,
    errorsMiddlewares
  );

  router.put(
    '/status',
    activeLobbyMiddleware.attachActiveLobby,
    validateRequestBody(playerStatusSchema),
    controller.setStatus,
    errorsMiddlewares
  );

  router.post('/leave', activeLobbyMiddleware.attachActiveLobby, controller.leaveLobby, errorsMiddlewares);

  router.post('/kick/:userId', activeLobbyMiddleware.attachActiveLobby, controller.kickPlayer, errorsMiddlewares);

  router.post('/start', activeLobbyMiddleware.attachActiveLobby, controller.startMatch, errorsMiddlewares);

  return router;
};
