import {
    LobbyFullError,
    LobbyNotFoundError,
    MatchAlreadyInProgressError,
    NotEnoughPlayersError,
    PlayerNotFoundError,
    PlayersNotReadyError,
    UnauthorizedError,
    UserAlreadyJoined,
} from '../src/errors/LobbyErrors';
import { GenericErrorMiddleware, LobbyErrorMiddleware } from '../src/middlewares/ErrorsMiddleware';
import { NextFunction, Request, Response } from 'express';
import { mock, mockReset } from 'jest-mock-extended';

const mockRequest = mock<Request>()
const mockResponse = mock<Response>()
const mockNext = mock<NextFunction>()

beforeEach(() => {
    mockReset(mockRequest)
    mockReset(mockResponse)
    mockReset(mockNext)
    mockResponse.status.mockReturnThis()
    mockResponse.json.mockReturnThis()
})

describe('Error Middleware Tests', () => {
    describe('LobbyErrorMiddleware', () => {
        it('should handle LobbyNotFoundError with 404', () => {
            const error = new LobbyNotFoundError('testId')

            LobbyErrorMiddleware(error, mockRequest, mockResponse, mockNext)

            expect(mockResponse.status).toHaveBeenCalledWith(404)
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Lobby Not Found',
                message: error.message,
            })
        })

        it('should handle LobbyFullError with 400', () => {
            const error = new LobbyFullError()

            LobbyErrorMiddleware(error, mockRequest, mockResponse, mockNext)

            expect(mockResponse.status).toHaveBeenCalledWith(400)
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Lobby Full',
                message: error.message,
            })
        })

        it('should handle PlayerNotFoundError with 404', () => {
            const error = new PlayerNotFoundError()

            LobbyErrorMiddleware(error, mockRequest, mockResponse, mockNext)

            expect(mockResponse.status).toHaveBeenCalledWith(404)
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Player Not Found',
                message: error.message,
            })
        })

        it('should handle PlayersNotReadyError with 400', () => {
            const error = new PlayersNotReadyError()

            LobbyErrorMiddleware(error, mockRequest, mockResponse, mockNext)

            expect(mockResponse.status).toHaveBeenCalledWith(400)
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Players Not Ready',
                message: error.message,
            })
        })

        it('should handle NotEnoughPlayersError with 400', () => {
            const error = new NotEnoughPlayersError()

            LobbyErrorMiddleware(error, mockRequest, mockResponse, mockNext)

            expect(mockResponse.status).toHaveBeenCalledWith(400)
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Not Enough Players',
                message: error.message,
            })
        })

        it('should handle UnauthorizedError with 403', () => {
            const error = new UnauthorizedError()

            LobbyErrorMiddleware(error, mockRequest, mockResponse, mockNext)

            expect(mockResponse.status).toHaveBeenCalledWith(403)
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Unauthorized',
                message: error.message,
            })
        })

        it('should handle MatchAlreadyInProgressError with 400', () => {
            const error = new MatchAlreadyInProgressError()

            LobbyErrorMiddleware(error, mockRequest, mockResponse, mockNext)

            expect(mockResponse.status).toHaveBeenCalledWith(400)
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Match Already In Progress',
                message: error.message,
            })
        })
        it('should handle players already joined error with 400', () => {
            const error = new UserAlreadyJoined();

            LobbyErrorMiddleware(error, mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'User Already Joined',
                message: error.message,
            })
        })
    })

    describe('GenericErrorMiddleware', () => {
        it('should handle unhandled errors with 500', () => {
            const error = new Error('Test generic error')

            GenericErrorMiddleware(error, mockRequest, mockResponse, mockNext)

            expect(mockResponse.status).toHaveBeenCalledWith(500)
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Internal Server Error',
                message: 'An unexpected error occurred.',
            })
        })
    })
})
