import request from 'supertest'
import axios from 'axios'
import { App } from '../src/App'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { closeLocalMongoConnection, localMongoConnection } from './common'
import { Lobby, LobbyConfig, PlayerStatus } from '../src/schemas/Lobby'
import { User } from '../src/schemas/User'
import { UserLobbyModel } from '../src/models/UserLobbyModel'
import { LobbyModel } from '../src/models/LobbyModel'
import { KafkaContainer, StartedKafkaContainer } from '@testcontainers/kafka'
import { Kafka } from 'kafkajs'

jest.setTimeout(90000)
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const validToken = 'Bearer validToken123';
const user = {
  id: '123456789012345678901234',
  email: 'test@example.com',
  name: 'Test User',
};

async function createLobby(app: App, u: User, config: Partial<LobbyConfig> = {
  rounds: 3,
  maxPlayers: 4,
  bidTime: 10,
  startAmount: 100,
  startInventory: { items: [{ item: 'triangle', quantity: 1 }] },
}) {
  return await request(app.app).post('/lobbies/create')
    .set('Authorization', validToken)
    .send({ user: u, ...config })
}

async function joinUser(app: App, lobby: Lobby, u: User = {
  id: 'newUser',
  email: 'newUser@email.com',
  name: 'newUser',
}) {
  return await request(app.app).post(`/lobbies/${lobby.id}/join`)
    .set('Authorization', validToken)
    .send({ user: u })
}

async function setPlayerStatus(app: App, u: User, status: PlayerStatus) {
  return await request(app.app)
    .put(`/lobbies/status`)
    .set('Authorization', validToken)
    .send({ user: u, status });
}

describe('Lobby Service Integration Tests with Auth Service Mock', () => {
  let mongoServer: MongoMemoryServer;
  let app: App
  let kafkaContainer: StartedKafkaContainer
  let kafka: Kafka

  beforeAll(async () => {
    mongoServer = await localMongoConnection();
    kafkaContainer = await new KafkaContainer().start()
    kafka = new Kafka({
      clientId: 'lobby-service',
      brokers: [`localhost:${kafkaContainer.getMappedPort(9093)}`],
      logLevel: 0,
    })
  }, 120000);

  beforeEach(async () => {
    app = new App(kafka)
    await LobbyModel.deleteMany({});
    await UserLobbyModel.deleteMany({});
    await app.start(0)
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await closeLocalMongoConnection(mongoServer);
    await kafkaContainer.stop()
    await app.stop()
  }, 120000);

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /lobbies/create', () => {
    it('should create a lobby successfully with valid token', async () => {
      const lobbyConfig: LobbyConfig = {
        rounds: 3,
        maxPlayers: 4,
        bidTime: 10,
        startAmount: 100,
        startInventory: { items: [{ item: 'triangle', quantity: 1 }] },
      };

      const response = await createLobby(app, user, lobbyConfig)

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Lobby created successfully')
      expect(response.body).toHaveProperty('lobby')
      expect(response.body.lobby).toHaveProperty('id');
      expect(response.body.lobby).toHaveProperty('maxPlayers', 4);
      expect(response.body.lobby).toHaveProperty('rounds', 3);
      expect(response.body.lobby).toHaveProperty('creator', user.id);
      expect(response.body.lobby).toHaveProperty('status', 'waiting');
      expect(response.body.lobby.players.map((x: { userId: string }) => x.userId)).toContain(
        user.id,
      );
    });

    it('should return 401 if token is invalid', async () => {
      const response = await request(app.app)
        .post('/lobbies/create')
        .set('Authorization', 'Bearer invalidToken')
        .send({
          rounds: 3,
          maxPlayers: 4,
          bidTime: 10,
          startAmount: 100,
          startInventory: { items: [{ item: 'triangle', quantity: 1 }] },
        });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /lobbies/join', () => {
    it('should allow a user to join a lobby with valid token', async () => {
      const lobby: Lobby = (await createLobby(app, user)).body.lobby
      const id = lobby.id;
      const response = await joinUser(app, lobby, {
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
    });

    it('should return 404 if the lobby does not exist', async () => {
      const response = await request(app.app)
        .post('/lobbies/123456789012345678901234/join')
        .set('Authorization', validToken)
        .send({ user: user });
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Not Found')
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PUT /lobbies/status', () => {
    it('should update the player status', async () => {
      const lobby = (await createLobby(app, user)).body.lobby
      const response = await setPlayerStatus(app, user, 'ready')

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Player status updated');
      expect(response.body).toHaveProperty('lobby');
      expect(response.body.lobby.players[0]).toHaveProperty('status', 'ready');
    });
  });

  describe('POST /lobbies/start', () => {
    it('should start the match if the user is the host', async () => {
      const lobby: Lobby = (await createLobby(app, user)).body.lobby
      const newUser = {
        id: 'newUser',
        email: 'new@User.com',
        name: 'user',
      };
      await joinUser(app, lobby, newUser)
      await setPlayerStatus(app, user, 'ready')
      await setPlayerStatus(app, newUser, 'ready')

      const response = await request(app.app)
        .post(`/lobbies/start`)
        .set('Authorization', validToken)
        .send({ user: user });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Match started');
      expect(response.body).toHaveProperty('lobby');
      expect(response.body.lobby).toHaveProperty('status', 'in-progress');
    });

    it('should return 403 if user is not the creator', async () => {
      const lobby = (await createLobby(app, user)).body.lobby
      const newUser = { id: 'newUser', email: 'new@user.com', name: 'newUserName' };
      await joinUser(app, lobby, newUser)
      const response = await request(app.app)
        .post(`/lobbies/start/`)
        .set('Authorization', validToken)
        .send({ user: newUser });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Forbidden')
      expect(response.body).toHaveProperty(
        'message',
        'Only the lobby creator can start the match',
      );
    });
  });

  describe('POST /lobbies/leave', () => {
    it('should allow a user to leave a lobby', async () => {
      const lobby = (await createLobby(app, user)).body.lobby
      const newUser = {
        id: 'newUser',
        email: 'new@user.com',
        name: 'newUserName',
      };
      await joinUser(app, lobby, newUser)

      const response = await request(app.app)
        .post(`/lobbies/leave/`)
        .set('Authorization', validToken)
        .send({ user: newUser });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Successfully left the lobby');
      expect(response.body).toHaveProperty('lobby');
    });

    it('should delete the lobby if the creator leaves', async () => {
      const lobby = (await createLobby(app, user)).body.lobby
      const response = await request(app.app)
        .post(`/lobbies/leave/`)
        .set('Authorization', validToken)
        .send({ user: user });
      expect(response.status).toBe(204);
    });
  });
});
