// MongoLobbyRepo.test.ts
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { MongoLobbyRepo } from '../src/repositories/MongoLobbyRepo'
import { LobbyModel } from '../src/models/LobbyModel'
import { Lobby } from '../src/schemas/Lobby'
import { LobbyNotFoundError } from '../src/errors/LobbyErrors'

let mongoServer: MongoMemoryServer;
let repo: MongoLobbyRepo
jest.setTimeout(60000)
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri(), { dbName: 'test' })
    repo = new MongoLobbyRepo()
}, 90000)

afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
}, 90000)

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
          bidTime: 10,
          startAmount: 100,
          startInventory: { items: [{ item: 'triangle', quantity: 1 }] },
        }

        const createdLobby = await repo.create(lobbyData)

        expect(createdLobby).toEqual(expect.objectContaining(lobbyData))
        const foundLobby = await repo.findById(createdLobby.id)
        expect(foundLobby).not.toBeNull()
    })

    test('should delete a lobby by ID', async () => {
        const lobby = await LobbyModel.create({
            creator: 'creator2',
            players: [],
            maxPlayers: 4,
            rounds: 5,
            status: 'waiting',
          bidTime: 10,
          startAmount: 100,
          startInventory: { items: [{ item: 'triangle', quantity: 1 }] },
        });

        const result = await repo.delete(lobby.id);

        expect(result).toBeTruthy();
        const deletedLobby = await LobbyModel.findById(lobby.id);
        expect(deletedLobby).toBeNull();
    });

    test('should throw when deleting a non existent lobby', async () => {
        const result = repo.delete('123456789012345678901234');
        await expect(result).rejects.toThrow(LobbyNotFoundError);
    });

    test('should throw error when deleting a lobby with invalid id', async () => {
        await expect(repo.delete('invalid-id')).rejects.toThrow();
    });

    test('should find a lobby by ID', async () => {
        const lobby = new LobbyModel({
            id: 'lobby-to-find',
            creator: 'creator3',
            players: [],
            maxPlayers: 4,
            rounds: 5,
            status: 'waiting',
          bidTime: 10,
          startAmount: 100,
          startInventory: { items: [{ item: 'triangle', quantity: 1 }] },
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
          bidTime: 10,
          startAmount: 100,
          startInventory: { items: [{ item: 'triangle', quantity: 1 }] },
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
