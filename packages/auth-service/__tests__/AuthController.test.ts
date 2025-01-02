<<<<<<< HEAD
import { AuthController } from '../src/controllers/AuthController'
import { AuthService } from '../src/services/AuthService'
import { NextFunction, Request, Response } from 'express'
import { AuthServiceImpl } from '../src/services/AuthServiceImpl'
import { AccountRepository } from '../src/repositories/AccountRepository'

// Mock dependencies
jest.mock('../src/services/AuthServiceImpl')

describe('AuthController', () => {
    let authController: AuthController
    let authService: jest.Mocked<AuthService>
    let req: Partial<Request>
    let res: Partial<Response>
    let next: jest.Mock<NextFunction>

    beforeEach(() => {
        // Create mocked service
        authService = new AuthServiceImpl(
            '',
            '',
            {} as AccountRepository
        ) as jest.Mocked<AuthServiceImpl>

        // Instantiate controller with mocked service
        authController = new AuthController(authService)

        // Mock request, response, and next
        req = {}
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }
        next = jest.fn()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('login', () => {
        it('should return a token on successful login', async () => {
            const user = {
                id: 'test-user-id',
                email: 'test@example.com',
                name: 'Test User',
            }
            const token = { token: 'mocked-token' }
            req.body = { email: 'test@example.com', password: 'password123' }
            authService.login.mockResolvedValueOnce({ ...token, ...user })

            await authController.login(req as Request, res as Response, next)

            expect(authService.login).toHaveBeenCalledWith(req.body)
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({
                user: { ...token, ...user },
            })
            expect(next).not.toHaveBeenCalled()
        })

        it('should call next with an error if login fails', async () => {
            const error = new Error('Login failed')
            req.body = { email: 'test@example.com', password: 'wrong-password' }
            authService.login.mockRejectedValue(error)

            await authController.login(req as Request, res as Response, next)

            expect(authService.login).toHaveBeenCalledWith(req.body)
            expect(res.status).not.toHaveBeenCalled()
            expect(res.json).not.toHaveBeenCalled()
            expect(next).toHaveBeenCalledWith(error)
        })
    })

    describe('register', () => {
        it('should register a user and return a token', async () => {
            const token = { token: 'mocked-token' }
            const user = {
                id: 'test-user-id',
                email: 'test@example.com',
                name: 'Test User',
            }
            req.body = {
                email: 'test@example.com',
                password: 'Password123',
            }

            authService.register.mockResolvedValue({ ...token, ...user })

            await authController.register(req as Request, res as Response, next)

            expect(authService.register).toHaveBeenCalledWith(req.body)
            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalledWith({
                message: 'User registered successfully',
                user: { ...token, ...user },
            })
            expect(next).not.toHaveBeenCalled()
        })

        it('should call next with an error if registration fails', async () => {
            const error = new Error('Registration failed')
            req.body = {
                email: 'test@example.com',
                password: 'Password123',
                name: 'Test User',
            }

            authService.register.mockRejectedValue(error)

            await authController.register(req as Request, res as Response, next)

            expect(authService.register).toHaveBeenCalledWith(req.body)
            expect(authService.login).not.toHaveBeenCalled()
            expect(res.status).not.toHaveBeenCalled()
            expect(res.json).not.toHaveBeenCalled()
            expect(next).toHaveBeenCalledWith(error)
        })
    })
})
=======
import { AuthController } from '../src/controllers/AuthController';
import { AuthService } from '../src/services/AuthService';
import { NextFunction, Request, Response } from 'express';
import { AuthServiceImpl } from '../src/services/AuthServiceImpl';
import { AccountRepository } from '../src/repositories/AccountRepository';

// Mock dependencies
jest.mock('../src/services/AuthServiceImpl');

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<AuthService>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock<NextFunction>;

  beforeEach(() => {
    // Create mocked service
    authService = new AuthServiceImpl(
      '',
      '',
      {} as AccountRepository,
    ) as jest.Mocked<AuthServiceImpl>;

    // Instantiate controller with mocked service
    authController = new AuthController(authService);

    // Mock request, response, and next
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return a token on successful login', async () => {
      const user = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
      };
      const token = { token: 'mocked-token' };
      req.body = { email: 'test@example.com', password: 'password123' };
      authService.login.mockResolvedValueOnce({
      ...token,
      ...user
    })

      await authController.login(req as Request, res as Response, next)

      expect(authService.login).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        user: { ...token, ...user },
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with an error if login fails', async () => {
      const error = new Error('Login failed');
      req.body = { email: 'test@example.com', password: 'wrong-password' };
      authService.login.mockRejectedValue(error);

      await authController.login(req as Request, res as Response, next);

      expect(authService.login).toHaveBeenCalledWith(req.body);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('register', () => {
    it('should register a user and return a token', async () => {
      const token = { token: 'mocked-token' };
      const user = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
      };
      req.body = {
        email: 'test@example.com',
        password: 'Password123',
      };

      authService.register.mockResolvedValue({ ...token, ...user });

      await authController.register(req as Request, res as Response, next);

      expect(authService.register).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
        user: { ...token, ...user },
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with an error if registration fails', async () => {
      const error = new Error('Registration failed');
      req.body = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      };

      authService.register.mockRejectedValue(error);

      await authController.register(req as Request, res as Response, next);

      expect(authService.register).toHaveBeenCalledWith(req.body);
      expect(authService.login).not.toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
>>>>>>> c774751 (chore: fix project structure bug)
