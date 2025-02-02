import { AuthenticatedRequest, AuthMiddleware } from '../src/middlewares/AuthMiddleware'
import axios from 'axios'
import { Request, Response } from 'express'
import { jest } from '@jest/globals'
import { config } from '../src/configs/Config'
import { mock, MockProxy, mockReset } from 'jest-mock-extended'
import { UserNotAuthenticatedError } from '../src/errors/LobbyErrors'

jest.mock('axios')
const mockAxios = axios as jest.Mocked<typeof axios>

const AUTH_SERVICE_URL = config.services['auth'].url + '/auth'

describe('AuthMiddleware', () => {
  let mockRequest: MockProxy<AuthenticatedRequest>
  let mockResponse: MockProxy<Response>
  let mockNext: jest.Mock

  beforeEach(() => {
    mockRequest = mock<AuthenticatedRequest>()
    mockResponse = mock<Response>()
    mockNext = jest.fn()

    // Reset mocks
    mockReset(mockRequest)
    mockReset(mockResponse)
    mockReset(mockNext)

    // Setup default behavior for response methods
    mockResponse.status.mockReturnThis()
    mockResponse.json.mockReturnThis()
  })

  it('should return unauthorized error if no token is provided', async () => {
    mockRequest.headers = { authorization: undefined }

    await AuthMiddleware(mockRequest as Request, mockResponse as Response, mockNext)

    expect(mockNext).toHaveBeenCalledWith(new UserNotAuthenticatedError())
  })

  it('should return unauthorized if token validation fails', async () => {
    mockRequest.headers = { authorization: 'Bearer invalidToken' }
    mockAxios.post.mockRejectedValue(new UserNotAuthenticatedError())

    await AuthMiddleware(mockRequest as Request, mockResponse as Response, mockNext)

    expect(mockNext).toHaveBeenCalledWith(new UserNotAuthenticatedError())
  })

  it('should call next and attach user info if token is valid', async () => {
    const mockUser = {
      id: '123',
      name: 'Test User',
      email: 'test.com',
    }

    mockRequest.headers = { authorization: 'Bearer validToken' }
    mockAxios.post.mockResolvedValue({ data: { user: mockUser } })


    await AuthMiddleware(mockRequest as Request, mockResponse as Response, mockNext)

    expect(mockAxios.post).toHaveBeenCalledWith(AUTH_SERVICE_URL + '/validate', {
      token: 'validToken',
    })
    expect(mockRequest.user).toEqual(mockUser)
    expect(mockNext).toHaveBeenCalled()
  })

  it('should return unauthorized if there is an error during authentication', async () => {
    mockRequest.headers = { authorization: 'Bearer validToken' }
    mockAxios.post.mockResolvedValue({ data: null })

    await AuthMiddleware(mockRequest as Request, mockResponse as Response, mockNext)

    expect(mockNext).toHaveBeenCalledWith(new UserNotAuthenticatedError())
  })
})
