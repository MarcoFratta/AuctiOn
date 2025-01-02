import request from 'supertest';
import axios from 'axios';
import app from '../src/App';
import { config } from '../src/configs/config';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { closeLocalMongoConnection, localMongoConnection } from './common';
import { Lobby, LobbyConfig, PlayerStatus } from '../src/schemas/Lobby';
import { User } from '../src/schemas/User';
import { ServiceUnavailableError } from '../src/errors/LobbyErrors';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const authServiceUrl = config.authServiceUri;
const validToken = 'Bearer validToken123';
const user = {
  id: '123456789012345678901234',
  email: 'test@example.com',
  name: 'Test User',
};

async function createLobby(u: User, config: Partial<LobbyConfig> = { rounds: 3, maxPlayers: 4 }) {
  actAs(u);
  return await request(app).post('/lobby/create').set('Authorization', validToken).send(config);
}

async function joinUser(
  lobby: Lobby,
  u: User = {
    id: 'newUser',
    email: 'newUser@email.com',
    name: 'newUser',
  },
) {
  actAs(u);
  return await request(app).post(`/lobby/join/${lobby.id}`).set('Authorization', validToken);
}

function actAs(u: User) {
  mockedAxios.post.mockResolvedValueOnce({ data: u });
}

async function setPlayerStatus(lobby: Lobby, u: User, status: PlayerStatus) {
  actAs(u);
  return await request(app)
    .put(`/lobby/status/${lobby.id}`)
    .set('Authorization', validToken)
    .send({ status });
}

describe('Lobby Service Integration Tests with Auth Service Mock', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await localMongoConnection();
  });

  afterAll(async () => {
    await closeLocalMongoConnection(mongoServer);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /lobby/create', () => {
    it('should create a lobby successfully with valid token', async () => {
      const lobbyConfig = { rounds: 3, maxPlayers: 4 };

      const response = await createLobby(user, lobbyConfig);

      console.log(response.body);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Lobby created successfully'),
        expect(response.body).toHaveProperty('lobby');
      expect(response.body.lobby).toHaveProperty('id');
      expect(response.body.lobby).toHaveProperty('maxPlayers', 4);
      expect(response.body.lobby).toHaveProperty('rounds', 3);
      expect(response.body.lobby).toHaveProperty('creator', user.id);
      expect(response.body.lobby).toHaveProperty('status', 'waiting');
      expect(response.body.lobby.players.map((x: { userId: string }) => x.userId)).toContain(
        user.id,
      ),
        expect(mockedAxios.post).toHaveBeenCalledWith(`${authServiceUrl}/validate`, {
        token: validToken.split(' ')[1],
      });
    });

    it('should return 401 if token is invalid', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Unauthorized'));

      const response = await request(app)
        .post('/lobby/create')
        .set('Authorization', 'Bearer invalidToken')
        .send({ name: 'Test Lobby', maxPlayers: 4 });

      expect(response.status).toBe(302);
      expect(mockedAxios.post).toHaveBeenCalled();
    });
  });

  describe('POST /lobby/join', () => {
    it('should allow a user to join a lobby with valid token', async () => {
      const lobby: Lobby = (await createLobby(user)).body.lobby;
      const id = lobby.id;
      const response = await joinUser(lobby, {
        id: 'newUser',
        email: 'newUser@email.com',
        name: 'newUser',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Successfully joined the lobby');
      expect(response.body).toHaveProperty('lobby');
      expect(response.body.lobby).toHaveProperty('id', id);
      expect(response.body.lobby.players.map((x: { userId: string }) => x.userId)).toContain(
        user.id,
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(`${authServiceUrl}/validate`, {
        token: validToken.split(' ')[1],
      });
    });
  });
  describe('PUT /lobby/status', () => {
    it('should update the player status', async () => {
      const lobby = (await createLobby(user)).body.lobby;
      const response = await setPlayerStatus(lobby, user, 'ready');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Player status updated');
      expect(response.body).toHaveProperty('lobby');
      expect(response.body.lobby.players[0]).toHaveProperty('status', 'ready');
    });
  });

  describe('POST /lobby/start', () => {
    it('should start the match if the user is the host', async () => {
      const lobby: Lobby = (await createLobby(user)).body.lobby;
      const newUser = {
        id: 'newUser',
        email: 'new@User.com',
        name: 'user',
      };
      await joinUser(lobby, newUser);
      await setPlayerStatus(lobby, user, 'ready');
      await setPlayerStatus(lobby, newUser, 'ready');
      actAs(user);
      const response = await request(app)
        .post(`/lobby/start/${lobby.id} `)
        .set('Authorization', validToken)
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Match started');
      expect(response.body).toHaveProperty('lobby');
      expect(response.body.lobby).toHaveProperty('status', 'in-progress');

      expect(mockedAxios.post).toHaveBeenCalledWith(`${authServiceUrl}/validate`, {
        token: validToken.split(' ')[1],
      });
    });

    it('should return 403 if user is not the creator', async () => {
      const lobby = (await createLobby(user)).body.lobby;
      actAs({ id: 'newUser', email: 'new@user.com', name: 'newUserName' });
      const response = await request(app)
        .post(`/lobby/start/${lobby.id} `)
        .set('Authorization', validToken)
        .send();

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
      expect(response.body).toHaveProperty(
        'message',
        'Only the lobby ' + 'creator can perform this action',
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully when Auth Service fails', async () => {
      mockedAxios.post.mockRejectedValueOnce(new ServiceUnavailableError());

      const response = await request(app)
        .post('/lobby/create')
        .set('Authorization', validToken)
        .send({ name: 'Test Lobby', maxPlayers: 4 });
      console.log(response.body);
      expect(response.status).toBe(503);
      expect(response.body).toHaveProperty('error', 'Service Temporary Unavailable');

      expect(mockedAxios.post).toHaveBeenCalledWith(`${authServiceUrl}/validate`, {
        token: validToken.split(' ')[1],
      });
    });
  });
});
