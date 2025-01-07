import { ActiveLobbyMiddleware } from '../src/middlewares/ActiveLobbyMiddleware'
import { UserLobbyRepo } from '../src/repositories/UserLobbyRepo'
import { Response } from 'express'
import { AuthenticatedRequest } from '../src/middlewares/AuthMiddleware'
import { UserAlreadyInLobby, UserNotAuthenticatedError, UserNotInActiveLobby } from '../src/errors/LobbyErrors'
import { mock, MockProxy } from 'jest-mock-extended'
import { UserLobby } from '../src/schemas/UserLobby'

describe('ActiveLobbyMiddleware', () => {
  let mockUserLobbyRepo: MockProxy<UserLobbyRepo>;
  let middleware: ActiveLobbyMiddleware;
  let mockRequest: MockProxy<AuthenticatedRequest>;
  let mockResponse: MockProxy<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockUserLobbyRepo = mock<UserLobbyRepo>();
    middleware = new ActiveLobbyMiddleware(mockUserLobbyRepo);
    mockRequest = mock<AuthenticatedRequest>();
    mockResponse = mock<Response>();
    mockNext = jest.fn();
  });

  describe('checkNoActiveLobby', () => {
    it('should throw UnauthorizedError if no user in request', async () => {
      mockRequest.user = undefined;

      await middleware.checkNoActiveLobby(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UserNotAuthenticatedError))
    });

    it('should throw UserAlreadyInLobby if user has active lobby', async () => {
      mockRequest.user = { id: 'user123', name: 'Test User', email: 'test@test.com' };
      const activeLobby: UserLobby = {
        userId: 'user123',
        lobbyId: 'lobby123',
        state: 'waiting',
        joinedAt: new Date(),
      };

      mockUserLobbyRepo.getUserActiveLobby.mockResolvedValue(activeLobby);

      await middleware.checkNoActiveLobby(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new UserAlreadyInLobby('lobby123'));
    });

    it('should call next if user has no active lobby', async () => {
      mockRequest.user = { id: 'user123', name: 'Test User', email: 'test@test.com' };
      mockUserLobbyRepo.getUserActiveLobby.mockResolvedValue(null);

      await middleware.checkNoActiveLobby(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('attachActiveLobby', () => {
    it('should attach lobby id to request if user has active lobby', async () => {
      mockRequest.user = { id: 'user123', name: 'Test User', email: 'test@test.com' };
      const activeLobby: UserLobby = {
        userId: 'user123',
        lobbyId: 'lobby123',
        state: 'waiting',
        joinedAt: new Date(),
      };

      mockUserLobbyRepo.getUserActiveLobby.mockResolvedValue(activeLobby);

      await middleware.attachActiveLobby(mockRequest, mockResponse, mockNext);

      expect(mockRequest.activeLobbyId).toBe('lobby123');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should not attach lobby id if user has no active lobby', async () => {
      mockRequest.user = { id: 'user123', name: 'Test User', email: 'test@test.com' };
      mockUserLobbyRepo.getUserActiveLobby.mockResolvedValue(null);

      await middleware.attachActiveLobby(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new UserNotInActiveLobby());
    });
  });
}); 