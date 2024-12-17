// LobbyController.ts
import { NextFunction, Response } from 'express'
import { LobbyService } from '../services/LobbyService'
import { validateSchema } from '../utils/Validator'
import { AuthenticatedRequest } from '../middlewares/AuthMiddleware'
import { Lobby, LobbyId, lobbyId, lobbySchema } from '../schemas/Lobby'

export class LobbyController {
    private readonly lobbyService: LobbyService

    constructor(lobbyService: LobbyService) {
        this.lobbyService = lobbyService
    }


    // Create a new lobby
    async createLobby(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const creatorId = req.user!.id
            req.body.status = 'waiting'
            req.body.creator = creatorId
            const lobbyData: Omit<Lobby, 'id'> = validateSchema(lobbySchema.omit({ id: true }), req.body)
            const createdLobby: Lobby = await this.lobbyService.createLobby(lobbyData)
            res.status(201).json(createdLobby)
        } catch (error) {
            next(error)
        }
    }

    // Join a lobby
    async joinLobby(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id }: LobbyId = validateSchema(lobbyId, req.params)
            const userId = req.user!.id
            const updatedLobby: Lobby = await this.lobbyService.joinLobby(id, userId)
            res.status(200).json(updatedLobby)
        } catch (error) {
            next(error)
        }
    }

    // Leave the lobby
    async leaveLobby(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id }: LobbyId = validateSchema(lobbyId, req.params)
            const userId = req.user!.id
            const updatedLobby: Lobby = await this.lobbyService.leaveLobby(id, userId)
            res.status(200).json(updatedLobby)
        } catch (error) {
            next(error)
        }
    }

    // Kick a player from a lobby
    async kickPlayer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id }: LobbyId = validateSchema(lobbyId, req.params)
            const creatorId = req.user!.id
            const playerId = req.body.playerId
            const updatedLobby: Lobby = await this.lobbyService.kickPlayer(id, creatorId, playerId)
            res.status(200).json(updatedLobby)
        } catch (error) {
            next(error)
        }
    }

    // Set a player's status
    async setStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id }: LobbyId = validateSchema(lobbyId, req.params)
            const userId = req.user!.id
            const status = req.body.status
            const updatedLobby: Lobby = await this.lobbyService.setStatus(id, userId, status)
            if (!updatedLobby) {
                res.status(404).json({ message: 'Lobby not found' })
            }
            res.status(200).json(updatedLobby)
        } catch (error) {
            next(error)
        }
    }

    // Start a match
    async startMatch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id }: LobbyId = validateSchema(lobbyId, req.params)
            const creatorId = req.user!.id
            const updatedLobby: Lobby = await this.lobbyService.startMatch(id, creatorId)
            res.status(200).json(updatedLobby)
        } catch (error) {
            next(error)
        }
    }
}