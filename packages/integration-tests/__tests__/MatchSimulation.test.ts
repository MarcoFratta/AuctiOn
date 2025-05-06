import { connectToServer } from './Connection'
import { Client } from './Client'
import logger from '@auction/common/logger'


const API_GATEWAY_URL = 'http://localhost:8080'
const c = new Client(API_GATEWAY_URL)
beforeAll(async () => {
  await connectToServer(API_GATEWAY_URL)
})

jest.setTimeout(90000)
describe('Match simulation', () => {
  it('should simulate a match with 4 players and random seller order', async () => {
    const creator = await c.registerUser(`player1-${Date.now()}@email.com`, 'Password123', 'Player1')
    const player2 = await c.registerUser(`player2-${Date.now()}@email.com`, 'Password123', 'Player2')
    const player3 = await c.registerUser(`player3-${Date.now()}@email.com`, 'Password123', 'Player3')
    const player4 = await c.registerUser(`player4-${Date.now()}@email.com`, 'Password123', 'Player4')
    const bidTime = 10
    logger.info(`Creator token: ${creator.token}`)
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

    const messages: Record<string, any[]> = { creator: [], player2: [], player3: [], player4: [] }
    // Connect players
    const wsCreator = await c.connectPlayer(creator.token, 'creator', messages)
    const wsPlayer2 = await c.connectPlayer(player2.token, 'player2', messages)
    const wsPlayer3 = await c.connectPlayer(player3.token, 'player3', messages)
    const wsPlayer4 = await c.connectPlayer(player4.token, 'player4', messages)

    // Map player IDs to their details for easy access
    const players: Record<string, any> = {
      [creator.id]: { user: creator, ws: wsCreator, token: creator.token, name: 'creator', messages: messages.creator },
      [player2.id]: { user: player2, ws: wsPlayer2, token: player2.token, name: 'player2', messages: messages.player2 },
      [player3.id]: { user: player3, ws: wsPlayer3, token: player3.token, name: 'player3', messages: messages.player3 },
      [player4.id]: { user: player4, ws: wsPlayer4, token: player4.token, name: 'player4', messages: messages.player4 },
    }

    await c.setReady(creator.token, 'ready')
    await c.setReady(player2.token, 'ready')
    await c.setReady(player3.token, 'ready')
    await c.setReady(player4.token, 'ready')

    await c.startMatch(creator.token)

    // Wait for the auction-start event to get the seller queue
    // Use the creator's websocket connection (wsCreator)
    const matchStartedEvent = await c.waitForMessage(wsCreator, 'auction-start')
    const sq: string[] = matchStartedEvent.auction.sellerQueue
    logger.info(`Seller queue determined: ${sq.map(id => players[id].name).join(', ')}`)

    expect(sq).toHaveLength(4) // Ensure queue length matches players length

    // --- Round 1 ---
    const sellerId1 = sq[0]
    const seller1 = players[sellerId1]
    logger.info(`Round 1: Seller is ${seller1.name}`)
    await c.saleItem(seller1.ws, [
      { item: 'triangle', quantity: 1 },
      { item: 'square', quantity: 1 },
    ], sellerId1)

    // Other players bid
    await c.placeBid(players[sq[1]].ws, 50, 1, sq[1])
    await c.placeBid(players[sq[2]].ws, 100, 1, sq[2])
    // player 2 wins: 400,
    await c.waitForMessage(wsCreator, 'round-end')
    // --- Round 2 ---
    const sellerId2 = sq[1]
    const seller2 = players[sellerId2]
    logger.info(`Round 2: Seller is ${seller2.name}`)
    await c.saleItem(seller2.ws, [
      { item: 'triangle', quantity: 1 },
    ], sellerId2)
    // Other players bid
    await c.placeBid(players[sq[2]].ws, 50, 2, sq[2])
    await c.placeBid(players[sq[0]].ws, 100, 2, sq[0])
    await c.placeBid(players[sq[3]].ws, 150, 2, sq[3])
    // player 3 wins: 350,
    await c.waitForMessage(wsCreator, 'round-end')

    // --- Round 3 ---
    const sellerId3 = sq[2]
    const seller3 = players[sellerId3]
    logger.info(`Round 3: Seller is ${seller3.name}`)
    await c.saleItem(seller3.ws, [
      { item: 'circle', quantity: 1 },
    ], sellerId3)
    // Other players bid
    await c.placeBid(players[sq[0]].ws, 50, 3, sq[0])
    // should be ignored
    await c.placeBid(players[sq[0]].ws, 100, 3, sq[0])
    await c.placeBid(players[sq[1]].ws, 150, 3, sq[1])

    // --- Check Final State ---
    // Wait for the auction-end event on the creator's websocket
    const leaderboard = await c.waitForMessage(wsCreator, 'auction-end') // Increased timeout

    logger.info(`Match ended event received: ${JSON.stringify(leaderboard)}`)

    // Basic structural checks for the leaderboard
    expect(leaderboard).toBeDefined()
    // Assuming the event structure is { type: 'auction-end', leaderboard: { ... } }
    expect(leaderboard.leaderboard).toBeDefined()
    expect(leaderboard.leaderboard.leaderboard).toBeInstanceOf(Array)
    expect(leaderboard.leaderboard.removed).toBeInstanceOf(Array)

    // Check the final state (Keep the specific checks as they were)
    expect(leaderboard.leaderboard).toEqual({
      'leaderboard': [
        {
          'id': sq[0],
          'money': 630,
          'position': 1,
          'inventory': {
            'items': [
              { 'item': 'triangle', 'quantity': 2 },
              { 'item': 'square', 'quantity': 2 },
              { 'item': 'circle', 'quantity': 3 },
            ],
          },
        },
        {
          'id': sq[1],
          'money': 540,
          'position': 2,
          'inventory': {
            'items': [
              { 'item': 'triangle', 'quantity': 2 },
              { 'item': 'square', 'quantity': 3 },
              { 'item': 'circle', 'quantity': 4 },
            ],
          },
        }
      ],
      'removed': [
        {
          'id': sq[2],
          'money': 610,
          'inventory': {
            'items': [
              { 'item': 'triangle', 'quantity': 4 },
              { 'item': 'square', 'quantity': 4 },
              { 'item': 'circle', 'quantity': 2 },
            ],
          },
        },
        {
          'id': sq[3],
          'money': 440,
          'inventory': {
            'items': [
              { 'item': 'triangle', 'quantity': 4 },
              { 'item': 'square', 'quantity': 3 },
              { 'item': 'circle', 'quantity': 3 },
            ],
          },
        },
      ]
    })


    // Close connections
    wsCreator.close()
    wsPlayer2.close()
    wsPlayer3.close()
    wsPlayer4.close()
    // Add a small delay to allow sockets to close gracefully before jest exits
    await c.waitFor(500)
  })
})