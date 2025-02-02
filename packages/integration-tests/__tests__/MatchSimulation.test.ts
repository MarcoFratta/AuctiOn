import { connectToServer } from './Connection'
import request from 'supertest'
import logger from './Logger'

const API_GATEWAY_URL = 'http://localhost:8080'
beforeAll(async () => {
  await connectToServer(API_GATEWAY_URL)
})

async function registerUser(email: string, password: string, name: string) {
  const res = await request(API_GATEWAY_URL)
    .post('/auth/register')
    .send({
      email,
      password,
      name,
    })

  return res.body.user
}

async function createLobby(creatorToken: string, options: any) {
  const res = await request(API_GATEWAY_URL)
    .post('/lobbies/create')
    .set('Authorization', `Bearer ${creatorToken}`)
    .send(options)
  logger.info(`Lobby created: ${JSON.stringify(res)}`)
  return res.body.lobby
}

async function joinLobby(token: string, lobbyId: string) {
  const res = await request(API_GATEWAY_URL)
    .post(`/lobbies/${lobbyId}/join`)
    .set('Authorization', `Bearer ${token}`)
  logger.info(res.body)
  return res.body.lobby
}

async function startMatch(token: string) {
  const res = await request(API_GATEWAY_URL)
    .post(`/lobbies/start`)
    .set('Authorization', `Bearer ${token}`)

  return res.body.lobby
}

async function setReady(token: string, status: string) {
  const res = await request(API_GATEWAY_URL)
    .put(`/lobbies/status`)
    .set('Authorization', `Bearer ${token}`)
    .send({ status })
  return res.body.lobby
}


describe('Match simulation', () => {
  it('should simulate a match with 4 players', async () => {
    const creator = await registerUser('player1@email.com', 'Password123', 'Player 1')
    const player2 = await registerUser('player2@email.com', 'Password123', 'Player 2')
    const player3 = await registerUser('player3@email.com', 'Password123', 'Player 3')
    const player4 = await registerUser('player4@email.com', 'Password123', 'Player 4')

    // Create a lobby
    const lobby = await createLobby(creator.token, {
      rounds: 3,
      maxPlayers: 4,
      bidTime: 20,
      startAmount: 500,
      startInventory: {
        items: [
          { item: 'triangle', quantity: 1 },
          { item: 'square', quantity: 3 },
          { item: 'circle', quantity: 4 },
        ],
      },
    })

    await joinLobby(player2.token, lobby.id)
    await joinLobby(player3.token, lobby.id)
    await joinLobby(player4.token, lobby.id)
    await startMatch(creator.token)

    await setReady(creator.token, 'ready')
    await setReady(player2.token, 'ready')
    await setReady(player3.token, 'ready')
    await setReady(player4.token, 'ready')

  })


})