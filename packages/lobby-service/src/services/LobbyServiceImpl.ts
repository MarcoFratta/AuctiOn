import { Lobby, PlayerStatus } from '../schemas/Lobby';
import { LobbyRepository } from '../repositories/LobbyRepository';
import {
  LobbyFullError,
  LobbyNotFoundError,
  MatchAlreadyInProgressError,
  NotEnoughPlayersError,
  PlayerNotFoundError,
  PlayersNotReadyError,
  UnauthorizedError,
  UserAlreadyJoined,
} from '../errors/LobbyErrors';
import logger from '../utils/Logger';
import { LobbyService } from './LobbyService';

export class LobbyServiceImpl implements LobbyService {
  private readonly lobbyRepository: LobbyRepository;

  constructor(lobbyRepository: LobbyRepository) {
    this.lobbyRepository = lobbyRepository;
  }

  async createLobby(lobbyData: Omit<Lobby, 'id'>): Promise<Lobby> {
    const lobby = await this.lobbyRepository.create(lobbyData);
    logger.info(`created lobby with id: ${lobby.id}`);
    if (!lobby) {
      throw new Error('Failed to create lobby');
    }
    return lobby;
  }

  async deleteLobby(id: string): Promise<boolean> {
    const res = await this.lobbyRepository.delete(id);
    return this.checkLobbyExists(res, id);
  }

  async joinLobby(id: string, userId: string): Promise<Lobby> {
    const res: Lobby | null = await this.lobbyRepository.findById(id);
    const lobby = this.checkLobbyExists(res, id);
    if (lobby.players.find((player) => player.userId === userId)) {
      throw new UserAlreadyJoined();
    }
    if (lobby.players.length >= lobby.maxPlayers) {
      throw new LobbyFullError();
    }
    lobby.players.push({ userId: userId, status: 'waiting' });
    return (await this.lobbyRepository.update(id, {
      players: lobby.players,
    }))!;
  }

  async leaveLobby(id: string, userId: string): Promise<Lobby> {
    const res = await this.lobbyRepository.findById(id);
    const lobby = this.checkLobbyExists(res, id);
    if (!lobby.players.find((player) => player.userId === userId)) {
      throw new PlayerNotFoundError();
    }
    if (lobby.status === 'in-progress') {
      throw new Error('Cannot leave lobby while match is in progress');
    }
    if (lobby.creator === userId) {
      await this.lobbyRepository.delete(id);
      throw new Error('Lobby creator left, lobby deleted');
    }
    lobby.players = lobby.players.filter((player) => player.userId !== userId);
    const update = await this.lobbyRepository.update(id, {
      players: lobby.players,
    });
    if (!update) {
      throw new Error('Failed to leave lobby');
    }
    return update;
  }

  async kickPlayer(id: string, creator: string, playerId: string): Promise<Lobby> {
    const res = await this.lobbyRepository.findById(id);
    const lobby = this.checkLobbyExists(res, id);
    if (lobby.creator !== creator) {
      throw new UnauthorizedError();
    }
    return this.leaveLobby(id, playerId);
  }

  async setStatus(id: string, userId: string, status: PlayerStatus): Promise<Lobby> {
    const res = await this.lobbyRepository.findById(id);
    const lobby = this.checkLobbyExists(res, id);

    const playerIndex = lobby.players.findIndex((player) => player.userId === userId);
    if (playerIndex === -1) {
      throw (new PlayerNotFoundError());
    }

    lobby.players[playerIndex].status = status;
    // Save the updated players array
    logger.info(`Setting status for player: ${userId} in lobby: ${id} to ${status}`);
    const update = await this.lobbyRepository.update(id, {
      players: lobby.players,
    });
    if (!update) {
      throw new Error('Failed to set player status');
    }
    return update;
  }

  async startMatch(id: string, creator: string): Promise<Lobby> {
    const res = await this.lobbyRepository.findById(id);
    const lobby = this.checkLobbyExists(res, id);
    if (lobby.creator !== creator) {
      throw new UnauthorizedError();
    }
    if (lobby.players.length < 2) {
      throw new NotEnoughPlayersError();
    }
    if (lobby.status === 'in-progress') {
      throw new MatchAlreadyInProgressError();
    }
    if (lobby.players.some((player) => player.status !== 'ready')) {
      throw new PlayersNotReadyError();
    }
    const update = await this.lobbyRepository.update(id, {
      status: 'in-progress',
    });
    if (!update) {
      throw new Error('Failed to start match');
    }
    return update;
  }

  private checkLobbyExists<T>(lobby: T | null, id: string): T {
    if (!lobby) {
      throw new LobbyNotFoundError(id);
    } else return lobby;
  }
}
