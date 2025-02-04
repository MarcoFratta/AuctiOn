import request from 'supertest'
import axios from 'axios'
import * as console from 'node:console'
import { config } from '../src/configs/config'
import { App } from '../src/App'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { closeLocalMongoConnection, localMongoConnection } from './common'
import { RegisterInputData } from '../src/schemas/AuthSchema'
import { UserNotFoundError, UserServiceUnavailableError } from '../src/errors/AuthErrors'
import mockRedis from 'ioredis-mock'
import { Express } from 'express'

// Mock Axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>
const userServiceUrl = config.userServiceUrl

describe('Auth Service Integration Tests with Axios Mock', () => {
  let mongoServer: MongoMemoryServer
  let app: Express
  beforeAll(async () => {
    mongoServer = await localMongoConnection();
    const server = new App(new mockRedis())
    app = server.app
  });
  afterAll(async () => {
    await closeLocalMongoConnection(mongoServer);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  async function register(user: RegisterInputData): Promise<any> {
    mockedAxios.get.mockRejectedValueOnce(new UserNotFoundError(user.email));
    mockedAxios.post.mockResolvedValue({
      data: { ...user, id: '123456789012345678901234' },
    });
    // Perform the request
    return await request(app).post('/auth/register').send({
      email: 'test@example.com',
      name: 'Test User',
      password: 'Password1',
    });
  }

  describe('POST /auth/register', () => {
    it('should register a user and return a token', async () => {
      // Mock User Service response for registration
      const user = {
        id: '123456789012345678901234',
        email: 'test@example.com',
        name: 'Test User',
      };
      const response = await register({ ...user, password: 'Password1' });
      console.log(response.body);
      // Assert the response
      expect(response.status).toBe(201);
      // Assert that response.body is an object containing 'message' and 'token'
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.id).not.toBe(user.id);
      expect(response.body.id).not.toBe('');
      expect(response.body.user).toHaveProperty('token');
      // Assert that message is a string
      expect(typeof response.body.message).toBe('string');
      // Assert that token is a non-empty string
      expect(typeof response.body.user.token).toBe('string');
      expect(response.body.user.token).not.toBe('');
      // Ensure Axios calls were made with correct parameters
      expect(mockedAxios.get).toHaveBeenCalledWith(userServiceUrl + '/email/test@example.com');
    });
  });

  describe('POST /auth/login', () => {
    it('should log in a user and return a token', async () => {
      // Mock User Service response for user fetch
      const user = { email: 'test@example.com', name: 'Test User' };
      const r = await register({ ...user, password: 'Password1' });
      console.log(r.body);
      const id = r.body.user.id;
      mockedAxios.get.mockResolvedValueOnce({ data: { ...user, id: id } });
      const response = await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'Password1',
      });
      console.log(response.body);

      expect(response.body.user).toHaveProperty('token');
      expect(response.body.user.token).not.toBe('');
      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.id).not.toBe('');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user.email).toBe(user.email);
      expect(response.body.user).toHaveProperty('name');
      expect(response.body.user.name).toBe(user.name);
      // Assert that message is a string
      expect(typeof response.body.user.token).toBe('string');
      expect(response.body.user.token).not.toBe('');

      expect(mockedAxios.get).toHaveBeenCalledWith(userServiceUrl + '/email/test@example.com');
    });
  });

  describe('POST /auth/validate', () => {
    it('should validate a token successfully', async () => {
      // Mock User Service response for token validation
      const user = {
        email: 'test@example.com',
        name: 'Test User',
      };
      const response = await register({ ...user, password: 'Password1' });

      const res = await request(app).post('/auth/validate').send({
        token: response.body.user.token,
      });
      console.log(res.body);
      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.id).not.toBe('');
      expect(res.body.user).toHaveProperty('email', user.email);
      expect(res.body.user).toHaveProperty('name', user.name);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors from the User Service gracefully', async () => {
      // Mock User Service failure
      mockedAxios.get.mockRejectedValueOnce(new UserServiceUnavailableError('User Service error'));

      const response = await request(app).post('/auth/register').send({
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password1',
      });

      expect(response.status).toBe(503);
      expect(response.body).toHaveProperty('error', 'Service Temporary Unavailable');

      expect(mockedAxios.get).toHaveBeenCalledWith(userServiceUrl + '/email/test@example.com');
    });
  });
});
