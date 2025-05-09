import { NextFunction, Response } from 'express'
import { UserAlreadyInLobby, UserNotAuthenticatedError, UserNotInActiveLobby } from '../errors/LobbyErrors'
import { AuthenticatedRequest } from '../types/Index'
import { UserLobbyRepository } from '../repositories/UserLobbyRepository'

export class ActiveLobbyMiddleware {
  constructor(private userLobbyRepo: UserLobbyRepository) {}

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
