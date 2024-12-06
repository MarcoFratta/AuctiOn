import { Lobby, PlayerStatus } from '../schemas/Lobby'
import { LobbyRepository } from '../repositories/LobbyRepository'
import {
    LobbyFullError,
    LobbyNotFoundError,
    MatchAlreadyInProgressError,
    NotEnoughPlayersError,
    PlayerNotFoundError,
    PlayersNotReadyError,
    UnauthorizedError,
} from '../errors/LobbyErrors'

export class LobbyService {
    private readonly lobbyRepository: LobbyRepository

    constructor(lobbyRepository: LobbyRepository) {
        this.lobbyRepository = lobbyRepository
    }

    async createLobby(lobbyData: Lobby): Promise<Lobby> {
        const lobby = await this.lobbyRepository.create(lobbyData)
        if (!lobby) {
            throw new Error('Failed to create lobby')
        }
        return lobby
    }

    async deleteLobby(id: string): Promise<boolean> {
        const res = await this.lobbyRepository.delete(id)
        return this.checkLobbyExists(res, id)
    }

    async joinLobby(id: string, userId: string): Promise<Lobby> {
        const res: Lobby | null = await this.lobbyRepository.findById(id)
        const lobby = this.checkLobbyExists(res, id)
        if (lobby.players.length >= lobby.maxPlayers) {
            throw new LobbyFullError()
        }
        lobby.players.push({ userId: userId, status: 'waiting' })
        return (await this.lobbyRepository.update(id, {
            players: lobby.players,
        }))!
    }

    async leaveLobby(id: string, userId: string): Promise<Lobby | null> {
        const res = await this.lobbyRepository.findById(id)
        const lobby = this.checkLobbyExists(res, id)
        if (!lobby.players.find(player =>
            player.userId === userId)) {
            throw new PlayerNotFoundError()
        }
        lobby.players = lobby.players.filter(player =>
            player.userId !== userId)
        const update = await this.lobbyRepository.update(id, { players: lobby.players })
        if (!update) {
            throw new Error('Failed to leave lobby')
        }
        return update
    }


    async kickPlayer(id: string, creator: string, playerId: string): Promise<Lobby | null> {
        const res = await this.lobbyRepository.findById(id)
        const lobby = this.checkLobbyExists(res, id)
        if (lobby.creator !== creator) {
            throw new UnauthorizedError()
        }
        return this.leaveLobby(id, playerId)
    }

    async setStatus(id: string, userId: string, status: PlayerStatus): Promise<Lobby | null> {
        const res = await this.lobbyRepository.findById(id)
        const lobby = this.checkLobbyExists(res, id)
        const player = lobby.players.find(player => player.userId === userId)
        if (!player) {
            throw new PlayerNotFoundError()
        }
        player.status = status // bug: must use status parameter here
        const update = await this.lobbyRepository.update(id, { players: lobby.players })
        if (!update) {
            throw new Error('Failed to set player status')
        }
        return update
    }

    async startMatch(id: string, creator: string): Promise<Lobby | null> {
        const res = await this.lobbyRepository.findById(id)
        const lobby = this.checkLobbyExists(res, id)
        if (lobby.creator !== creator) {
            throw new UnauthorizedError()
        }
        if (lobby.players.length < 2) {
            throw new NotEnoughPlayersError()
        }
        if (lobby.status === 'in-progress') {
            throw new MatchAlreadyInProgressError()
        }
        if (lobby.players.some(player => player.status !== 'ready')) {
            throw new PlayersNotReadyError()
        }
        const update = await this.lobbyRepository.update(id, { status: 'in-progress' })
        if (!update) {
            throw new Error('Failed to start match')
        }
        return update
    }

    private checkLobbyExists<T>(lobby: T | null, id: string): T {
        if (!lobby) {
            throw new LobbyNotFoundError(id)
        } else return lobby
    }
}