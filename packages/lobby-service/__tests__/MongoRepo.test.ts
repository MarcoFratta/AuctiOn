// MongoLobbyRepo.test.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { MongoLobbyRepo } from '../src/repositories/MongoLobbyRepo';
import { LobbyModel } from '../src/models/LobbyModel';
import { Lobby } from '../src/schemas/Lobby';

let mongoServer: MongoMemoryServer;
let repo: MongoLobbyRepo

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri(), { dbName: 'test' })
    repo = new MongoLobbyRepo()
})

afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
})

describe('MongoLobbyRepo', () => {
    beforeEach(async () => {
        await LobbyModel.deleteMany({})
    })

    test('should create a lobby', async () => {
        const lobbyData: Omit<Lobby, 'id'> = {
            creator: 'creator1',
            players: [],
            maxPlayers: 4,
            rounds: 5,
            status: 'waiting',
        }

        const createdLobby = await repo.create(lobbyData)

        expect(createdLobby).toEqual(expect.objectContaining(lobbyData))
        const foundLobby = await repo.findById(createdLobby.id)
        expect(foundLobby).not.toBeNull()
    })

    test('should delete a lobby by ID', async () => {
        const lobby = new LobbyModel({
            id: 'lobby-to-delete',
            creator: 'creator2',
            players: [],
            maxPlayers: 4,
            rounds: 5,
            status: 'waiting',
        })
        await lobby.save()

        const result = await repo.delete(lobby.id)
        expect(result).toBe(true)

        const deletedLobby = await LobbyModel.findById(lobby.id)
        expect(deletedLobby).toBeNull()
    })

    test('should throw error when deleting a lobby with invalid id', async () => {
        const result = repo.delete('non-existent-id')
        await expect(result).rejects.toThrow()
    })

    test('should return false when deleting a non existent lobby', async () => {
        const result = await repo.delete('123456789012345678901234')
        expect(result).toBe(false)
    })

    test('should find a lobby by ID', async () => {
        const lobby = new LobbyModel({
            id: 'lobby-to-find',
            creator: 'creator3',
            players: [],
            maxPlayers: 4,
            rounds: 5,
            status: 'waiting',
        })
        await lobby.save()

        const foundLobby = await repo.findById(lobby.id)
        expect(foundLobby).not.toBeNull()
        expect(foundLobby?.id).toBe(lobby.id)
    })

    test('should return null for a non-existent lobby', async () => {
        const foundLobby = await repo.findById('123456789012345678901234')
        expect(foundLobby).toBeNull()
    })

    test('should update a lobby by ID', async () => {
        const lobby = new LobbyModel({
            id: 'lobby-to-update',
            creator: 'creator4',
            players: [],
            maxPlayers: 4,
            rounds: 5,
            status: 'waiting',
        })
        await lobby.save()

        const updateData: Partial<Lobby> = {
            maxPlayers: 6,
            status: 'in-progress',
        }
        const updatedLobby = await repo.update(lobby.id, updateData)

        expect(updatedLobby).not.toBeNull()
        expect(updatedLobby?.maxPlayers).toBe(6)
        expect(updatedLobby?.status).toBe('in-progress')
    })

    test('should return null when updating a non-existent lobby', async () => {
        const updatedLobby = await repo.update('123456789012345678901234', {
            maxPlayers: 6,
        })
        expect(updatedLobby).toBeNull()
    })
})
