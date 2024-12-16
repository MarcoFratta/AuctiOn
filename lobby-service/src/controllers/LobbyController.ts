// LobbyController.ts
import { NextFunction, Request, Response } from 'express'
import { LobbyService } from '../services/LobbyService'
import { validateSchema } from '../utils/Validator'
import { Lobby, LobbyId, lobbyId, lobbySchema } from '../schemas/Lobby'

export class LobbyController {
    private readonly lobbyService: LobbyService

    constructor(lobbyService: LobbyService) {
        this.lobbyService = lobbyService
    }

    // Create a new lobby
    async createLobby(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            req.body.status = 'waiting'
            const lobbyData: Omit<Lobby, 'id'> = validateSchema(lobbySchema.omit({ id: true }), req.body)
            const createdLobby: Lobby = await this.lobbyService.createLobby(lobbyData)
            res.status(201).json(createdLobby)
        } catch (error) {
            next(error)
        }
    }

    // Join a lobby
    async joinLobby(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id: LobbyId = validateSchema(lobbyId, req.params.id)
            const { userId } = req.body
            const updatedLobby: Lobby = await this.lobbyService.joinLobby(id, userId)
            res.status(200).json(updatedLobby)
        } catch (error) {
            next(error)
        }
    }

    // Leave the lobby
    async leaveLobby(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id: LobbyId = validateSchema(lobbyId, req.params.id)
            const { userId } = req.body
            const updatedLobby: Lobby = await this.lobbyService.leaveLobby(id, userId)
            res.status(200).json(updatedLobby)
        } catch (error) {
            next(error)
        }
    }

    // Kick a player from a lobby
    async kickPlayer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id: LobbyId = validateSchema(lobbyId, req.params.id)
            const { creator, playerId } = req.body
            const updatedLobby: Lobby = await this.lobbyService.kickPlayer(id, creator, playerId)
            res.status(200).json(updatedLobby)
        } catch (error) {
            next(error)
        }
    }

    // Set a player's status
    async setStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id: LobbyId = validateSchema(lobbyId, req.params.id)
            const { userId, status } = req.body
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
    async startMatch(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id: LobbyId = validateSchema(lobbyId, req.params.id)
            const { creator } = req.body
            const updatedLobby: Lobby = await this.lobbyService.startMatch(id, creator)
            res.status(200).json(updatedLobby)
        } catch (error) {
            next(error)
        }
    }
}