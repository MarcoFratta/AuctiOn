import { NextFunction, Response } from 'express'
import { validateSchema } from '@auction/common/validation'
import { AuthenticatedRequest } from '../types/Index'
import { Lobby, LobbyConfig, LobbyId, lobbyIdSchema, PlayerStatus, playerStatusSchema } from '../schemas/Lobby'
import { createNewLobby } from '../schemas/LobbyFactory'
import logger from '@auction/common/logger'
import { LobbyService } from '../services/LobbyService'

export class LobbyController {
  private readonly lobbyService: LobbyService

  constructor(lobbyService: LobbyService) {
    this.lobbyService = lobbyService
  }

  // Create a new lobby
  createLobby = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const creatorId = req.user!.id
      logger.info(`Creating lobby for user: ${creatorId}`)
      const lobbyConfig: LobbyConfig = req.body
      const lobby = createNewLobby(lobbyConfig, creatorId)
      logger.info(`Created lobby: ${lobby}`)
      const createdLobby: Lobby = await this.lobbyService.createLobby(lobby)
      res.status(201).json({
        message: 'Lobby created successfully',
        lobby: createdLobby,
      })
    } catch (error) {
      next(error)
    }
  }

  // Join a lobby
  joinLobby = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id }: LobbyId = validateSchema(lobbyIdSchema, req.params)
      const lobbyId = id
      const userId = req.user!.id
      const updatedLobby: Lobby = await this.lobbyService.joinLobby(lobbyId, userId)
      res.status(200).json({
        message: 'Successfully joined the lobby',
        lobby: updatedLobby,
      })
    } catch (error) {
      next(error)
    }
  }

  // Leave the lobby
  leaveLobby = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lobbyId = req.activeLobbyId!
      const userId = req.user!.id
      const updatedLobby: Lobby | null = await this.lobbyService.leaveLobby(lobbyId, userId)
      if (!updatedLobby) {
        res.status(204).json({
          message: 'Successfully deleted the lobby',
        })
        return
      }
      res.status(200).json({
        message: 'Successfully left the lobby',
        lobby: updatedLobby,
      })
    } catch (error) {
      next(error)
    }
  }

  // Kick a player from a lobby
  kickPlayer = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lobbyId = req.activeLobbyId!
      const creatorId = req.user!.id
      const playerId = req.params.userId
      const updatedLobby: Lobby = await this.lobbyService.kickPlayer(lobbyId, creatorId, playerId)
      res.status(200).json({
        message: 'Player kicked',
        lobby: updatedLobby,
      })
    } catch (error) {
      next(error)
    }
  }

  // Set a player's status
  setStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lobbyId = req.activeLobbyId!
      const userId = req.user!.id
      const status: PlayerStatus = validateSchema(playerStatusSchema, req.body).status
      logger.info(`Setting status for player: ${userId} in lobby: ${lobbyId} to ${status}`)
      const updatedLobby: Lobby = await this.lobbyService.setStatus(lobbyId, userId, status)
      res.status(200).json({
        message: 'Player status updated',
        lobby: updatedLobby,
      })
    } catch (error) {
      next(error)
    }
  }

  // Start a match
  startMatch = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lobbyId = req.activeLobbyId!
      const creatorId = req.user!.id
      const updatedLobby: Lobby = await this.lobbyService.startMatch(lobbyId, creatorId)
      res.status(200).json({
        message: 'Match started',
        lobby: updatedLobby,
      })
    } catch (error) {
      next(error)
    }
  }
  getLobby = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lobbyId = req.activeLobbyId
      if (!lobbyId) {
        res.status(404).json({
          message: 'Not found',
        })
        return
      }
      res.status(200).send('ok')
    } catch (error) {
      next(error)
    }
  }
}
