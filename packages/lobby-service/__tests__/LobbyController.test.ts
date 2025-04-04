import { LobbyController } from '../src/controllers/LobbyController'
import { LobbyServiceImpl } from '../src/services/LobbyServiceImpl'
import { Response } from 'express'
import { anyString, mock, MockProxy, mockReset } from 'jest-mock-extended'
import { Lobby, LobbyConfig } from '../src/schemas/Lobby'
import { AuthenticatedRequest } from '../src/types/Index'
import { UserAlreadyInLobby } from '../src/errors/LobbyErrors'

// Mocking LobbyService
const mockLobbyService = mock<LobbyServiceImpl>();
const lobbyController = new LobbyController(mockLobbyService);

// Mocking Express request, response, and next function
const mockRequest: MockProxy<AuthenticatedRequest> = mock<AuthenticatedRequest>();
const mockResponse = mock<Response>();
const mockNext = jest.fn();

beforeEach(() => {
  mockReset(mockLobbyService);
  mockReset(mockRequest);
  mockReset(mockResponse);
  mockReset(mockNext);
  mockRequest.user = { id: 'creatorId', name: 'name', email: 'email' };
});

describe('LobbyController', () => {
    describe('createLobby', () => {
        it('should create a lobby and return 201 status with the created lobby', async () => {
          const lobbyData: LobbyConfig = {
            maxPlayers: 10, rounds: 5,
            bidTime: 10,
            startAmount: 100,
            startInventory: { items: [{ item: 'triangle', quantity: 1 }] },
          }
            const createdLobby: Lobby = {
                ...lobbyData,
              players: [{ userId: 'creatorId', status: 'waiting' }],
                creator: 'creatorId',
                id: '123456789012345678901234',
                status: 'waiting',
            }
            mockRequest.body = lobbyData
            mockLobbyService.createLobby.mockResolvedValue(createdLobby)
            mockResponse.status.mockReturnThis()
            mockResponse.json.mockReturnThis()

            await lobbyController.createLobby(
                mockRequest,
                mockResponse,
                mockNext,
            )

          expect(mockLobbyService.createLobby).toHaveBeenCalled()
            expect(mockResponse.status).toHaveBeenCalledWith(201)
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: anyString(),
                lobby: createdLobby,
            })
        })
    })

    describe('joinLobby', () => {
        it('should allow a user to join a lobby and return the updated lobby', async () => {
            const id = '123456789012345678901234'
            const userId = 'userId'
            const updatedLobby: Lobby = {
                id: id,
                creator: 'creatorId',
                players: [{ userId: userId, status: 'waiting' }],
                maxPlayers: 10,
                rounds: 5,
                status: 'waiting',
              bidTime: 10,
              startAmount: 100,
              startInventory: { items: [{ item: 'triangle', quantity: 1 }] },
            }

            mockRequest.params = { id }
            mockRequest.user = { id: userId, name: 'name', email: 'email' }
            mockLobbyService.joinLobby.mockResolvedValue(updatedLobby)
            mockResponse.status.mockReturnThis()
            mockResponse.json.mockReturnThis()
            await lobbyController.joinLobby(mockRequest, mockResponse, mockNext)

            expect(mockLobbyService.joinLobby).toHaveBeenCalledWith(id, userId)
            expect(mockResponse.status).toHaveBeenCalledWith(200)
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: anyString(),
                lobby: updatedLobby,
            })
        })
    })

    describe('leaveLobby', () => {
        it('should allow a user to leave a lobby and return the updated lobby', async () => {
          const id = '123456789012345678901234';
            const updatedLobby: Lobby = {
                id,
                creator: 'creatorId',
                players: [],
                maxPlayers: 10,
                rounds: 5,
                status: 'waiting',
              bidTime: 10,
              startAmount: 100,
              startInventory: { items: [{ item: 'triangle', quantity: 1 }] },
            };

          mockRequest.activeLobbyId = id;
          mockLobbyService.leaveLobby.mockResolvedValue(updatedLobby);
          mockResponse.status.mockReturnThis();
          mockResponse.json.mockReturnThis();

          await lobbyController.leaveLobby(mockRequest, mockResponse, mockNext);

          expect(mockLobbyService.leaveLobby).toHaveBeenCalledWith(id, 'creatorId');
          expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: anyString(),
                lobby: updatedLobby,
            });
        });

      it('should throw if user has no active lobby', async () => {
        mockRequest.activeLobbyId = undefined;

        await lobbyController.leaveLobby(mockRequest, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('kickPlayer', () => {
        it('should allow a creator to kick a player and return the updated lobby', async () => {
          const id = '123456789012345678901234';
          const creator = 'creatorId';
          const playerId = 'playerId';
            const updatedLobby: Lobby = {
                id,
                creator,
                players: [],
                maxPlayers: 10,
                rounds: 5,
                status: 'waiting',
              bidTime: 10,
              startAmount: 100,
              startInventory: { items: [{ item: 'triangle', quantity: 1 }] },
            };

          mockRequest.activeLobbyId = id;
          mockRequest.params = { userId: playerId }
          mockLobbyService.kickPlayer.mockResolvedValue(updatedLobby);
          mockResponse.status.mockReturnThis();
          mockResponse.json.mockReturnThis();

          await lobbyController.kickPlayer(mockRequest, mockResponse, mockNext);

          expect(mockLobbyService.kickPlayer).toHaveBeenCalledWith(id, creator, playerId);
          expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: anyString(),
                lobby: updatedLobby,
            });
        });
    });

    describe('setStatus', () => {
      it('should set a player\'s status and return the updated lobby', async () => {
        const id = '123456789012345678901234';
        const status = 'ready';
            const updatedLobby: Lobby = {
                id,
                creator: 'creatorId',
                players: [{ userId: 'creatorId', status }],
                maxPlayers: 10,
                rounds: 5,
                status: 'waiting',
              bidTime: 10,
              startAmount: 100,
              startInventory: { items: [{ item: 'triangle', quantity: 1 }] },
            };

        mockRequest.activeLobbyId = id;
        mockRequest.body = { status };
        mockLobbyService.setStatus.mockResolvedValue(updatedLobby);
        mockResponse.status.mockReturnThis();
        mockResponse.json.mockReturnThis();

        await lobbyController.setStatus(mockRequest, mockResponse, mockNext);

        expect(mockLobbyService.setStatus).toHaveBeenCalledWith(id, 'creatorId', status);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: anyString(),
                lobby: updatedLobby,
            });
      });
    });

    describe('startMatch', () => {
        it('should start a match and return the updated lobby', async () => {
          const id = '123456789012345678901234';
          const creator = 'creatorId';
            const updatedLobby: Lobby = {
                id,
                creator,
                players: [],
                maxPlayers: 10,
                rounds: 5,
                status: 'in-progress',
              bidTime: 10,
              startAmount: 100,
              startInventory: { items: [{ item: 'triangle', quantity: 1 }] },
            };

          mockRequest.activeLobbyId = id;
          mockLobbyService.startMatch.mockResolvedValue(updatedLobby);
          mockResponse.status.mockReturnThis();
          mockResponse.json.mockReturnThis();

          await lobbyController.startMatch(mockRequest, mockResponse, mockNext);

          expect(mockLobbyService.startMatch).toHaveBeenCalledWith(id, creator);
          expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: anyString(),
                lobby: updatedLobby,
            });
        });
    });
  it('should get the lobby of a user that joined', async () => {
    const id = '123456789012345678901234'
    const lobby: Lobby = {
      id,
      creator: 'creatorId',
      players: [{ userId: 'creatorId', status: 'waiting' }],
      maxPlayers: 10,
      rounds: 5,
      status: 'waiting',
      bidTime: 10,
      startAmount: 100,
      startInventory: { items: [{ item: 'triangle', quantity: 1 }] },
    }

    mockRequest.activeLobbyId = id
    mockLobbyService.getLobby.mockResolvedValue(lobby)
    mockResponse.status.mockReturnThis()
    mockResponse.json.mockReturnThis()

    await lobbyController.getLobby(mockRequest, mockResponse, mockNext)

    expect(mockResponse.status).toHaveBeenCalledWith(200)
  })

    it('should throw if the user is not authenticated', () => {
        mockRequest.user = undefined
        lobbyController.createLobby(mockRequest, mockResponse, mockNext)
        expect(mockNext).toHaveBeenCalled()
    })
    it('should throw if the user is already in the lobby', async () => {
        const id = '123456789012345678901234';
        mockRequest.params = { id };
        mockRequest.user = { id: 'userId', name: 'name', email: 'email' };
      mockLobbyService.joinLobby.mockRejectedValue(new UserAlreadyInLobby('email'))
        mockResponse.status.mockReturnThis();
        mockResponse.json.mockReturnThis();

        await lobbyController.joinLobby(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new UserAlreadyInLobby('email'))
    });
})
