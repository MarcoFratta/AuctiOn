import request from 'supertest'
import app from '../src/App' // Assuming `app` is your Express app
import axios from 'axios'
import {UserServiceUnavailableError} from '../src/errors/AuthErrors'
import {MongoMemoryServer} from 'mongodb-memory-server'
import {closeLocalMongoConnection, localMongoConnection} from './common'

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
            // Mock the user service to return an existing user
            ;(axios.get as jest.Mock).mockResolvedValueOnce({
                data: {email: 'test@example.com'},
            })

            const response = await request(app).post('/auth/register').send({
                email: 'test@example.com',
                password: 'Password1',
                name: 'Test User',
            })

            expect(response.status).toBe(400)
            expect(response.body).toMatchObject({
                error: 'An account with this email already exists',
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
            ;(axios.get as jest.Mock).mockResolvedValueOnce({data: null})

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
            const userData = {email: 'test@example.com', name: 'Test User'}

            ;(axios.get as jest.Mock).mockResolvedValueOnce({data: null})
            ;(axios.post as jest.Mock).mockResolvedValueOnce({data: userData})
            const id = (
                await request(app)
                    .post('/auth/register')
                    .send({...userData, password: 'Password1'})
            ).body.user.id
            // Mock bcrypt to return false for password validation
            jest.mock('bcrypt', () => ({
                compare: jest.fn().mockResolvedValue(false),
            }))
            ;(axios.get as jest.Mock).mockResolvedValueOnce({
                data: {...userData, id: id},
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
