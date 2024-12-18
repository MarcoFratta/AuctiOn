import { AuthenticatedRequest, AuthMiddleware } from '../src/middlewares/AuthMiddleware'
import { User, userSchema } from '../src/schemas/User'
import { validateSchema } from '../src/utils/Validator'
import axios from 'axios'
import { Request, Response } from 'express'
import { jest } from '@jest/globals'
import { config } from '../src/configs/config'

jest.mock('axios')
const mockAxios = axios as jest.Mocked<typeof axios>

jest.mock('../src/utils/Validator', () => ({
    validateSchema: jest.fn(),
}))
const mockValidateSchema = validateSchema as jest.MockedFunction<
    typeof validateSchema
>

jest.mock('../src/utils/Logger')

const AUTH_SERVICE_URL = config.authServiceUri

describe('AuthMiddleware', () => {
    let req: Partial<AuthenticatedRequest>
    let mockResponse: Partial<Response>
    let mockNext = jest.fn()

    beforeEach(() => {
        req = {}
        mockResponse = {}
        mockResponse.redirect = jest.fn()
        mockNext = jest.fn()
        jest.clearAllMocks()
    })

    it('should redirect to /login if no token is provided', async () => {
        req.headers = { authorization: undefined }

        await AuthMiddleware(req as Request, mockResponse as Response, mockNext)

        expect(mockResponse.redirect).toHaveBeenCalledWith('/login')
        expect(mockNext).not.toHaveBeenCalled()
    })

    it('should redirect to /login if token validation fails', async () => {
        req.headers = { authorization: 'Bearer invalidToken' }
        mockAxios.post.mockRejectedValue(new Error('Invalid token'))

        await AuthMiddleware(req as Request, mockResponse as Response, mockNext)

        expect(mockResponse.redirect).toHaveBeenCalledWith('/login')
        expect(mockNext).not.toHaveBeenCalled()
    })

    it('should call next and attach user info if token is valid', async () => {
        const mockUser: User = {
            id: '123',
            name: 'Test User',
            email: 'test@example.com',
        }

        req.headers = { authorization: 'Bearer validToken' }
        mockAxios.post.mockResolvedValue({
            data: mockUser,
            status: 0,
            statusText: '',
            headers: {},
            config: { url: '' },
        })
        mockValidateSchema.mockReturnValue(mockUser)

        await AuthMiddleware(req as Request, mockResponse as Response, mockNext)

        expect(mockAxios.post).toHaveBeenCalledWith(AUTH_SERVICE_URL, {
            token: 'validToken',
        })
        expect(mockValidateSchema).toHaveBeenCalledWith(userSchema, mockUser)
        expect(req).toHaveProperty('user', mockUser)
        expect(mockNext).toHaveBeenCalled()
    })

    it('should redirect to /login if there is an error during authentication', async () => {
        req.headers = { authorization: 'Bearer validToken' }
        mockAxios.post.mockRejectedValue(new Error('Unexpected error'))

        await AuthMiddleware(req as Request, mockResponse as Response, mockNext)

        expect(mockResponse.redirect).toHaveBeenCalledWith('/login')
        expect(mockNext).not.toHaveBeenCalled()
    })
})
