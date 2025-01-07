import { NextFunction, Response } from 'express'
import { UserLobbyRepo } from '../repositories/UserLobbyRepo'
import { UserAlreadyInLobby, UserNotAuthenticatedError, UserNotInActiveLobby } from '../errors/LobbyErrors'
import { AuthenticatedRequest } from './AuthMiddleware'

export class ActiveLobbyMiddleware {
  constructor(private userLobbyRepo: UserLobbyRepo) {}

  checkNoActiveLobby = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new UserNotAuthenticatedError()
      }

      const activeLobby = await this.userLobbyRepo.getUserActiveLobby(userId)
      if (activeLobby) {
        throw new UserAlreadyInLobby(activeLobby.lobbyId)
      }
      next()
    } catch (error) {
      next(error)
    }
  }

  attachActiveLobby = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new UserNotAuthenticatedError()
      }

      const activeLobby = await this.userLobbyRepo.getUserActiveLobby(userId)
      if (activeLobby) {
        req.activeLobbyId = activeLobby.lobbyId
      } else {
        throw new UserNotInActiveLobby()
      }
      next()
    } catch (error) {
      next(error)
    }
  }
}
