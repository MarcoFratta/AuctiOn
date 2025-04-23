import { Lobby, Player, PlayerInfo, playerInfoSchema, PlayerStatus } from '../schemas/Lobby'
import { LobbyRepository } from '../repositories/LobbyRepository'
import {
  ForbiddenError,
  LobbyFullError,
  LobbyNotFoundError,
  MatchAlreadyInProgressError,
  NotEnoughPlayersError,
  PlayerNotFoundError,
  PlayersNotReadyError,
  UserAlreadyInLobby,
} from '../errors/LobbyErrors'
import { LobbyService } from './LobbyService'
import { UserLobbyRepo } from '../repositories/UserLobbyRepo'
import logger from '@auction/common/logger'
import { config } from '../configs/config'
import axios from 'axios'
import { validateSchema } from '@auction/common/validation'

export class LobbyServiceImpl implements LobbyService {
  private readonly lobbyRepository: LobbyRepository
  private userLobbyRepo: UserLobbyRepo
  private lobbyCallbacks: Map<string, ((lobby: Lobby) => void)[]>
  private playerCallbacks: Map<string, ((lobbyId: Lobby, playerId: string) => void)[]>

  constructor(lobbyRepository: LobbyRepository, userLobbyRepo: UserLobbyRepo) {
    this.lobbyRepository = lobbyRepository
    this.userLobbyRepo = userLobbyRepo
    this.lobbyCallbacks = new Map()
    this.playerCallbacks = new Map()
    this.initCallbacks()
  }

  async createLobby(lobbyData: Omit<Lobby, 'id'>): Promise<Lobby> {
    const lobby: Lobby = await this.lobbyRepository.create(lobbyData)
    logger.debug(`created lobby with id: ${lobby.id}`)
    if (!lobby) {
      throw new Error('Failed to create lobby')
    }
    const inserted = await this.userLobbyRepo.addUserToLobby(lobby.creator, lobby.id)
    if (!inserted) {
      await this.lobbyRepository.delete(lobby.id)
      throw new Error('Failed to create lobby')
    }
    this.notifyLobbyCallbacks('lobby-created', lobby)
    this.notifyPlayerCallbacks('lobby-joined', lobby, lobby.creator)
    return lobby
  }

  async getLobby(id: string): Promise<Lobby> {
    const res = await this.lobbyRepository.findById(id)
    return this.checkLobbyExists(res, id)
  }

  async getPlayer(id: string): Promise<PlayerInfo> {
    try {
      const res = await this.userLobbyRepo.getUserActiveLobby(id)
      if (!res) {
        throw new PlayerNotFoundError()
      }
      const { data: info } = await axios.get(`${config.userServiceUrl}/${id}`)
      logger.info(`retrieved user info ${info}`)
      return validateSchema(playerInfoSchema, {
        username: info.name,
      }) as PlayerInfo
    } catch (e) {
      logger.error(`Failed to get player info: ${e}`)
      throw new PlayerNotFoundError()
    }
  }

  async deleteLobby(id: string): Promise<boolean> {
    const lobby: Lobby = await this.lobbyRepository.delete(id)
    await this.userLobbyRepo.removeLobbyUsers(id)
    this.notifyLobbyCallbacks('lobby-deleted', lobby)
    return !!this.checkLobbyExists(lobby, id)
  }

  async joinLobby(id: string, userId: string): Promise<Lobby> {
    const res: Lobby | null = await this.lobbyRepository.findById(id)
    const lobby: Lobby = this.checkLobbyExists(res, id)
    if (lobby.status === 'completed') {
      throw new LobbyNotFoundError(id)
    }
    if (lobby.players.find((player: Player) => player.userId === userId)) {
      throw new UserAlreadyInLobby(id)
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
    this.notifyPlayerCallbacks('lobby-joined', updatedLobby, userId)
    return updatedLobby
  }

  async leaveLobby(id: string, userId: string): Promise<Lobby | null> {
    const res = await this.lobbyRepository.findById(id)
    const lobby = this.checkLobbyExists(res, id)
    if (!lobby.players.find((player: Player) => player.userId === userId)) {
      throw new PlayerNotFoundError()
    }
    if (lobby.creator === userId) {
      await this.deleteLobby(id)
      return null
    }
    lobby.players = lobby.players.filter((player: Player) => player.userId !== userId)
    const update = await this.lobbyRepository.update(id, {
      players: lobby.players,
    })
    if (!update) {
      throw new Error('Failed to leave lobby')
    }
    await this.userLobbyRepo.removeUserFromLobby(userId, id)
    this.notifyPlayerCallbacks('lobby-left', update, userId)
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
    if (lobby.players.some((player: Player) => player.status !== 'ready')) {
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
    this.notifyLobbyCallbacks('lobby-started', update)
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

    const playerIndex = lobby.players.findIndex((player: Player) => player.userId === userId)
    if (playerIndex === -1) {
      throw new PlayerNotFoundError()
    }
    if (lobby.status === 'in-progress') {
      throw new MatchAlreadyInProgressError('Cannot set player status while match is in progress')
    }
    lobby.players[playerIndex].status = status
    // Save the updated players array
    logger.debug(`Setting status for player: ${userId} in lobby: ${id} to ${status}`)
    const update = await this.lobbyRepository.update(id, {
      players: lobby.players,
    })
    if (!update) {
      throw new Error('Failed to set player status')
    }
    this.notifyPlayerCallbacks('status-change', update, userId)
    return update
  }

  async terminateMatch(id: string): Promise<void> {
    const res = await this.lobbyRepository.findById(id)
    const lobby = this.checkLobbyExists(res, id)
    if (lobby.status !== 'in-progress') {
      throw new Error('Match is not in progress')
    }
    await this.lobbyRepository.update(id, {
      status: 'completed',
    })
    await this.userLobbyRepo.terminateMatch(id)
  }

  onLobbyCreated(callback: (lobby: Lobby) => void): void {
    this.lobbyCallbacks.get('lobby-created')!.push(callback)
  }

  private checkLobbyExists<T>(lobby: T | null, id: string): T {
    if (!lobby) {
      throw new LobbyNotFoundError(id)
    } else return lobby
  }

  onLobbyDeleted(callback: (lobbyId: Lobby) => void): void {
    this.lobbyCallbacks.get('lobby-deleted')!.push(callback)
  }

  onLobbyStarted(callback: (lobbyId: Lobby) => void): void {
    this.lobbyCallbacks.get('lobby-started')!.push(callback)
  }

  onLobbyJoined(callback: (lobby: Lobby, playerId: string) => void): void {
    this.playerCallbacks.get('lobby-joined')!.push(callback)
  }

  onLobbyLeft(callback: (lobby: Lobby, playerId: string) => void): void {
    this.playerCallbacks.get('lobby-left')!.push(callback)
  }

  onPlayerStatusChanged(callback: (lobbyId: Lobby, playerId: string) => void) {
    this.playerCallbacks.get('status-change')!.push(callback)
  }

  private initCallbacks(): void {
    this.lobbyCallbacks.set('lobby-created', [])
    this.lobbyCallbacks.set('lobby-started', [])
    this.lobbyCallbacks.set('lobby-deleted', [])
    this.playerCallbacks.set('status-change', [])
    this.playerCallbacks.set('lobby-joined', [])
    this.playerCallbacks.set('lobby-left', [])
  }

  private notifyLobbyCallbacks(type: string, lobby: Lobby): void {
    this.lobbyCallbacks.get(type)!.forEach(callback => callback(lobby))
  }

  private notifyPlayerCallbacks(type: string, lobby: Lobby, playerId: string): void {
    this.playerCallbacks.get(type)!.forEach(callback => callback(lobby, playerId))
  }
}
