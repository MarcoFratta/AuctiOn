import { MongoUserLobbyRepo } from '../src/repositories/MongoUserLobbyRepo'
import { UserLobbyModel } from '../src/models/UserLobbyModel'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

jest.setTimeout(60000)
describe('UserLobbyRepo', () => {
  let mongoServer: MongoMemoryServer;
  let repo: MongoUserLobbyRepo

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  }, 90000);

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  }, 90000);

  beforeEach(async () => {
    await UserLobbyModel.deleteMany({});
    repo = new MongoUserLobbyRepo()
  });

  describe('addUserToLobby', () => {
    it('should create a new user-lobby relationship', async () => {
      const result = await repo.addUserToLobby('user123', 'lobby123');

      expect(result).toEqual({
        userId: 'user123',
        lobbyId: 'lobby123',
        state: 'waiting',
        joinedAt: expect.any(Date),
        leftAt: undefined,
      });

      // Verify user is actually in the lobby
      const activeLobby = await repo.getUserActiveLobby('user123');
      expect(activeLobby?.lobbyId).toBe('lobby123');
    });
  });

  describe('getUserActiveLobby', () => {
    it('should return active lobby for user', async () => {
      await repo.addUserToLobby('user123', 'lobby123');

      const result = await repo.getUserActiveLobby('user123');

      expect(result).toEqual({
        userId: 'user123',
        lobbyId: 'lobby123',
        state: 'waiting',
        joinedAt: expect.any(Date),
        leftAt: undefined,
      });
    });

    it('should return null if no active lobby found', async () => {
      const result = await repo.getUserActiveLobby('nonexistent');
      expect(result).toBeNull();
    });

    it('should return null if user has left the lobby', async () => {
      await repo.addUserToLobby('user123', 'lobby123');
      await repo.leaveLobby('user123');

      const result = await repo.getUserActiveLobby('user123');
      expect(result).toBeNull();
    });
  });

  describe('startMatch', () => {
    it('should update state to in-progress for all active users', async () => {
      // Setup: Add users to lobby
      await repo.addUserToLobby('user1', 'lobby123');
      await repo.addUserToLobby('user2', 'lobby123');
      await repo.addUserToLobby('user3', 'otherLobby');

      // Action: Start the match
      await repo.startMatch('lobby123');

      // Verify: Check states
      const user1Lobby = await repo.getUserActiveLobby('user1');
      const user2Lobby = await repo.getUserActiveLobby('user2');
      const user3Lobby = await repo.getUserActiveLobby('user3');

      expect(user1Lobby?.state).toBe('in-progress');
      expect(user2Lobby?.state).toBe('in-progress');
      expect(user3Lobby?.state).toBe('waiting');
    });
  });

  describe('removeUserFromLobby', () => {
    it('should remove user', async () => {
      // Setup: Add users in different states
      await repo.addUserToLobby('user1', 'lobby1');
      await repo.addUserToLobby('user2', 'lobby2');
      await repo.startMatch('lobby2'); // user2 goes to in-progress

      // Action: Try to remove both users
      await repo.removeUserFromLobby('user1', 'lobby1');
      await repo.removeUserFromLobby('user2', 'lobby2');

      // Verify: Both should be removed
      const user1Lobby = await repo.getUserActiveLobby('user1');
      const user2Lobby = await repo.getUserActiveLobby('user2');

      expect(user1Lobby).toBeNull()
      expect(user2Lobby).toBeNull()
    });
  });

  describe('terminateMatch', () => {
    it('should complete the match for all in-progress users', async () => {
      // Setup: Create a match in progress
      await repo.addUserToLobby('user1', 'lobby123');
      await repo.addUserToLobby('user2', 'lobby123');
      await repo.startMatch('lobby123');

      // Action: Terminate the match
      await repo.terminateMatch('lobby123');

      // Verify: All users should be marked as completed
      const user1Lobby = await repo.getUserActiveLobby('user1');
      const user2Lobby = await repo.getUserActiveLobby('user2');

      expect(user1Lobby).toBeNull(); // null because completed matches aren't active
      expect(user2Lobby).toBeNull();
    });
  });

  describe('removeLobbyUsers', () => {
    it('should remove all waiting users from lobby', async () => {
      // Setup: Add users in different states
      await repo.addUserToLobby('user1', 'lobby123');
      await repo.addUserToLobby('user2', 'lobby123');
      await repo.addUserToLobby('user3', 'otherLobby');
      await repo.startMatch('otherLobby'); // users 1 and 2 goes to in-progress

      // Action: Remove all waiting users
      await repo.removeLobbyUsers('lobby123');

      // Verify: Only in-progress users should remain
      const user1Lobby = await repo.getUserActiveLobby('user1');
      const user2Lobby = await repo.getUserActiveLobby('user2');
      const user3Lobby = await repo.getUserActiveLobby('user3');

      expect(user1Lobby).toBeNull();
      expect(user2Lobby).toBeNull();
      expect(user3Lobby?.state).toBe('in-progress');
    });
  });
}); 