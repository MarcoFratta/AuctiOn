import { Lobby } from '../schemas/Lobby'
import { LobbyRepository } from '../repositories/LobbyRepository'

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

    async deleteLobby(id: string): Promise<void> {
        const res = await this.lobbyRepository.delete(id)
        if (!res) {
            throw new Error('Lobby not found')
        }
    }

    async joinLobby(id: string, userId: string): Promise<Lobby> {
        const lobby: Lobby | null = await this.lobbyRepository.findById(id)
        if (!lobby) {
            throw new Error('Lobby not found')
        }
        if (lobby.players.length >= lobby.maxPlayers) {
            throw new Error('Lobby is full')
        }
        lobby.players.push({ userId: userId, status: 'waiting' })
        return (await this.lobbyRepository.update(id, {
            players: lobby.players,
        }))!
    }

    async leaveLobby(id: string, userId: string): Promise<Lobby | null> {
        const lobby = await this.lobbyRepository.findById(id)
        if (!lobby) {
            throw new Error('Lobby not found')
        }
        if (!lobby.players.find(player =>
            player.userId === userId)) {
            throw new Error('Player not found in lobby')
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
        const lobby = await this.lobbyRepository.findById(id)
        if (!lobby) {
            throw new Error('Lobby not found')
        }
        if (lobby.creator !== creator) {
            throw new Error('Only the lobby creator can kick players')
        }
        return this.leaveLobby(id, playerId)
    }

    async setStatus(id: string, userId: string, status: string): Promise<Lobby | null> {
        const lobby = await this.lobbyRepository.findById(id)
        if (!lobby) {
            throw new Error('Lobby not found')
        }
        const player = lobby.players.find(player => player.userId === userId)
        if (!player) {
            throw new Error('Player not found in lobby')
        }
        player.status = 'ready'
        const update = await this.lobbyRepository.update(id, { players: lobby.players })
        if (!update) {
            throw new Error('Failed to set player status')
        }
        return update
    }

    async startMatch(id: string, creator: string): Promise<Lobby | null> {
        const lobby = await this.lobbyRepository.findById(id)
        if (!lobby) {
            throw new Error('Lobby not found')
        }
        if (lobby.creator !== creator) {
            throw new Error('Only the lobby creator can start the match')
        }
        if (lobby.players.length < 2) {
            throw new Error('Not enough players to start the match')
        }
        if (lobby.status === 'in-progress') {
            throw new Error('Match already in progress')
        }
        if (lobby.players.some(player => player.status !== 'ready')) {
            throw new Error('All players must be ready to start the match')
        }
        const update = await this.lobbyRepository.update(id, { status: 'in-progress' })
        if (!update) {
            throw new Error('Failed to start match')
        }
        return update
    }
}