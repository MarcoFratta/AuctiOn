// lobbyServiceErrorHandling.test.ts
import { LobbyService } from '../src/services/LobbyService'
import { Lobby } from '../src/schemas/Lobby'
import { MongoLobbyRepo } from '../src/repositories/MongoLobbyRepo'

jest.mock('../src/repositories/MongoLobbyRepo')

const mockLobbyRepository = new MongoLobbyRepo() as jest.Mocked<MongoLobbyRepo>
const lobbyService = new LobbyService(mockLobbyRepository)

describe('LobbyService Error Handling', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('should throw error when lobby not found for deletion', async () => {
        mockLobbyRepository.delete.mockResolvedValue(false)

        await expect(lobbyService.deleteLobby('invalid-id'))
            .rejects.toThrow('Lobby not found')
    })

    test('should throw error when joining a non-existent lobby', async () => {
        mockLobbyRepository.findById.mockResolvedValue(null)

        await expect(lobbyService.joinLobby('invalid-id', 'user1'))
            .rejects.toThrow('Lobby not found')
    })

    test('should throw error when joining a full lobby', async () => {
        const fullLobby: Lobby = {
            id: '1',
            rounds: 2,
            creator: 'user1',
            players: [{ userId: 'user2', status: 'waiting' }, { userId: 'user3', status: 'waiting' }],
            maxPlayers: 2,
            status: 'waiting',
        }

        mockLobbyRepository.findById.mockResolvedValue(fullLobby)

        await expect(lobbyService.joinLobby('1', 'user4'))
            .rejects.toThrow('Lobby is full')
    })

    test('should throw error when leaving a lobby the user is not part of', async () => {
        const lobby: Lobby = {
            id: '1',
            rounds: 2,
            creator: 'user1',
            players: [{ userId: 'user2', status: 'waiting' }],
            maxPlayers: 4,
            status: 'waiting',
        }

        mockLobbyRepository.findById.mockResolvedValue(lobby)

        await expect(lobbyService.leaveLobby('1', 'user3'))
            .rejects.toThrow('Player not found in lobby')
    })

    test('should throw error when setting status for a non-existent player', async () => {
        const lobby: Lobby = {
            id: '1',
            rounds: 2,
            creator: 'user1',
            players: [{ userId: 'user2', status: 'waiting' }],
            maxPlayers: 4,
            status: 'waiting',
        }

        mockLobbyRepository.findById.mockResolvedValue(lobby)

        await expect(lobbyService.setStatus('1', 'user3', 'ready'))
            .rejects.toThrow('Player not found in lobby')
    })

    test('should throw error when kicking a player without proper authorization', async () => {
        const lobby: Lobby = {
            id: '1',
            rounds: 2,
            creator: 'user1',
            players: [{ userId: 'user2', status: 'waiting' }],
            maxPlayers: 4,
            status: 'waiting',
        }

        mockLobbyRepository.findById.mockResolvedValue(lobby)

        await expect(lobbyService.kickPlayer('1', 'user3', 'user2'))
            .rejects.toThrow('Only the lobby creator can kick players')
    })

    test('should throw error when starting match with insufficient players', async () => {
        const lobby: Lobby = {
            id: '1',
            rounds: 2,
            creator: 'user1',
            players: [{ userId: 'user1', status: 'ready' }],
            maxPlayers: 4,
            status: 'waiting',
        }

        mockLobbyRepository.findById.mockResolvedValue(lobby)

        await expect(lobbyService.startMatch('1', 'user1'))
            .rejects.toThrow('Not enough players to start the match')
    })

    test('should throw error when starting a match with unready players', async () => {
        const lobby: Lobby = {
            id: '1',
            rounds: 2,
            creator: 'user1',
            players: [
                { userId: 'user1', status: 'ready' },
                { userId: 'user2', status: 'waiting' },
            ],
            maxPlayers: 4,
            status: 'waiting',
        }

        mockLobbyRepository.findById.mockResolvedValue(lobby)

        await expect(lobbyService.startMatch('1', 'user1'))
            .rejects.toThrow('All players must be ready to start the match')
    })

    test('should throw error when starting a match already in progress', async () => {
        const lobby: Lobby = {
            id: '1',
            rounds: 2,
            creator: 'user1',
            players: [
                { userId: 'user1', status: 'ready' },
                { userId: 'user2', status: 'ready' },
            ],
            maxPlayers: 4,
            status: 'in-progress',
        }

        mockLobbyRepository.findById.mockResolvedValue(lobby)

        await expect(lobbyService.startMatch('1', 'user1'))
            .rejects.toThrow('Match already in progress')
    })
})
