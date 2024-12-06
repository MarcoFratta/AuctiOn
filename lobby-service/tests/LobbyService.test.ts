// lobbyService.test.ts
import { LobbyService } from '../src/services/LobbyService'
import { Lobby } from '../src/schemas/Lobby'
import { MongoLobbyRepo } from '../src/repositories/MongoLobbyRepo'

jest.mock('../src/repositories/MongoLobbyRepo')

const mockLobbyRepository = new MongoLobbyRepo() as jest.Mocked<MongoLobbyRepo>
const lobbyService = new LobbyService(mockLobbyRepository)

describe('LobbyService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('should create a lobby successfully', async () => {
        const lobbyData: Lobby = {
            id: '1',
            rounds: 4,
            creator: 'user1',
            players: [],
            maxPlayers: 4,
            status: 'waiting',
        }

        mockLobbyRepository.create.mockResolvedValue(lobbyData)

        const result = await lobbyService.createLobby(lobbyData)

        expect(result).toEqual(lobbyData)
        expect(mockLobbyRepository.create).toHaveBeenCalledWith(lobbyData)
    })

    test('should delete a lobby successfully', async () => {
        mockLobbyRepository.delete.mockResolvedValue(true)

        await expect(lobbyService.deleteLobby('1')).resolves.toBe(true)
        expect(mockLobbyRepository.delete).toHaveBeenCalledWith('1')
    })

    test('should join a lobby successfully', async () => {
        const lobby: Lobby = {
            id: '1',
            rounds: 4,
            creator: 'user1',
            players: [],
            maxPlayers: 4,
            status: 'waiting',
        }

        mockLobbyRepository.findById.mockResolvedValue(lobby)
        mockLobbyRepository.update.mockResolvedValue({
            ...lobby,
            players: [{ userId: 'user2', status: 'waiting' }],
        })

        const result = await lobbyService.joinLobby('1', 'user2')

        expect(result.players).toHaveLength(1)
        expect(result.players[0].userId).toBe('user2')
        expect(mockLobbyRepository.update).toHaveBeenCalled()
    })

    test('should leave a lobby successfully', async () => {
        const lobby: Lobby = {
            id: '1',
            rounds: 4,
            creator: 'user1',
            players: [{ userId: 'user2', status: 'waiting' }],
            maxPlayers: 4,
            status: 'waiting',
        }

        mockLobbyRepository.findById.mockResolvedValue(lobby)
        mockLobbyRepository.update.mockResolvedValue({
            ...lobby,
            players: [],
        })

        const result = await lobbyService.leaveLobby('1', 'user2')

        expect(result!.players).toHaveLength(0)
        expect(mockLobbyRepository.update).toHaveBeenCalled()
    })

    test('should start a match successfully', async () => {
        const lobby: Lobby = {
            id: '1',
            rounds: 4,
            creator: 'user1',
            players: [
                { userId: 'user1', status: 'ready' },
                { userId: 'user2', status: 'ready' },
            ],
            maxPlayers: 4,
            status: 'waiting',
        }

        mockLobbyRepository.findById.mockResolvedValue(lobby)
        mockLobbyRepository.update.mockResolvedValue({
            ...lobby,
            status: 'in-progress',
        })

        const result = await lobbyService.startMatch('1', 'user1')

        expect(result!.status).toBe('in-progress')
        expect(mockLobbyRepository.update).toHaveBeenCalled()
    })
    test('should set player status successfully', async () => {
        const lobby: Lobby = {
            id: '1',
            rounds: 3,
            creator: 'user1',
            players: [{ userId: 'user2', status: 'waiting' }],
            maxPlayers: 4,
            status: 'waiting',
        }

        mockLobbyRepository.findById.mockResolvedValue(lobby)
        mockLobbyRepository.update.mockResolvedValue({
            ...lobby,
            players: [{ userId: 'user2', status: 'ready' }],
        })

        const result = await lobbyService.setStatus('1', 'user2', 'ready')

        expect(result!.players[0].status).toBe('ready')
        expect(mockLobbyRepository.update).toHaveBeenCalled()
    })

    test('should kick a player successfully', async () => {
        const lobby: Lobby = {
            id: '1',
            rounds: 4,
            creator: 'user1',
            players: [
                { userId: 'user2', status: 'waiting' },
                { userId: 'user3', status: 'waiting' },
            ],
            maxPlayers: 4,
            status: 'waiting',
        }

        mockLobbyRepository.findById.mockResolvedValue(lobby)
        mockLobbyRepository.update.mockResolvedValue({
            ...lobby,
            players: [{ userId: 'user3', status: 'waiting' }],
        })

        const result = await lobbyService.kickPlayer('1', 'user1', 'user2')

        expect(result!.players).toHaveLength(1)
        expect(result!.players[0].userId).toBe('user3')
        expect(mockLobbyRepository.update).toHaveBeenCalled()
    })

})
