<<<<<<< HEAD
import request from 'supertest'
import app from '../src/App' // Assuming `app` is your Express app
import axios from 'axios'
import { UserServiceUnavailableError } from '../src/errors/AuthErrors'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { closeLocalMongoConnection, localMongoConnection } from './common'
=======
import request from 'supertest';
import app from '../src/App'; // Assuming `app` is your Express app
import axios from 'axios';
import { UserServiceUnavailableError } from '../src/errors/AuthErrors';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { closeLocalMongoConnection, localMongoConnection } from './common';
>>>>>>> c774751 (chore: fix project structure bug)

jest.mock('axios')

describe('Error Use Cases', () => {
    let mongoServer: MongoMemoryServer
    beforeAll(async () => {
        mongoServer = await localMongoConnection()
    })
    afterAll(async () => {
        await closeLocalMongoConnection(mongoServer)
    })
    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Register Endpoint Error Cases', () => {
        it('should return 400 when the user already exists', async () => {
<<<<<<< HEAD
            // Mock the user service to return an existing user
            ;(axios.get as jest.Mock).mockResolvedValueOnce({
                data: {
                    id: '123456789012345678901234',
                    name: 'test',
                    email: 'test@example.com',
                },
            })
=======
          // Mock the user service to return an existing user
          (axios.get as jest.Mock).mockResolvedValueOnce({
            data: {
              id: '123456789012345678901234',
              name: 'test',
              email: 'test@example.com',
            },
          });
>>>>>>> c774751 (chore: fix project structure bug)

          const response = await request(app).post('/auth/register').send({
            email: 'test@example.com',
            password: 'Password1',
            name: 'Test User',
          });

          expect(response.status).toBe(400);
          expect(response.body).toMatchObject({
            error: 'An account with this email already exists',
            message: expect.any(String),
          });
        })

        it('should return 503 when the user service is unavailable', async () => {
            // Mock Axios to throw a connection error
<<<<<<< HEAD
            ;(axios.get as jest.Mock).mockRejectedValueOnce(
                new UserServiceUnavailableError(
                    'User Service is not responding'
                )
            )
=======
          ;(axios.get as jest.Mock).mockRejectedValueOnce(
            new UserServiceUnavailableError(
              'User Service is not responding',
            ),
          )
>>>>>>> c774751 (chore: fix project structure bug)


          const response = await request(app).post('/auth/register').send({
                email: 'test@example.com',
                password: 'Password1',
                name: 'Test User',
            })

            expect(response.status).toBe(503)
            expect(response.body).toMatchObject({
                error: 'Service Temporary Unavailable',
                message: expect.any(String),
            })
        })
    })

    describe('Login Endpoint Error Cases', () => {
        it('should return 404 when the user is not found', async () => {
            // Mock the user service to return null or empty data
<<<<<<< HEAD
            ;(axios.get as jest.Mock).mockResolvedValueOnce({ data: null })
=======
          ;(axios.get as jest.Mock).mockResolvedValueOnce({ data: null });
>>>>>>> c774751 (chore: fix project structure bug)

            const response = await request(app).post('/auth/login').send({
                email: 'nonexistent@example.com',
                password: 'Password1',
            })

            expect(response.status).toBe(404)
            expect(response.body).toMatchObject({
                error: 'User Not Found',
                message: expect.any(String),
            })
        })

        it('should return 400 for an incorrect password', async () => {
            // Mock the user service to return a user
<<<<<<< HEAD
            const userData = { email: 'test@example.com', name: 'Test User' }

            ;(axios.get as jest.Mock).mockResolvedValueOnce({ data: null })
            ;(axios.post as jest.Mock).mockResolvedValueOnce({
                data: {
                    ...userData,
                    id: '123456789012345678901234',
=======
          const userData = { email: 'test@example.com', name: 'Test User' }

          ;(axios.get as jest.Mock).mockResolvedValueOnce({ data: null })
            ;(axios.post as jest.Mock).mockResolvedValueOnce({
                data: {
                    ...userData,
                  id: '123456789012345678901234',
>>>>>>> c774751 (chore: fix project structure bug)
                },
            })
            const id = (
                await request(app)
                    .post('/auth/register')
<<<<<<< HEAD
                    .send({ ...userData, password: 'Password1' })
=======
                  .send({ ...userData, password: 'Password1' })
>>>>>>> c774751 (chore: fix project structure bug)
            ).body.user.id
            // Mock bcrypt to return false for password validation
            jest.mock('bcrypt', () => ({
                compare: jest.fn().mockResolvedValue(false),
            }))
            ;(axios.get as jest.Mock).mockResolvedValueOnce({
<<<<<<< HEAD
                data: { ...userData, id: id },
=======
            data: { ...userData, id: id },
>>>>>>> c774751 (chore: fix project structure bug)
            })
            const response = await request(app).post('/auth/login').send({
                email: 'test@example.com',
                password: 'wrongPassword',
            })

            expect(response.status).toBe(400)
            expect(response.body).toMatchObject({
                error: 'Wrong password',
                message: expect.any(String),
            })
        })

        it('should return 503 when the user service is unavailable', async () => {
            // Mock Axios to throw a connection error
            ;(axios.get as jest.Mock).mockRejectedValueOnce(
                new UserServiceUnavailableError(
                    'User Service is not responding'
                )
            )

            const response = await request(app).post('/auth/login').send({
                email: 'test@example.com',
                password: 'Password1',
            })

            expect(response.status).toBe(503)
            expect(response.body).toMatchObject({
                error: 'Service Temporary Unavailable',
                message: expect.any(String),
            })
        })
    })

    describe('Token Validation Error Cases', () => {
        it('should return 400 for an invalid token', async () => {
            const response = await request(app).post('/auth/validate').send({
                token: 'invalidToken',
            })

            expect(response.status).toBe(400)
            expect(response.body).toMatchObject({
                error: 'Token is not valid',
                message: expect.any(String),
            })
        })

        it('should return 400 when the user service is unavailable and the token is not valid', async () => {
            // Mock Axios to throw a connection error
            ;(axios.get as jest.Mock).mockRejectedValueOnce(
                new UserServiceUnavailableError(
                    'User Service is not responding'
                )
            )

            const response = await request(app).post('/auth/validate').send({
                token: 'validToken',
            })

            expect(response.status).toBe(400)
            expect(response.body).toMatchObject({
                error: 'Token is not valid',
                message: expect.any(String),
            })
        })
    })
})
