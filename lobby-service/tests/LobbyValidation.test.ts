import { Lobby, lobbySchema } from '../src/schemas/Lobby'
import { validateSchema, ValidationError } from '../src/utils/Validator'

describe('Lobby Schema Validation', () => {
    test('should validate a correct lobby', () => {
        const validLobby: Lobby = {
            id: 'lobby1',
            creator: 'user1',
            players: [
                { userId: 'player1', status: 'waiting' },
                { userId: 'player2', status: 'ready' },
            ],
            maxPlayers: 5,
            rounds: 3,
            status: 'waiting',
        }

        expect(() => validateSchema(lobbySchema, validLobby)).not.toThrow()
    })

    test('should throw error for missing required fields', () => {
        const invalidLobby = {
            creator: 'user1',
        }

        expect(() => validateSchema(lobbySchema, invalidLobby)).toThrow(ValidationError)
    })

    test('should throw error for invalid maxPlayers value', () => {
        const invalidLobby = {
            id: 'lobby1',
            creator: 'user1',
            players: [],
            maxPlayers: 0,
            rounds: 3,
            status: 'waiting',
        }

        expect(() => validateSchema(lobbySchema, invalidLobby)).toThrow(ValidationError)
    })

    test('should throw error for invalid rounds value', () => {
        const invalidLobby = {
            id: 'lobby1',
            creator: 'user1',
            players: [],
            maxPlayers: 5,
            rounds: 0,
            status: 'waiting',
        }

        expect(() => validateSchema(lobbySchema, invalidLobby)).toThrow(ValidationError)
    })

    test('should throw error for invalid player status', () => {
        const invalidLobby = {
            id: 'lobby1',
            creator: 'user1',
            players: [
                { userId: 'player1', status: 'invalid-status' },
            ],
            maxPlayers: 5,
            rounds: 3,
            status: 'waiting',
        }

        expect(() => validateSchema(lobbySchema, invalidLobby)).toThrow(ValidationError)
    })

    test('should throw error for invalid status field', () => {
        const invalidLobby = {
            id: 'lobby1',
            creator: 'user1',
            players: [],
            maxPlayers: 5,
            rounds: 3,
            status: 'invalid-status',
        }

        expect(() => validateSchema(lobbySchema, invalidLobby)).toThrow(ValidationError)
    })

    test('should throw error for players field not being an array', () => {
        const invalidLobby = {
            id: 'lobby1',
            creator: 'user1',
            players: 'not-an-array',
            maxPlayers: 5,
            rounds: 3,
            status: 'waiting',
        }

        expect(() => validateSchema(lobbySchema, invalidLobby)).toThrow(ValidationError)
    })

    test('should throw error for missing player fields', () => {
        const invalidLobby = {
            id: 'lobby1',
            creator: 'user1',
            players: [{ userId: 'player1' }, { status: 'waiting' }],
            maxPlayers: 5,
            rounds: 3,
            status: 'waiting',
        }

        expect(() =>
            validateSchema(lobbySchema, invalidLobby)).toThrow(ValidationError)
    })
    test('should throw error for invalid player status', () => {
        const invalidLobby = {
            id: 'lobby1',
            creator: 'user1',
            players: [
                { userId: 'player1', status: 'invalid-status' },
            ],
            maxPlayers: 5,
            rounds: 3,
            status: 'waiting',
        }

        expect(() => validateSchema(lobbySchema, invalidLobby)).toThrow(ValidationError)
    })
})
