import {
  InvalidTokenError,
  UserAlreadyExistsError,
  UserNotFoundError,
  WrongPasswordError,
} from '../src/errors/AuthErrors'
import { AuthServiceImpl } from '../src/services/AuthServiceImpl'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import { AccountRepository } from '../src/repositories/AccountRepository'
import { LoginInputData, RegisterInputData, User } from '../src/schemas/AuthSchema'
import { TokenGenerator } from '../src/domain/TokenGenerator'
import { mock } from 'jest-mock-extended'
import { RedisTokenRepo } from '../src/repositories/RedisTokenRepo'
import mockRedis from 'ioredis-mock'

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('axios');

describe('AuthService', () => {
  let authService: AuthServiceImpl;
  let mockAccountRepository: jest.Mocked<AccountRepository>;
  let mockTokenGenerator: jest.Mocked<TokenGenerator>
  let mockTokenRepo: RedisTokenRepo
  const userServiceURL = 'http://user-service:3000/users';
  beforeEach(() => {
    // Create a mock for AccountRepository
    mockAccountRepository = mock<AccountRepository>()
    // Create a mock for TokenGenerator
    mockTokenRepo = new RedisTokenRepo(new mockRedis(), 7)
    mockTokenGenerator = mock<TokenGenerator>()
    authService = new AuthServiceImpl(mockTokenGenerator,
      mockAccountRepository, mockTokenRepo, userServiceURL)
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test for register
  it('should register a new user successfully', async () => {
    const userData: RegisterInputData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };
    const hashedPassword = 'hashedPassword';
    const accountId = '123456789012345678901234';

    (axios.get as jest.Mock).mockRejectedValueOnce(new UserNotFoundError(userData.email)); // No user exists
    (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
    mockAccountRepository.create.mockResolvedValue({
      id: accountId,
      pHash: hashedPassword,
    });
    (axios.post as jest.Mock)
      .mockResolvedValue({
        data: {
          id: accountId,
          email: userData.email,
          name: userData.name,
        },
      });
    mockTokenGenerator.generateAccessToken.mockReturnValue('accessToken')
    mockTokenGenerator.generateRefreshToken.mockReturnValue('refreshToken')

    const result = await authService.register(userData);

    expect(axios.get).toHaveBeenCalledWith(`${userServiceURL}/email/${userData.email}`);
    expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
    expect(mockAccountRepository.create).toHaveBeenCalledWith({
      pHash: hashedPassword,
    });
    expect(axios.post).toHaveBeenCalledWith(userServiceURL, {
      id: accountId,
      email: userData.email,
      name: userData.name,
    });
    expect(mockTokenGenerator.generateAccessToken).toHaveBeenCalledWith(
      { id: accountId, email: userData.email, name: userData.name },
    );
    expect(mockTokenGenerator.generateRefreshToken).toHaveBeenCalledWith({
      id: accountId,
    })
    expect(result).toHaveProperty('accessToken', 'accessToken')
    expect(result).toHaveProperty('refreshToken', 'refreshToken')
    expect(result).toHaveProperty('id', accountId);
    expect(result).toHaveProperty('email', userData.email);
    expect(result).toHaveProperty('name', userData.name);
  });

  it('should throw an error if the user already exists', async () => {
    const userData: RegisterInputData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        id: '123456789012345678901234',
        email: userData.email,
        name: userData.name,
      },
    });

    await expect(authService.register(userData)).rejects.toThrow(
      new UserAlreadyExistsError(userData.email),
    );

    expect(axios.get).toHaveBeenCalledWith(`${userServiceURL}/email/${userData.email}`);
    expect(mockAccountRepository.create).not.toHaveBeenCalled();
    expect(axios.post).not.toHaveBeenCalled();
  });

  // Test for login
  it('should login a user successfully', async () => {
    const userData: LoginInputData = {
      email: 'test@example.com',
      password: 'password123',
    };
    const account = {
      id: '123456789012345678901234',
      pHash: 'hashedPassword',
    };

    (axios.get as jest.Mock).mockResolvedValue({
      data: { id: account.id, email: userData.email, name: 'Test User' },
    });
    mockAccountRepository.findById.mockResolvedValue(account);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    mockTokenGenerator.generateAccessToken.mockReturnValue('accessToken')
    mockTokenGenerator.generateRefreshToken.mockReturnValue('refreshToken')

    const result = await authService.login(userData);

    expect(axios.get).toHaveBeenCalledWith(`${userServiceURL}/email/${userData.email}`);
    expect(mockAccountRepository.findById).toHaveBeenCalledWith(account.id);
    expect(bcrypt.compare).toHaveBeenCalledWith(userData.password, account.pHash);

    expect(result).toHaveProperty('accessToken', 'accessToken')
    expect(result).toHaveProperty('refreshToken', 'refreshToken')
    expect(result).toHaveProperty('id', account.id);
    expect(result).toHaveProperty('email', userData.email);
    expect(result).toHaveProperty('name', 'Test User');
  });

  it('should throw an error if the user is not found', async () => {
    const userData: LoginInputData = {
      email: 'test@example.com',
      password: 'password123',
    };

    (axios.get as jest.Mock).mockRejectedValueOnce(new UserNotFoundError(userData.email));

    await expect(authService.login(userData)).rejects.toThrow(
      new UserNotFoundError(userData.email),
    );

    expect(axios.get).toHaveBeenCalledWith(`${userServiceURL}/email/${userData.email}`);
    expect(mockAccountRepository.findById).not.toHaveBeenCalled();
    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  it('should throw an error if the password is invalid', async () => {
    const userData: LoginInputData = {
      email: 'test@example.com',
      password: 'password123',
    };
    const account = {
      id: '123456789012345678901234',
      pHash: 'hashedPassword',
    };

    (axios.get as jest.Mock).mockResolvedValue({
      data: { id: account.id, email: userData.email, name: 'Test User' },
    });
    mockAccountRepository.findById.mockResolvedValue(account);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(authService.login(userData)).rejects.toThrow(new WrongPasswordError());

    expect(axios.get).toHaveBeenCalledWith(`${userServiceURL}/email/${userData.email}`);
    expect(mockAccountRepository.findById).toHaveBeenCalledWith(account.id);
    expect(bcrypt.compare).toHaveBeenCalledWith(userData.password, account.pHash);
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  // Test for validateToken
  it('should validate a valid JWT', async () => {
    const token = { accessToken: 'validToken' }
    const decoded: User = {
      id: '000000000000000000000000',
      email: 'test@example.com',
      name: 'Test User',
    };

    mockTokenGenerator.verifyAccessToken.mockReturnValue(decoded)

    const result = authService.validateToken(token);

    expect(mockTokenGenerator.verifyAccessToken).toHaveBeenCalledWith(token.accessToken)
    expect(result).toEqual(decoded);
  });

  it('should throw an error for an invalid JWT', async () => {
    const token = { accessToken: 'invalidToken' };

    (mockTokenGenerator.verifyAccessToken).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    expect(() => authService.validateToken(token)).toThrow(new InvalidTokenError());
    expect(mockTokenGenerator.verifyAccessToken).toHaveBeenCalledWith(token.accessToken)
  });
  // Test for refresh token
  it('should refresh a token successfully', async () => {
    const refreshToken = 'validRefreshToken'
    const accessToken = 'validAccessToken'
    const user = {
      id: '000000000000000000000000',
      email: 'test@email.com',
      name: 'test',
    }
    const decoded = { id: '000000000000000000000000' }
    await mockTokenRepo.saveRefreshToken(refreshToken, user.id)
    // Mock the behavior of the token generator
    mockTokenGenerator.verifyRefreshToken.mockReturnValue(decoded)
    mockTokenGenerator.generateAccessToken.mockReturnValue(accessToken)
    mockTokenGenerator.generateRefreshToken.mockReturnValue('newRefreshToken');
    (axios.get as jest.Mock).mockResolvedValue({ data: user })
    // Mock the stored refresh token

    const result = await authService.refreshToken({ refreshToken })

    expect(mockTokenGenerator.verifyRefreshToken).toHaveBeenCalledWith(refreshToken)
    expect(mockTokenGenerator.generateAccessToken).toHaveBeenCalledWith(user)
    expect(mockTokenGenerator.generateRefreshToken).toHaveBeenCalledWith(decoded)
    expect(result).toEqual({
      accessToken: accessToken,
      refreshToken: 'newRefreshToken',
    })
  })

  it('should throw an error for an invalid refresh token', async () => {
    const refreshToken = 'invalidRefreshToken'

    // Mock the behavior of the token generator to throw an error
    mockTokenGenerator.verifyRefreshToken.mockImplementation(() => {
      throw new InvalidTokenError()
    })

    await expect(authService.refreshToken({ refreshToken })).rejects.toThrow(InvalidTokenError)
    expect(mockTokenGenerator.verifyRefreshToken).toHaveBeenCalledWith(refreshToken)
  })
});
