import { LobbyServiceImpl } from '../src/services/LobbyServiceImpl'
import { Lobby } from '../src/schemas/Lobby'
import { MongoLobbyRepo } from '../src/repositories/MongoLobbyRepo'
import { UserLobbyRepo } from '../src/repositories/UserLobbyRepo'
import { mock, MockProxy } from 'jest-mock-extended'
import {
  ForbiddenError,
  LobbyFullError,
  LobbyNotFoundError,
  MatchAlreadyInProgressError,
  NotEnoughPlayersError,
  PlayerNotFoundError,
  PlayersNotReadyError,
  UserAlreadyInLobby,
} from '../src/errors/LobbyErrors'

describe('LobbyService Error Handling', () => {
  let mockLobbyRepo: MockProxy<MongoLobbyRepo>;
  let mockUserLobbyRepo: MockProxy<UserLobbyRepo>;
  let lobbyService: LobbyServiceImpl;

    beforeEach(() => {
      mockLobbyRepo = mock<MongoLobbyRepo>();
      mockUserLobbyRepo = mock<UserLobbyRepo>();
      lobbyService = new LobbyServiceImpl(mockLobbyRepo, mockUserLobbyRepo);
    });

    test('should throw error when lobby not found for deletion', async () => {
      mockLobbyRepo.findById.mockResolvedValue(null);

        await expect(lobbyService.deleteLobby('invalid-id')).rejects.toThrow(
            LobbyNotFoundError,
        );
    });

    test('should throw error when joining a non-existent lobby', async () => {
      mockLobbyRepo.findById.mockResolvedValue(null);

        await expect(
            lobbyService.joinLobby('invalid-id', 'user1'),
        ).rejects.toThrow(LobbyNotFoundError);
    });

    test('should throw error when joining a lobby the user is already part of', async () => {
        const lobby: Lobby = {
            id: '1',
            rounds: 2,
            creator: 'user1',
            players: [{ userId: 'user1', status: 'waiting' }],
            maxPlayers: 4,
            status: 'waiting',
          bidTime: 10,
          startAmount: 100,
          startInventory: { items: [{ item: 'triangle', quantity: 1 }] },
        };

      mockLobbyRepo.findById.mockResolvedValue(lobby);
      mockUserLobbyRepo.getUserActiveLobby.mockResolvedValue({
        userId: 'user1',
        lobbyId: '1',
        state: 'waiting',
        joinedAt: new Date(),
      });

        await expect(lobbyService.joinLobby('1', 'user1')).rejects.toThrow(
          UserAlreadyInLobby,
        );
    });

    test('should throw error when joining a full lobby', async () => {
        const fullLobby: Lobby = {
            id: '1',
            rounds: 2,
            creator: 'user1',
            players: [
                { userId: 'user2', status: 'waiting' },
                { userId: 'user3', status: 'waiting' },
            ],
            maxPlayers: 2,
            status: 'waiting',
          bidTime: 10,
          startAmount: 100,
          startInventory: { items: [{ item: 'triangle', quantity: 1 }] },
        };

      mockLobbyRepo.findById.mockResolvedValue(fullLobby);
      mockUserLobbyRepo.getUserActiveLobby.mockResolvedValue(null);

        await expect(lobbyService.joinLobby('1', 'user4')).rejects.toThrow(
            LobbyFullError,
        );
    });

    test('should throw error when leaving a lobby the user is not part of', async () => {
        const lobby: Lobby = {
            id: '1',
            rounds: 2,
            creator: 'user1',
            players: [{ userId: 'user2', status: 'waiting' }],
            maxPlayers: 4,
            status: 'waiting',
          bidTime: 10,
          startAmount: 100,
          startInventory: { items: [{ item: 'triangle', quantity: 1 }] },
        };

      mockLobbyRepo.findById.mockResolvedValue(lobby);

        await expect(lobbyService.leaveLobby('1', 'user3')).rejects.toThrow(
            PlayerNotFoundError,
        );
    });

    test('should throw error when setting status for a non-existent player', async () => {
        const lobby: Lobby = {
            id: '1',
            rounds: 2,
            creator: 'user1',
            players: [{ userId: 'user2', status: 'waiting' }],
            maxPlayers: 4,
            status: 'waiting',
          bidTime: 10,
          startAmount: 100,
          startInventory: { items: [{ item: 'triangle', quantity: 1 }] },
        };

      mockLobbyRepo.findById.mockResolvedValue(lobby);

        await expect(
            lobbyService.setStatus('1', 'user3', 'ready'),
        ).rejects.toThrow(PlayerNotFoundError);
    });

    test('should throw error when starting match with insufficient players', async () => {
        const lobby: Lobby = {
            id: '1',
            rounds: 2,
            creator: 'user1',
            players: [{ userId: 'user1', status: 'ready' }],
            maxPlayers: 4,
            status: 'waiting',
          bidTime: 10,
          startAmount: 100,
          startInventory: { items: [{ item: 'triangle', quantity: 1 }] },
        };

      mockLobbyRepo.findById.mockResolvedValue(lobby);

        await expect(lobbyService.startMatch('1', 'user1')).rejects.toThrow(
            NotEnoughPlayersError,
        );
    });

    test('should throw error when starting a match with unready players', async () => {
        const lobby: Lobby = {
            id: '1',
            rounds: 2,
            creator: 'user1',
            players: [
                { userId: 'user1', status: 'ready' },
                { userId: 'user2', status: 'waiting' },
            ],
            maxPlayers: 4,
            status: 'waiting',
          bidTime: 10,
          startAmount: 100,
          startInventory: { items: [{ item: 'triangle', quantity: 1 }] },
        };

      mockLobbyRepo.findById.mockResolvedValue(lobby);

        await expect(lobbyService.startMatch('1', 'user1')).rejects.toThrow(
            PlayersNotReadyError,
        );
    });

    test('should throw error when starting a match already in progress', async () => {
        const lobby: Lobby = {
            id: '1',
            rounds: 2,
            creator: 'user1',
            players: [
                { userId: 'user1', status: 'ready' },
                { userId: 'user2', status: 'ready' },
            ],
            maxPlayers: 4,
            status: 'in-progress',
          bidTime: 10,
          startAmount: 100,
          startInventory: { items: [{ item: 'triangle', quantity: 1 }] },
        };

      mockLobbyRepo.findById.mockResolvedValue(lobby);

        await expect(lobbyService.startMatch('1', 'user1')).rejects.toThrow(
            MatchAlreadyInProgressError,
        );
    });

  test('should throw error when kicking a player without proper authorization', async () => {
    const lobby: Lobby = {
      id: '1',
      rounds: 2,
      creator: 'user1',
      players: [{ userId: 'user2', status: 'waiting' }],
      maxPlayers: 4,
      status: 'waiting',
      bidTime: 10,
      startAmount: 100,
      startInventory: { items: [{ item: 'triangle', quantity: 1 }] },
    };

    mockLobbyRepo.findById.mockResolvedValue(lobby);

    await expect(
      lobbyService.kickPlayer('1', 'user3', 'user2'),
    ).rejects.toThrow(new ForbiddenError('Only the lobby creator can kick players'));
  });
});
