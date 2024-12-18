import request from 'supertest'
import axios from 'axios'
import app from '../src/App'
import { config } from '../src/configs/config'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { closeLocalMongoConnection, localMongoConnection } from './common'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

const authServiceUrl = config.authServiceUri

describe('Lobby Service Integration Tests with Auth Service Mock', () => {
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

    const validToken = 'Bearer validToken123'
    const user = {
        id: '123456789012345678901234',
        email: 'test@example.com',
        name: 'Test User',
    }

    describe('POST /lobby/create', () => {
        it('should create a lobby successfully with valid token', async () => {
            mockedAxios.post.mockResolvedValueOnce({ data: user })

            const response = await request(app)
                .post('/lobby/create')
                .set('Authorization', validToken)
                .send({ name: 'Test Lobby', maxPlayers: 4 })

            console.log(response.body)
            expect(response.status).toBe(201)
            expect(response.body).toHaveProperty('message', 'Lobby created successfully')
            expect(response.body).toHaveProperty('lobby')
            expect(response.body.lobby).toHaveProperty('id')
            expect(response.body.lobby).toHaveProperty('name', 'Test Lobby')
            expect(response.body.lobby).toHaveProperty('host', user.id)

            expect(mockedAxios.post).toHaveBeenCalledWith(`${authServiceUrl}/validate`, {
                token: validToken.split(' ')[1],
            })
        })

        it('should return 401 if token is invalid', async () => {
            mockedAxios.post.mockRejectedValueOnce(new Error('Unauthorized'))

            const response = await request(app)
                .post('/lobby/create')
                .set('Authorization', 'Bearer invalidToken')
                .send({ name: 'Test Lobby', maxPlayers: 4 })

            expect(response.status).toBe(401)
            expect(response.body).toHaveProperty('error', 'Unauthorized')
            expect(mockedAxios.post).toHaveBeenCalled()
        })
    })

    describe('POST /lobby/join', () => {
        it('should allow a user to join a lobby with valid token', async () => {
            mockedAxios.post.mockResolvedValueOnce({ data: user })

            const response = await request(app)
                .post('/lobby/join')
                .set('Authorization', validToken)
                .send({ lobbyId: 'testLobby123' })

            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('message', 'Successfully joined the lobby')
            expect(response.body).toHaveProperty('lobby')
            expect(response.body.lobby).toHaveProperty('id', 'testLobby123')
            expect(response.body.lobby.players).toContain(user.id)

            expect(mockedAxios.post).toHaveBeenCalledWith(`${authServiceUrl}/validate`, {
                token: validToken.split(' ')[1],
            })
        })
    })

    describe('POST /lobby/start', () => {
        it('should start the lobby if the user is the host', async () => {
            mockedAxios.post.mockResolvedValueOnce({ data: user })

            const response = await request(app)
                .post('/lobby/start')
                .set('Authorization', validToken)
                .send({ lobbyId: 'testLobby123' })

            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('message', 'Lobby started')
            expect(response.body).toHaveProperty('lobby')
            expect(response.body.lobby).toHaveProperty('status', 'active')

            expect(mockedAxios.post).toHaveBeenCalledWith(`${authServiceUrl}/validate`, {
                token: validToken.split(' ')[1],
            })
        })

        it('should return 403 if user is not the host', async () => {
            mockedAxios.post.mockResolvedValueOnce({ data: user })

            const response = await request(app)
                .post('/lobby/start')
                .set('Authorization', validToken)
                .send({ lobbyId: 'testLobby123' })

            expect(response.status).toBe(403)
            expect(response.body).toHaveProperty('error', 'Only the host can start the lobby')
        })
    })

    describe('Error Handling', () => {
        it('should handle errors gracefully when Auth Service fails', async () => {
            mockedAxios.post.mockRejectedValueOnce(new Error('Auth Service error'))

            const response = await request(app)
                .post('/lobby/create')
                .set('Authorization', validToken)
                .send({ name: 'Test Lobby', maxPlayers: 4 })

            expect(response.status).toBe(500)
            expect(response.body).toHaveProperty('error', 'Internal Server Error')

            expect(mockedAxios.post).toHaveBeenCalledWith(`${authServiceUrl}/validate`, {
                token: validToken.split(' ')[1],
            })
        })
    })
})
