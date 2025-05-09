import { LobbyServiceImpl } from '../src/services/LobbyServiceImpl'
import { MongoLobbyRepo } from '../src/repositories/MongoLobbyRepo'
import { MongoUserLobbyRepo } from '../src/repositories/MongoUserLobbyRepo'
import { mock, MockProxy } from 'jest-mock-extended'
import { Lobby, lobbySchema } from '../src/schemas/Lobby'
import axios from 'axios'
import { PlayerNotFoundError } from '../src/errors/LobbyErrors'

jest.mock('../src/repositories/MongoLobbyRepo');
jest.mock('../src/repositories/MongoUserLobbyRepo')
jest.mock('axios')

describe('LobbyService', () => {
    let mockLobbyRepo: MockProxy<MongoLobbyRepo>;
    let mockUserLobbyRepo: MockProxy<MongoUserLobbyRepo>
    let lobbyService: LobbyServiceImpl;

    beforeEach(() => {
        mockLobbyRepo = mock<MongoLobbyRepo>();
        mockUserLobbyRepo = mock<MongoUserLobbyRepo>()
        lobbyService = new LobbyServiceImpl(mockLobbyRepo, mockUserLobbyRepo);
    });

    describe('createLobby', () => {
        it('should create a lobby and add creator to it', async () => {
            const lobbyData: Lobby = {
                id: 'lobbyId',
                creator: 'userId',
                maxPlayers: 4,
                rounds: 3,
                players: [{ userId: 'userId', status: 'waiting' }],
                status: lobbySchema.shape.status.enum.waiting!,
                startAmount: 1000,
                startInventory: {
                    items: [{
                        item: 'triangle',
                        quantity: 1,
                    }],
                },
                bidTime: 30,
            };
            const createdLobby = { ...lobbyData }

            mockLobbyRepo.create.mockResolvedValue(createdLobby);
            mockUserLobbyRepo.addUserToLobby.mockResolvedValue({
                userId: 'userId',
                lobbyId: 'lobbyId',
                state: 'waiting',
                joinedAt: new Date(),
                leftAt: undefined,
            });

            const result: Lobby = await lobbyService.createLobby(createdLobby);

            expect(mockLobbyRepo.create).toHaveBeenCalledWith(createdLobby);
            expect(mockUserLobbyRepo.addUserToLobby).toHaveBeenCalledWith('userId', 'lobbyId');
            expect(result).toEqual(createdLobby);
        });
    });

    describe('joinLobby', () => {
        it('should add user to lobby', async () => {
            const lobbyId = 'lobbyId';
            const userId = 'userId';
            const lobby: Lobby = {
                id: 'lobbyId',
                creator: 'userId',
                maxPlayers: 4,
                rounds: 3,
                players: [],
                status: lobbySchema.shape.status.enum.waiting!,
                startAmount: 1000,
                startInventory: {
                    items: [{
                        item: 'triangle',
                        quantity: 1,
                    }],
                },
                bidTime: 30,
            };
            const updatedLobby = {
                ...lobby,
                players: lobby.players.concat({ userId, status: 'waiting' }),
            };

            mockLobbyRepo.findById.mockResolvedValue(lobby);
            mockLobbyRepo.update.mockResolvedValue(updatedLobby);
            mockUserLobbyRepo.addUserToLobby.mockResolvedValue({
                userId: 'userId',
                lobbyId: 'lobbyId',
                state: 'waiting',
                joinedAt: new Date(),
                leftAt: undefined,
            });

            const result = await lobbyService.joinLobby(lobbyId, userId);

            expect(mockLobbyRepo.findById).toHaveBeenCalledWith(lobbyId);
            expect(mockLobbyRepo.update).toHaveBeenCalledWith(lobbyId, { players: updatedLobby.players });
            expect(mockUserLobbyRepo.addUserToLobby).toHaveBeenCalledWith(userId, lobbyId);
            expect(result).toEqual(updatedLobby);
        });

        it('should throw if lobby is full', async () => {
            const lobbyId = 'lobbyId';
            const userId = 'newUser';
            const lobby: Lobby = {
                id: 'lobbyId',
                creator: 'userId',
                maxPlayers: 4,
                rounds: 3,
                players: Array(4).fill(null).map((_, i) => ({
                    userId: `user${i}`,
                    status: 'waiting',
                })),
                status: lobbySchema.shape.status.enum.waiting!,
                startAmount: 1000,
                startInventory: {
                    items: [{
                        item: 'triangle',
                        quantity: 1,
                    }],
                },
                bidTime: 30,
            };
            mockLobbyRepo.findById.mockResolvedValue(lobby);

            await expect(lobbyService.joinLobby(lobbyId, userId))
              .rejects.toThrow('Lobby is full');
        });

        it('should throw if match is already in progress', async () => {
            const lobbyId = 'lobbyId';
            const userId = 'newUser';
            const lobby: Lobby = {
                id: 'lobbyId',
                creator: 'userId',
                maxPlayers: 4,
                rounds: 3,
                players: [{ userId: 'userId', status: 'waiting' }],
                status: 'in-progress',
                startAmount: 1000,
                startInventory: {
                    items: [{
                        item: 'triangle',
                        quantity: 1,
                    }],
                },
                bidTime: 30,
            };

            mockLobbyRepo.findById.mockResolvedValue(lobby);

            await expect(lobbyService.joinLobby(lobbyId, userId))
              .rejects.toThrow('Cannot join lobby while match is in progress');
        });
    });

    describe('leaveLobby', () => {
        it('should remove user from lobby', async () => {
            const lobbyId = 'lobbyId';
            const userId = 'userId';
            const lobby: Lobby = {
                id: 'lobbyId',
                creator: 'creatorId',
                maxPlayers: 4,
                rounds: 3,
                players: [
                    { userId: 'userId', status: 'waiting' },
                    { userId, status: 'waiting' },
                ],
                status: lobbySchema.shape.status.enum.waiting!,
                startAmount: 1000,
                startInventory: {
                    items: [{
                        item: 'triangle',
                        quantity: 1,
                    }],
                },
                bidTime: 30,
            };
            const updatedLobby = {
                ...lobby,
                players: lobby.players.filter(p => p.userId !== userId),
            };

            mockLobbyRepo.findById.mockResolvedValue(lobby);
            mockLobbyRepo.update.mockResolvedValue(updatedLobby);
            mockUserLobbyRepo.removeUserFromLobby.mockResolvedValue();

            const result = await lobbyService.leaveLobby(lobbyId, userId);

            expect(mockLobbyRepo.update).toHaveBeenCalledWith(lobbyId, { players: updatedLobby.players });
            expect(mockUserLobbyRepo.removeUserFromLobby).toHaveBeenCalledWith(userId, lobbyId);
            expect(result).toEqual(updatedLobby);
        });

        it('should delete lobby and remove all users if creator leaves', async () => {
            const lobbyId = 'lobbyId';
            const creatorId = 'creatorId';
            const lobby: Lobby = {
                id: 'lobbyId',
                creator: creatorId,
                maxPlayers: 4,
                rounds: 3,
                players: [{ userId: 'creatorId', status: 'waiting' }],
                status: lobbySchema.shape.status.enum.waiting!,
                startAmount: 1000,
                startInventory: {
                    items: [{
                        item: 'triangle',
                        quantity: 1,
                    }],
                },
                bidTime: 30,
            };

            mockLobbyRepo.findById.mockResolvedValue(lobby);
            mockLobbyRepo.delete.mockResolvedValue(lobby);
            mockUserLobbyRepo.removeLobbyUsers.mockResolvedValue();

            const result = await lobbyService.leaveLobby(lobbyId, creatorId);

            expect(mockLobbyRepo.delete).toHaveBeenCalledWith(lobbyId);
            expect(mockUserLobbyRepo.removeLobbyUsers).toHaveBeenCalledWith(lobbyId);
            expect(result).toBeNull();
        });
    });

    describe('startMatch', () => {
        it('should start the match and update user states', async () => {
            const lobbyId = 'lobbyId';
            const creatorId = 'creatorId';
            const lobby: Lobby = {
                id: 'lobbyId',
                creator: creatorId,
                maxPlayers: 4,
                rounds: 3,
                players: [{ userId: 'userId', status: 'ready' },
                    { userId: 'user2', status: 'ready' }],
                status: lobbySchema.shape.status.enum.waiting!,
                startAmount: 1000,
                startInventory: {
                    items: [{
                        item: 'triangle',
                        quantity: 1,
                    }],
                },
                bidTime: 30,
            };
            const updatedLobby: Lobby = {
                ...lobby,
                status: 'in-progress',
            };

            mockLobbyRepo.findById.mockResolvedValue(lobby);
            mockLobbyRepo.update.mockResolvedValue(updatedLobby);
            mockUserLobbyRepo.startMatch.mockResolvedValue();

            const result = await lobbyService.startMatch(lobbyId, creatorId);

            expect(mockLobbyRepo.update).toHaveBeenCalledWith(lobbyId, { status: updatedLobby.status });
            expect(mockUserLobbyRepo.startMatch).toHaveBeenCalledWith(lobbyId);
            expect(result).toEqual(updatedLobby);
        });

        it('should throw if not all players are ready', async () => {
            const lobbyId = 'lobbyId';
            const creatorId = 'creatorId';
            const lobby: Lobby = {
                id: lobbyId,
                creator: creatorId,
                players: [
                    { userId: creatorId, status: 'ready' },
                    { userId: 'user2', status: 'waiting' },
                ],
                maxPlayers: 4,
                rounds: 3,
                status: 'waiting',
                startAmount: 1000,
                startInventory: {
                    items: [{
                        item: 'triangle',
                        quantity: 1,
                    }],
                },
                bidTime: 30,
            };

            mockLobbyRepo.findById.mockResolvedValue(lobby);

            await expect(lobbyService.startMatch(lobbyId, creatorId))
              .rejects.toThrow('All players must be ready to start the game');
        });

        it('should throw if not enough players', async () => {
            const lobbyId = 'lobbyId';
            const creatorId = 'creatorId';
            const lobby: Lobby = {
                id: lobbyId,
                creator: creatorId,
                players: [
                    { userId: creatorId, status: 'ready' },
                ],
                maxPlayers: 4,
                rounds: 3,
                status: 'waiting',
                startAmount: 1000,
                startInventory: {
                    items: [{
                        item: 'triangle',
                        quantity: 1,
                    }],
                },
                bidTime: 30,
            };

            mockLobbyRepo.findById.mockResolvedValue(lobby);

            await expect(lobbyService.startMatch(lobbyId, creatorId))
              .rejects.toThrow('Not enough players to start the game');
        });

        it('should throw if non-creator tries to start match', async () => {
            const lobbyId = 'lobbyId';
            const nonCreator = 'nonCreator';
            const lobby: Lobby = {
                id: lobbyId,
                creator: 'creatorId',
                players: [
                    { userId: 'creatorId', status: 'ready' },
                    { userId: nonCreator, status: 'ready' },
                ],
                maxPlayers: 4,
                rounds: 3,
                status: 'waiting',
                startAmount: 1000,
                startInventory: {
                    items: [{
                        item: 'triangle',
                        quantity: 1,
                    }],
                },
                bidTime: 30,
            };

            mockLobbyRepo.findById.mockResolvedValue(lobby);

            await expect(lobbyService.startMatch(lobbyId, nonCreator))
              .rejects.toThrow('Only the lobby creator can start the match');
        });
    });

    describe('setStatus', () => {
        it('should update player status', async () => {
            const lobbyId = 'lobbyId';
            const userId = 'userId';
            const lobby: Lobby = {
                id: lobbyId,
                creator: 'creatorId',
                players: [
                    { userId: 'creatorId', status: 'waiting' },
                    { userId, status: 'waiting' },
                ],
                maxPlayers: 4,
                rounds: 3,
                status: 'waiting',
                startAmount: 1000,
                startInventory: {
                    items: [{
                        item: 'triangle',
                        quantity: 1,
                    }],
                },
                bidTime: 30,
            };
            const updatedLobby: Lobby = {
                ...lobby,
                players: lobby.players.map(p =>
                  p.userId === userId ? { ...p, status: 'ready' } : p,
                ),
            };

            mockLobbyRepo.findById.mockResolvedValue(lobby);
            mockLobbyRepo.update.mockResolvedValue(updatedLobby);

            const result = await lobbyService.setStatus(lobbyId, userId, 'ready');

            expect(mockLobbyRepo.update).toHaveBeenCalledWith(lobbyId, { players: updatedLobby.players });
            expect(result).toEqual(updatedLobby);
        });
    });

    describe('kickPlayer', () => {
        it('should remove player from lobby', async () => {
            const lobbyId = 'lobbyId';
            const creatorId = 'creatorId';
            const playerToKick = 'player2';
            const lobby: Lobby = {
                id: lobbyId,
                creator: creatorId,
                players: [
                    { userId: creatorId, status: 'waiting' },
                    { userId: playerToKick, status: 'waiting' },
                ],
                maxPlayers: 4,
                rounds: 3,
                status: 'waiting',
                startAmount: 1000,
                startInventory: {
                    items: [{
                        item: 'triangle',
                        quantity: 1,
                    }],
                },
                bidTime: 30,
            };
            const updatedLobby = {
                ...lobby,
                players: lobby.players.filter(p => p.userId !== playerToKick),
            };

            mockLobbyRepo.findById.mockResolvedValue(lobby);
            mockLobbyRepo.update.mockResolvedValue(updatedLobby);
            mockUserLobbyRepo.removeUserFromLobby.mockResolvedValue();

            const result = await lobbyService.kickPlayer(lobbyId, creatorId, playerToKick);

            expect(mockLobbyRepo.update).toHaveBeenCalledWith(lobbyId, { players: updatedLobby.players });
            expect(mockUserLobbyRepo.removeUserFromLobby).toHaveBeenCalledWith(playerToKick, lobbyId);
            expect(result).toEqual(updatedLobby);
        });

        it('should throw if non-creator tries to kick', async () => {
            const lobbyId = 'lobbyId';
            const nonCreator = 'nonCreator';
            const playerToKick = 'player2';
            const lobby: Lobby = {
                id: lobbyId,
                creator: 'creatorId',
                players: [
                    { userId: 'creatorId', status: 'waiting' },
                    { userId: nonCreator, status: 'waiting' },
                    { userId: playerToKick, status: 'waiting' },
                ],
                maxPlayers: 4,
                rounds: 3,
                status: 'waiting',
                startAmount: 1000,
                startInventory: {
                    items: [{
                        item: 'triangle',
                        quantity: 1,
                    }],
                },
                bidTime: 30,
            };

            mockLobbyRepo.findById.mockResolvedValue(lobby);

            await expect(lobbyService.kickPlayer(lobbyId, nonCreator, playerToKick))
              .rejects.toThrow('Only the lobby creator can kick players');
        });

        it('should throw if trying to kick creator', async () => {
            const lobbyId = 'lobbyId';
            const creatorId = 'creatorId';
            const lobby: Lobby = {
                id: lobbyId,
                creator: creatorId,
                players: [
                    { userId: creatorId, status: 'waiting' },
                    { userId: 'player2', status: 'waiting' },
                ],
                maxPlayers: 4,
                rounds: 3,
                status: 'waiting',
                startAmount: 1000,
                startInventory: {
                    items: [{
                        item: 'triangle',
                        quantity: 1,
                    }],
                },
                bidTime: 30,
            };

            mockLobbyRepo.findById.mockResolvedValue(lobby);

            await expect(lobbyService.kickPlayer(lobbyId, creatorId, creatorId))
              .rejects.toThrow('Cannot kick the lobby creator');
        });
    });
    describe('Complete a Lobby', () => {
        it('should complete a lobby after the match is ended', async () => {
            const lobbyId = 'lobbyId'
            const lobby: Lobby = {
                id: lobbyId,
                creator: 'creatorId',
                players: [
                    { userId: 'creatorId', status: 'waiting' },
                    { userId: 'player2', status: 'waiting' },
                ],
                maxPlayers: 4,
                rounds: 3,
                status: 'in-progress',
                startAmount: 1000,
                startInventory: {
                    items: [{
                        item: 'triangle',
                        quantity: 1,
                    }],
                },
                bidTime: 30,
            }
            mockLobbyRepo.findById.mockResolvedValue(lobby)
            await expect(lobbyService.terminateMatch(lobbyId)).resolves.toBeUndefined()
        })
        it('should throw if the lobby is not in-progress', async () => {
            const lobbyId = 'lobbyId'
            const lobby: Lobby = {
                id: lobbyId,
                creator: 'creatorId',
                players: [
                    { userId: 'creatorId', status: 'waiting' },
                    { userId: 'player2', status: 'waiting' },
                ],
                maxPlayers: 4,
                rounds: 3,
                status: 'waiting',
                startAmount: 1000,
                startInventory: {
                    items: [{
                        item: 'triangle',
                        quantity: 1,
                    }],
                },
                bidTime: 30,
            }
            mockLobbyRepo.findById.mockResolvedValue(lobby)
            await expect(lobbyService.terminateMatch(lobbyId)).rejects.toThrow('Match is not in progress')
        })
        it('should get an existing lobby', () => {
            const lobbyId = 'lobbyId'
            const lobby: Lobby = {
                id: lobbyId,
                creator: 'creatorId',
                players: [
                    { userId: 'creatorId', status: 'waiting' },
                    { userId: 'player2', status: 'waiting' },
                ],
                maxPlayers: 4,
                rounds: 3,
                status: 'waiting',
                startAmount: 1000,
                startInventory: {
                    items: [{
                        item: 'triangle',
                        quantity: 1,
                    }],
                },
                bidTime: 30,
            }
            mockLobbyRepo.findById.mockResolvedValue(lobby)
            expect(lobbyService.getLobby(lobbyId)).resolves.toEqual(lobby)
        })
    })
    it('should get the info of a player', async () => {
        const playerId = 'playerId'
        const lobbyId = 'lobbyId'
        mockUserLobbyRepo.getUserActiveLobby.mockResolvedValue({
            userId: playerId,
            lobbyId: lobbyId,
            state: 'waiting',
            joinedAt: new Date(),
            leftAt: undefined,
        })
        const playerInfo = {
            email: 'player21@em.com',
            name: 'player1',
            id: 'playerId',
        };

        (axios.get as jest.Mock).mockResolvedValue({ data: playerInfo })
        await expect(lobbyService.getPlayer(playerId)).resolves.toEqual({
            username: playerInfo.name,
        })
    })
    it('should return null if the user does not exists', () => {
        const playerId = 'playerId';
        (axios.get as jest.Mock).mockRejectedValue(new Error())
        expect(lobbyService.getPlayer(playerId)).rejects.toThrow(new PlayerNotFoundError())
    })


});
