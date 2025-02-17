import { connectToServer } from './Connection'
import { Client } from './Client'


const API_GATEWAY_URL = 'http://localhost:8080'
const c = new Client(API_GATEWAY_URL)
beforeAll(async () => {
  await connectToServer(API_GATEWAY_URL)
})

jest.setTimeout(90000)
describe('Match simulation', () => {
  it('should simulate a match with 4 players', async () => {
    const creator = await c.registerUser('player1@email.com', 'Password123', 'Player 1')
    const player2 = await c.registerUser('player2@email.com', 'Password123', 'Player 2')
    const player3 = await c.registerUser('player3@email.com', 'Password123', 'Player 3')
    const player4 = await c.registerUser('player4@email.com', 'Password123', 'Player 4')
    const bidTime = 10
    const bidMs = 2 * (bidTime * 1000)

    // Create a lobby
    const lobby = await c.createLobby(creator.token, {
      rounds: 3,
      maxPlayers: 4,
      bidTime: bidTime,
      startAmount: 500,
      startInventory: {
        items: [
          { item: 'triangle', quantity: 3 },
          { item: 'square', quantity: 3 },
          { item: 'circle', quantity: 3 },
        ],
      },
    })

    await c.joinLobby(player2.token, lobby.id)
    await c.joinLobby(player3.token, lobby.id)
    await c.joinLobby(player4.token, lobby.id)
    await c.createMatch(creator.token)

    await c.setReady(creator.token, 'ready')
    await c.setReady(player2.token, 'ready')
    await c.setReady(player3.token, 'ready')
    await c.setReady(player4.token, 'ready')

    await c.startMatch(creator.token)

    const messages: Record<string, any[]> = { creator: [], player2: [], player3: [], player4: [] }
    // Connect players
    const wsCreator = await c.connectPlayer(creator.token, 'creator', messages)
    const wsPlayer2 = await c.connectPlayer(player2.token, 'player2', messages)
    const wsPlayer3 = await c.connectPlayer(player3.token, 'player3', messages)
    const wsPlayer4 = await c.connectPlayer(player4.token, 'player4', messages)
    // Start a sale
    await c.saleItem(wsCreator, [
      { item: 'triangle', quantity: 1 },
      { item: 'square', quantity: 1 },
    ])
    await c.placeBid(wsPlayer2, 100, 1)
    await c.placeBid(wsPlayer3, 200, 1)
    await c.placeBid(wsPlayer4, 300, 1)
    // wait for the round to end
    await c.waitFor(bidMs)

    // Start a sale
    await c.saleItem(wsPlayer2, [
      { item: 'triangle', quantity: 1 },
    ])
    await c.placeBid(wsCreator, 100, 2)
    await c.placeBid(wsPlayer3, 200, 2)
    // wait for the round to end
    await c.waitFor(bidMs)

    //last round
    await c.saleItem(wsPlayer3, [
      { item: 'circle', quantity: 1 },
    ])
    await c.placeBid(wsCreator, 100, 3)
    // wait for the round to end
    await c.waitFor(bidMs)

    // Check the final state
    expect(messages.creator.pop().leaderboard).toEqual({
      leaderboard: [
        {
          id: creator.id, money: 700, position: 1, inventory: {
            items: [
              { item: 'triangle', quantity: 2 },
              { item: 'square', quantity: 2 },
              { item: 'circle', quantity: 4 }],
          },
        },
        {
          id: player2.id, money: 700, position: 1, inventory: {
            items: [
              { item: 'triangle', quantity: 2 },
              { item: 'square', quantity: 3 },
              { item: 'circle', quantity: 3 }],
          },
        },
        {
          id: player3.id, money: 400, position: 3, inventory: {
            items: [
              { item: 'triangle', quantity: 4 },
              { item: 'square', quantity: 3 },
              { item: 'circle', quantity: 2 }],
          },
        },
      ],
      removed: [
        {
          id: player4.id, money: 200, inventory: {
            items: [
              { item: 'triangle', quantity: 4 },
              { item: 'square', quantity: 4 },
              { item: 'circle', quantity: 3 }],
          },
        },
      ],
    })
  })
})