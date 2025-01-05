import { AuthenticatedRequest, AuthMiddleware } from '../src/middlewares/AuthMiddleware';
import { User } from '../src/schemas/User';
import { validateSchema } from '../src/utils/Validator';
import axios from 'axios';
import { Request, Response } from 'express';
import { jest } from '@jest/globals';
import { config } from '../src/configs/config';
import { mock, MockProxy, mockReset } from 'jest-mock-extended';
import { UnauthorizedError } from '../src/errors/LobbyErrors';
import { ValidationError } from 'zod-validation-error';

jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../src/utils/Validator', () => ({
  validateSchema: jest.fn(),
}));
const mockValidateSchema = validateSchema as jest.MockedFunction<typeof validateSchema>;

jest.mock('../src/utils/Logger');

const AUTH_SERVICE_URL = config.authServiceUri;

describe('AuthMiddleware', () => {
  let mockRequest: MockProxy<AuthenticatedRequest>;
  let mockResponse: MockProxy<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = mock<AuthenticatedRequest>();
    mockResponse = mock<Response>();
    mockNext = jest.fn();

    // Reset mocks
    mockReset(mockRequest);
    mockReset(mockResponse);
    mockReset(mockNext);

    // Setup default behavior for response methods
    mockResponse.status.mockReturnThis();
    mockResponse.json.mockReturnThis();
  });

  it('should return 401 unauthorized if no token is provided', async () => {
    mockRequest.headers = { authorization: undefined };

    await AuthMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 unauthorized if token validation fails', async () => {
    mockRequest.headers = { authorization: 'Bearer invalidToken' };
    mockAxios.post.mockRejectedValue(new UnauthorizedError());

    await AuthMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call next and attach user info if token is valid', async () => {
    const mockUser: User = {
      id: '123',
      name: 'Test User',
      email: 'test.com',
    };

    mockRequest.headers = { authorization: 'Bearer validToken' };
    mockAxios.post.mockResolvedValue({ data: { user: mockUser } });
    mockValidateSchema.mockReturnValue(new ValidationError());

    await AuthMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockAxios.post).toHaveBeenCalledWith(AUTH_SERVICE_URL + '/validate', {
      token: 'validToken',
    });

    expect(mockNext).toHaveBeenCalled();
  });

  it('should return 401 unauthorized if there is an error during authentication', async () => {
    mockRequest.headers = { authorization: 'Bearer validToken' };
    mockAxios.post.mockRejectedValue(new UnauthorizedError());

    await AuthMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
