import request from 'supertest'
import axios from 'axios'

import * as console from 'node:console'
import {config} from '../src/configs/config'
import app from '../src/App'

// Mock Axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>
const userServiceUrl = 'http://test/users'
config.userServiceUrl = userServiceUrl

describe('Auth Service Integration Tests with Axios Mock', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('POST /auth/register', () => {
        it('should register a user and return a token', async () => {
            // Mock User Service response for registration
            const user = {
                id: 'test-user-id',
                email: 'test@example.com',
                name: 'Test User',
            }
            mockedAxios.get.mockResolvedValueOnce({data: null})
            mockedAxios.post.mockResolvedValue({
                data: {
                    pHash: 'mocked-hashed-password',
                    ...user,
                },
            })
            // Mock User Service response for login
            // Perform the request
            const response = await request(app).post('/auth/register').send({
                email: 'test@example.com',
                name: 'Test User',
                password: 'Password1',
            })

            console.log(response.body)
            // Assert the response
            expect(response.status).toBe(201)

            // Assert that response.body is an object containing 'message' and 'token'
            expect(response.body).toHaveProperty('message')
            expect(response.body).toHaveProperty('token')
            // Assert that message is a string
            expect(typeof response.body.message).toBe('string')
            // Assert that token is a non-empty string
            expect(typeof response.body.token.token).toBe('string')
            expect(response.body.token.token).not.toBe('')

            // Ensure Axios calls were made with correct parameters
            expect(mockedAxios.get).toHaveBeenCalledWith(
                userServiceUrl + '?email=test@example.com'
            )
        })
    })

    describe('POST /auth/login', () => {
        it('should log in a user and return a token', async () => {
            // Mock User Service response for user fetch
            mockedAxios.get.mockResolvedValueOnce({
                data: {
                    id: 'test-user-id',
                    email: 'test@example.com',
                    name: 'Test User',
                    pHash: '$2b$10$6eF40k8AeXLXZBCottZduedBCpBR3BOeCcVJPUuwYbh9p5UszZU/W',
                },
            })

            const response = await request(app).post('/auth/login').send({
                email: 'test@example.com',
                password: 'Password1',
            })

            expect(response.body).toHaveProperty('token')
            // Assert that message is a string
            expect(typeof response.body.token).toBe('string')
            expect(response.body.token).not.toBe('')

            expect(mockedAxios.get).toHaveBeenCalledWith(
                userServiceUrl + '?email=test@example.com'
            )
            console.log(response.body)
        })
    })

    describe('POST /auth/validate', () => {
        it('should validate a token successfully', async () => {
            // Mock User Service response for token validation
            const user = {
                id: 'test-user-id',
                email: 'test@example.com',
                name: 'Test User',
            }
            mockedAxios.get.mockResolvedValueOnce({data: null})
            mockedAxios.post.mockResolvedValue({
                data: {
                    pHash: 'mocked-hashed-password',
                    ...user,
                },
            })
            // Mock User Service response for login
            // Perform the request
            const response = await request(app).post('/auth/register').send({
                email: 'test@example.com',
                name: 'Test User',
                password: 'Password1',
            })
            console.log(response.body)

            const res = await request(app).post('/auth/validate').send({
                token: response.body.token.token,
            })
            expect(res.status).toBe(200)
            expect(res.body).toEqual(user)
        })
    })

    describe('Error Handling', () => {
        it('should handle errors from the User Service gracefully', async () => {
            // Mock User Service failure
            mockedAxios.post.mockRejectedValueOnce(
                new Error('User Service error')
            )

            const response = await request(app).post('/auth/register').send({
                email: 'test@example.com',
                name: 'Test User',
                password: 'Password1',
            })

            expect(response.status).toBe(500)
            expect(response.body).toHaveProperty(
                'error',
                'Internal Server Error'
            )

            expect(mockedAxios.get).toHaveBeenCalledWith(
                userServiceUrl + '?email=test@example.com'
            )
        })
    })
})
