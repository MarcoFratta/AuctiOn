import request from 'supertest';
import express, { Application } from 'express';
import { createRouter } from '../src/routes/Routes';
import { AuthController } from '../src/controllers/AuthController';

jest.mock('../src/controllers/AuthController');

describe('Auth Router', () => {
  let app: Application;
  let authController: jest.Mocked<AuthController>;

  beforeEach(() => {
    // Create a mocked AuthController
    authController = {
      login: jest.fn(),
      register: jest.fn(),
      validateToken: jest.fn(),
    } as unknown as jest.Mocked<AuthController>;

    // Initialize an Express app with the router
    app = express();
    app.use(express.json()); // Middleware for parsing JSON
    app.use('/auth', createRouter(authController));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('should call the login method of AuthController', async () => {
      const loginResponse = { token: 'mocked-token' };
      authController.login.mockImplementation(async (_req, res, _next) => {
        res.status(200).json(loginResponse);
      });

      await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(200)
        .expect(loginResponse);

      expect(authController.login).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /auth/register', () => {
    it('should call the register method of AuthController', async () => {
      const registerResponse = {
        message: 'User registered successfully',
        user: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
        },
        token: 'mocked-token',
      };
      (authController.register as jest.Mock).mockImplementationOnce((req, res) =>
        res.status(201).json(registerResponse),
      );

      await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123',
          name: 'Test User',
        })
        .expect(201)
        .expect(registerResponse);

      expect(authController.register).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /auth/validate', () => {
    it('should call the validateToken method of AuthController', async () => {
      const validateResponse = { valid: true };
      (authController.validateToken as jest.Mock).mockImplementationOnce((req, res) =>
        res.status(200).json(validateResponse),
      );

      await request(app)
        .post('/auth/validate')
        .send({ token: 'mocked-token' })
        .expect(200)
        .expect(validateResponse);

      expect(authController.validateToken).toHaveBeenCalledTimes(1);
    });
  });
});
