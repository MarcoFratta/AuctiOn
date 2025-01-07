import { Lobby, PlayerStatus } from '../schemas/Lobby'
import { LobbyRepository } from '../repositories/LobbyRepository'
import {
  ForbiddenError,
  LobbyFullError,
  LobbyNotFoundError,
  MatchAlreadyInProgressError,
  NotEnoughPlayersError,
  PlayerNotFoundError,
  PlayersNotReadyError,
  UserAlreadyJoined,
} from '../errors/LobbyErrors'
import logger from '../utils/Logger'
import { LobbyService } from './LobbyService'
import { UserLobbyRepo } from '../repositories/UserLobbyRepo'

export class LobbyServiceImpl implements LobbyService {
  private readonly lobbyRepository: LobbyRepository
  private userLobbyRepo: UserLobbyRepo

  constructor(lobbyRepository: LobbyRepository, userLobbyRepo: UserLobbyRepo) {
    this.lobbyRepository = lobbyRepository
    this.userLobbyRepo = userLobbyRepo
  }

  async createLobby(lobbyData: Omit<Lobby, 'id'>): Promise<Lobby> {
    const lobby: Lobby = await this.lobbyRepository.create(lobbyData)
    logger.info(`created lobby with id: ${lobby.id}`)
    if (!lobby) {
      throw new Error('Failed to create lobby')
    }
    const inserted = await this.userLobbyRepo.addUserToLobby(lobby.creator, lobby.id)
    if (!inserted) {
      await this.lobbyRepository.delete(lobby.id)
      throw new Error('Failed to create lobby')
    }
    return lobby
  }

  async deleteLobby(id: string): Promise<boolean> {
    const lobby: Lobby = await this.lobbyRepository.delete(id)
    await this.userLobbyRepo.removeLobbyUsers(id)
    return !!this.checkLobbyExists(lobby, id)
  }

  async joinLobby(id: string, userId: string): Promise<Lobby> {
    const res: Lobby | null = await this.lobbyRepository.findById(id)
    const lobby = this.checkLobbyExists(res, id)
    if (lobby.players.find(player => player.userId === userId)) {
      throw new UserAlreadyJoined()
    }
    if (lobby.players.length >= lobby.maxPlayers) {
      throw new LobbyFullError()
    }
    if (lobby.status === 'in-progress') {
      throw new MatchAlreadyInProgressError('Cannot join lobby while match is in progress')
    }
    lobby.players.push({ userId: userId, status: 'waiting' })
    const updatedLobby = await this.lobbyRepository.update(id, {
      players: lobby.players,
    })
    if (!updatedLobby) {
      throw new Error('Failed to join lobby')
    }
    await this.userLobbyRepo.addUserToLobby(userId, id)
    return updatedLobby
  }

  async leaveLobby(id: string, userId: string): Promise<Lobby | null> {
    const res = await this.lobbyRepository.findById(id)
    const lobby = this.checkLobbyExists(res, id)
    if (!lobby.players.find(player => player.userId === userId)) {
      throw new PlayerNotFoundError()
    }
    if (lobby.status === 'in-progress') {
      throw new MatchAlreadyInProgressError('Cannot leave lobby while match is in progress')
    }
    if (lobby.creator === userId) {
      await this.deleteLobby(id)
      return null
    }
    lobby.players = lobby.players.filter(player => player.userId !== userId)
    const update = await this.lobbyRepository.update(id, {
      players: lobby.players,
    })
    if (!update) {
      throw new Error('Failed to leave lobby')
    }
    await this.userLobbyRepo.removeUserFromLobby(userId, id)
    return update
  }

  async kickPlayer(id: string, creator: string, playerId: string): Promise<Lobby> {
    const res = await this.lobbyRepository.findById(id)
    const lobby = this.checkLobbyExists(res, id)
    if (lobby.creator !== creator) {
      throw new ForbiddenError('Only the lobby creator can kick players')
    }
    if (playerId === creator) {
      throw new ForbiddenError('Cannot kick the lobby creator, use the "leave" endpoint instead')
    }
    return (await this.leaveLobby(id, playerId))!
  }

  async setStatus(id: string, userId: string, status: PlayerStatus): Promise<Lobby> {
    const res = await this.lobbyRepository.findById(id)
    const lobby = this.checkLobbyExists(res, id)

    const playerIndex = lobby.players.findIndex(player => player.userId === userId)
    if (playerIndex === -1) {
      throw new PlayerNotFoundError()
    }

    lobby.players[playerIndex].status = status
    // Save the updated players array
    logger.info(`Setting status for player: ${userId} in lobby: ${id} to ${status}`)
    const update = await this.lobbyRepository.update(id, {
      players: lobby.players,
    })
    if (!update) {
      throw new Error('Failed to set player status')
    }
    return update
  }

  async startMatch(id: string, creator: string): Promise<Lobby> {
    const res = await this.lobbyRepository.findById(id)
    const lobby = this.checkLobbyExists(res, id)
    if (lobby.creator !== creator) {
      throw new ForbiddenError('Only the lobby creator can start the match')
    }
    if (lobby.players.length < 2) {
      throw new NotEnoughPlayersError()
    }
    if (lobby.status === 'in-progress') {
      throw new MatchAlreadyInProgressError('Match is already in progress')
    }
    if (lobby.players.some(player => player.status !== 'ready')) {
      throw new PlayersNotReadyError()
    }
    const newStatus = 'in-progress'
    const update = await this.lobbyRepository.update(id, {
      status: newStatus,
    })
    if (!update) {
      throw new Error('Failed to start match')
    }
    try {
      await this.userLobbyRepo.startMatch(id)
    } catch (e) {
      await this.lobbyRepository.update(id, {
        status: 'waiting',
      })
      throw e
    }
    return update
  }

  private checkLobbyExists<T>(lobby: T | null, id: string): T {
    if (!lobby) {
      throw new LobbyNotFoundError(id)
    } else return lobby
  }
}
