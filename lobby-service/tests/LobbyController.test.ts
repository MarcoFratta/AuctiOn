import { LobbyController } from '../src/controllers/LobbyController'
import { LobbyService } from '../src/services/LobbyService'
import { NextFunction, Request, Response } from 'express'
import { mock, mockReset } from 'jest-mock-extended'
import { Lobby } from '../src/schemas/Lobby'

// Mocking LobbyService
const mockLobbyService = mock<LobbyService>()
const lobbyController = new LobbyController(mockLobbyService)

// Mocking Express request, response, and next function
const mockRequest = mock<Request>()
const mockResponse = mock<Response>()
const mockNext = mock<NextFunction>((err) => {
    console.log(err)
})

beforeEach(() => {
    mockReset(mockLobbyService)
    mockReset(mockRequest)
    mockReset(mockResponse)
    mockReset(mockNext)

})

describe('LobbyController', () => {
    describe('createLobby', () => {
        it('should create a lobby and return 201 status with the created lobby', async () => {
            const lobbyData = { creator: 'creatorId', players: [], maxPlayers: 10, rounds: 5 }
            const createdLobby: Lobby = { ...lobbyData, id: '123456789012345678901234', status: 'waiting' }

            mockRequest.body = lobbyData
            mockLobbyService.createLobby.mockResolvedValue(createdLobby)
            mockResponse.status.mockReturnThis()
            mockResponse.json.mockReturnThis()

            await lobbyController.createLobby(mockRequest, mockResponse, mockNext)

            expect(mockLobbyService.createLobby).toHaveBeenCalledWith(lobbyData)
            expect(mockResponse.status).toHaveBeenCalledWith(201)
            expect(mockResponse.json).toHaveBeenCalledWith(createdLobby)
        })
    })

    describe('joinLobby', () => {
        it('should allow a user to join a lobby and return the updated lobby', async () => {
            const id = '123456789012345678901234'
            const userId = 'userId'
            const updatedLobby: Lobby = {
                id: id,
                creator: 'creatorId',
                players: [{ userId: userId, status: 'waiting' }],
                maxPlayers: 10, rounds: 5, status: 'waiting',
            }

            mockRequest.params = { id }
            mockRequest.body = { userId }
            mockLobbyService.joinLobby.mockResolvedValue(updatedLobby)
            mockResponse.status.mockReturnThis()
            mockResponse.json.mockReturnThis()
            await lobbyController.joinLobby(mockRequest, mockResponse, mockNext)

            expect(mockLobbyService.joinLobby).toHaveBeenCalledWith(id, userId)
            expect(mockResponse.status).toHaveBeenCalledWith(200)
            expect(mockResponse.json).toHaveBeenCalledWith(updatedLobby)
        })
    })

    describe('leaveLobby', () => {
        it('should allow a user to leave a lobby and return the updated lobby', async () => {
            const id = '123456789012345678901234'
            const userId = 'userId'
            const updatedLobby: Lobby = {
                id,
                creator: 'creatorId', players: [],
                maxPlayers: 10, rounds: 5, status: 'waiting',
            }

            mockRequest.params = { id }
            mockRequest.body = { userId }
            mockLobbyService.leaveLobby.mockResolvedValue(updatedLobby)
            mockResponse.status.mockReturnThis()
            mockResponse.json.mockReturnThis()

            await lobbyController.leaveLobby(mockRequest, mockResponse, mockNext)

            expect(mockLobbyService.leaveLobby).toHaveBeenCalledWith(id, userId)
            expect(mockResponse.status).toHaveBeenCalledWith(200)
            expect(mockResponse.json).toHaveBeenCalledWith(updatedLobby)
        })
    })

    describe('kickPlayer', () => {
        it('should allow a creator to kick a player and return the updated lobby', async () => {
            const id = '123456789012345678901234'
            const creator = 'creatorId'
            const playerId = 'playerId'
            const updatedLobby: Lobby = {
                id,
                creator, players: [], maxPlayers: 10, rounds: 5, status: 'waiting',
            }

            mockRequest.params = { id }
            mockRequest.body = { creator, playerId }
            mockLobbyService.kickPlayer.mockResolvedValue(updatedLobby)
            mockResponse.status.mockReturnThis()
            mockResponse.json.mockReturnThis()

            await lobbyController.kickPlayer(mockRequest, mockResponse, mockNext)

            expect(mockLobbyService.kickPlayer).toHaveBeenCalledWith(id, creator, playerId)
            expect(mockResponse.status).toHaveBeenCalledWith(200)
            expect(mockResponse.json).toHaveBeenCalledWith(updatedLobby)
        })
    })

    describe('setStatus', () => {
        it('should set a player\'s status and return the updated lobby', async () => {
            const id = '123456789012345678901234'
            const userId = 'userId'
            const status = 'ready'
            const updatedLobby: Lobby = {
                id,
                creator: 'creatorId', players: [{ userId, status }],
                maxPlayers: 10, rounds: 5, status: 'waiting',
            }

            mockRequest.params = { id }
            mockRequest.body = { userId, status }
            mockLobbyService.setStatus.mockResolvedValue(updatedLobby)
            mockResponse.status.mockReturnThis()
            mockResponse.json.mockReturnThis()

            await lobbyController.setStatus(mockRequest, mockResponse, mockNext)

            expect(mockLobbyService.setStatus).toHaveBeenCalledWith(id, userId, status)
            expect(mockResponse.status).toHaveBeenCalledWith(200)
            expect(mockResponse.json).toHaveBeenCalledWith(updatedLobby)
        })
    })

    describe('startMatch', () => {
        it('should start a match and return the updated lobby', async () => {
            const id = '123456789012345678901234'
            const creator = 'creatorId'
            const updatedLobby: Lobby = {
                id,
                creator, players: [],
                maxPlayers: 10, rounds: 5, status: 'in-progress',
            }

            mockRequest.params = { id }
            mockRequest.body = { creator }
            mockLobbyService.startMatch.mockResolvedValue(updatedLobby)
            mockResponse.status.mockReturnThis()
            mockResponse.json.mockReturnThis()

            await lobbyController.startMatch(mockRequest, mockResponse, mockNext)

            expect(mockLobbyService.startMatch).toHaveBeenCalledWith(id, creator)
            expect(mockResponse.status).toHaveBeenCalledWith(200)
            expect(mockResponse.json).toHaveBeenCalledWith(updatedLobby)
        })
    })
})
