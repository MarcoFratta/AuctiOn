import express from 'express'
import request from 'supertest'
import { createUserRouter } from '../src/routes/UserRoutes'
import { UserController } from '../src/controllers/UserController'

jest.mock('../src/controllers/UserController') // Mock the UserController

describe('UserRoutes', () => {
    let app: express.Application
    let controllerMock: jest.Mocked<UserController>

    beforeEach(() => {
        app = express()
        app.use(express.json())

        // Mock UserController
        controllerMock = new UserController(
            {} as never
        ) as jest.Mocked<UserController>

        // Mock methods
        controllerMock.getUsers = jest.fn(async (_req, res, _next) => {
            res.status(200).send('getUsers called')
        })
        controllerMock.getUserById = jest.fn(async (_req, res, _next) => {
            res.status(200).send('getUserById called')
        })
        controllerMock.getUserByEmail = jest.fn(async (_req, res, _next) => {
            res.status(200).send('getUserByEmail called')
        })
        controllerMock.createUser = jest.fn(async (_req, res, _next) => {
            res.status(201).send('createUser called')
        })
        controllerMock.updateUser = jest.fn(async (_req, res, _next) => {
            res.status(200).send('updateUser called')
        })
        controllerMock.deleteUser = jest.fn(async (_req, res, _next) => {
            res.status(200).send('deleteUser called')
        })

        // Add routes
        app.use('/users', createUserRouter(controllerMock))
    })
    afterAll(() => {
        jest.clearAllMocks()
    })

    it('should call getUsers on GET /users', async () => {
        const response = await request(app).get('/users')
        expect(response.status).toBe(200)
        expect(response.text).toBe('getUsers called')
        expect(controllerMock.getUsers).toHaveBeenCalled()
    })

    it('should call getUserById on GET /users/:id', async () => {
        const response = await request(app).get(
            '/users/123456789012345678901234'
        )
        expect(response.status).toBe(200)
        expect(response.text).toBe('getUserById called')
        expect(controllerMock.getUserById).toHaveBeenCalled()
    })
    it('should call getUserByEmail on GET /users/email/:email', async () => {
        const response = await request(app).get('/users/email/john@doe.com')
        expect(response.status).toBe(200)
        expect(response.text).toBe('getUserByEmail called')
        expect(controllerMock.getUserByEmail).toHaveBeenCalled()
    })

    it('should call createUser on POST /users', async () => {
        const user = { id: '1', name: 'John Doe', email: 'john@example.com' }
        const response = await request(app).post('/users').send(user)
        expect(response.status).toBe(201)
        expect(response.text).toBe('createUser called')
        expect(controllerMock.createUser).toHaveBeenCalledWith(
            expect.any(Object),
            expect.any(Object),
            expect.any(Function)
        )
    })

    it('should call updateUser on PUT /users/:id', async () => {
        const updatedUser = { name: 'Jane Doe', email: 'jane@example.com' }
        const response = await request(app).put('/users/1').send(updatedUser)
        expect(response.status).toBe(200)
        expect(response.text).toBe('updateUser called')
        expect(controllerMock.updateUser).toHaveBeenCalledWith(
            expect.any(Object),
            expect.any(Object),
            expect.any(Function)
        )
    })

    it('should call deleteUser on DELETE /users/:id', async () => {
        const response = await request(app).delete('/users/1')
        expect(response.status).toBe(200)
        expect(response.text).toBe('deleteUser called')
        expect(controllerMock.deleteUser).toHaveBeenCalled()
    })
})
