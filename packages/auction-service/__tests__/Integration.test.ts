import WebSocket, { Server } from 'ws'
import { createServer } from 'http'
import { WebSocketAdapter } from '../src/adapters/WebSocketAdapter'
import logger from '../src/utils/Logger'
import { AuctionController } from '../src/controllers/AuctionController'
import { AuctionServiceImpl } from '../src/services/AuctionServiceImpl'
import { AuctionService } from '../src/services/AuctionService'

describe('Auction System Integration Test', () => {
  let server: Server
  let httpServer: any
  let adapter: WebSocketAdapter
  let service: AuctionService
  let port: number
  beforeEach(done => {
    // Set up the HTTP server and WebSocket server before each test
    httpServer = createServer()
    adapter = new WebSocketAdapter({ server: httpServer })
    service = new AuctionServiceImpl()
    const controller = new AuctionController(service, adapter, adapter)
    server = adapter.getServer()

    httpServer.listen(0, () => {
      const address = httpServer.address()
      if (address && typeof address === 'object') {
        port = address.port // Use dynamic port
        logger.info(`Test server started on port ${port}`)
        done()
      }
    })
  })

  afterEach(done => {
    // Close WebSocket server and HTTP server after each test
    server.close(() => {
      httpServer.close(done)
    })
  })
  const connectPlayer = (player: WebSocket, id: string, messages: Record<string, any[]>) => {
    return new Promise<void>((resolve, reject) => {
      player.on('open', () => {
        logger.info(`${id} connected`)
        resolve()
      })
      player.on('message', message => {
        messages[id].push(JSON.parse(message.toString()))
      })
      player.on('error', reject)
    })
  }

  it('should simulate a round with players', async () => {
    await service.createAuction({
      id: 'auction1',
      players: [
        { id: 'player1', money: 100, inventory: new Map([['square', 2]]), status: 'active' },
        { id: 'player2', money: 100, inventory: new Map([['square', 2]]), status: 'active' },
        { id: 'player3', money: 100, inventory: new Map([['square', 2]]), status: 'active' },
      ],
      maxRound: 3,
      sellerQueue: ['player1', 'player2', 'player3'],
      currentRound: 1,
      currentSale: undefined,
      currentBid: undefined,
      startTimestamp: new Date(),
    })
    const player1 = new WebSocket(`ws://localhost:${port}/player1`)
    const player2 = new WebSocket(`ws://localhost:${port}/player2`)
    const player3 = new WebSocket(`ws://localhost:${port}/player3`)

    const messages: Record<string, any[]> = {
      player1: [],
      player2: [],
      player3: [],
    }
    await Promise.all([
      connectPlayer(player1, 'player1', messages),
      connectPlayer(player2, 'player2', messages),
      connectPlayer(player3, 'player3', messages),
    ])

    // Player 1 starts a sale
    player1.send(JSON.stringify({ type: 'sell', sale: { items: [{ item: 'square', quantity: 1 }] } }))

    // Players 2 and 3 place bids
    player2.send(JSON.stringify({ type: 'bid', bid: { amount: 50, round: 1 } }))
    player3.send(JSON.stringify({ type: 'bid', bid: { amount: 100, round: 1 } }))

    // Allow time for messages to propagate
    await new Promise(resolve => setTimeout(resolve, 500))

    // Validate messages received by players
    expect(messages.player1.length).toBeGreaterThan(0) // Player 1 should receive updates
    expect(messages.player2.length).toBeGreaterThan(0) // Player 2 should receive updates
    logger.info(messages.player3)
    expect(messages.player3.pop().auction.currentBid).toStrictEqual({
      amount: 100,
      round: 1,
      playerId: 'player3',
      timestamp: expect.any(String),
    }) // Player 3 should receive updates

    // Validate specific auction updates
    const auctionUpdates = messages.player1.filter(msg => msg.type === 'auction')
    expect(auctionUpdates.length).toBeGreaterThan(0)
    expect(auctionUpdates[0].auction.sellerQueue).toContain('player1')

    // Close connections
    player1.close()
    player2.close()
    player3.close()
  })

  async function waitToReceiveMessage() {
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  async function waitToEndRound(auctionId: string) {
    await waitToReceiveMessage()
    await service.endRound(auctionId)
    await waitToReceiveMessage()
  }

  it('should simulate a full match with players', async () => {
    await service.createAuction({
      id: 'auction1',
      players: [
        { id: 'player1', money: 100, inventory: new Map([['square', 2]]), status: 'active' },
        { id: 'player2', money: 100, inventory: new Map([['square', 2]]), status: 'active' },
        { id: 'player3', money: 100, inventory: new Map([['square', 2]]), status: 'active' },
      ],
      maxRound: 3,
      sellerQueue: ['player1', 'player2', 'player3'],
      currentRound: 1,
      currentSale: undefined,
      currentBid: undefined,
      startTimestamp: new Date(),
    })
    const player1 = new WebSocket(`ws://localhost:${port}/player1`)
    const player2 = new WebSocket(`ws://localhost:${port}/player2`)
    const player3 = new WebSocket(`ws://localhost:${port}/player3`)

    const messages: Record<string, any[]> = { player1: [], player2: [], player3: [] }
    await Promise.all([
      connectPlayer(player1, 'player1', messages),
      connectPlayer(player2, 'player2', messages),
      connectPlayer(player3, 'player3', messages),
    ])

    // Player 1 starts a sale
    player1.send(JSON.stringify({ type: 'sell', sale: { items: [{ item: 'square', quantity: 1 }] } }))
    // Players 2 and 3 place bids
    player2.send(JSON.stringify({ type: 'bid', bid: { amount: 50, round: 1 } }))
    player3.send(JSON.stringify({ type: 'bid', bid: { amount: 55, round: 1 } }))
    await waitToEndRound('auction1')
    //expect(messages.player1.length).toBe(4)
    expect(messages.player3.pop().auction.players[2].money).toBe(45)
    expect(messages.player2.pop().auction.players[1].money).toBe(100)
    expect(messages.player1.pop().auction.players[0].money).toBe(155)
    // Player 2 starts a sale
    player2.send(JSON.stringify({ type: 'sell', sale: { items: [{ item: 'square', quantity: 1 }] } }))
    // no bids
    await waitToEndRound('auction1')
    expect(messages.player3.pop().auction.players[2].money).toBe(45)
    expect(messages.player2.pop().auction.players[1].money).toBe(100)
    expect(messages.player1.pop().auction.players[0].money).toBe(155)
    // Player 2 sends an old bid that should be ignored
    player2.send(JSON.stringify({ type: 'bid', bid: { amount: 50, round: 1 } }))
    //expect(messages.player2.length).toBe(6);

    // Player 3 starts a sale
    player3.send(JSON.stringify({ type: 'sell', sale: { items: [{ item: 'square', quantity: 1 }] } }))
    await waitToReceiveMessage()
    // Player 1 places a bid
    player1.send(JSON.stringify({ type: 'bid', bid: { amount: 60, round: 3 } }))
    player2.send(JSON.stringify({ type: 'bid', bid: { amount: 70, round: 3 } }))
    await waitToEndRound('auction1')
    expect(messages.player2.pop().auction.players[1].money).toBe(30)
    expect(messages.player3.pop().auction.players[2].money).toBe(115)

    // Close connections
    player1.close()
    player2.close()
    player3.close()
  })

  it('should handle player disconnecting and reconnecting during their turn', async () => {
    await service.createAuction({
      id: 'auction1',
      players: [
        { id: 'player1', money: 100, inventory: new Map([['triangle', 2]]), status: 'active' },
        { id: 'player2', money: 100, inventory: new Map([['triangle', 1]]), status: 'active' },
        { id: 'player3', money: 100, inventory: new Map([['triangle', 1]]), status: 'active' },
      ],
      maxRound: 2,
      sellerQueue: ['player1', 'player2', 'player3'],
      currentRound: 1,
      currentSale: undefined,
      currentBid: undefined,
      startTimestamp: new Date(),
    })

    const player1 = new WebSocket(`ws://localhost:${port}/player1`)
    const player2 = new WebSocket(`ws://localhost:${port}/player2`)
    const player3 = new WebSocket(`ws://localhost:${port}/player3`)

    const messages: Record<string, any[]> = { player1: [], player2: [], player3: [] }
    await Promise.all([
      connectPlayer(player1, 'player1', messages),
      connectPlayer(player2, 'player2', messages),
      connectPlayer(player3, 'player3', messages),
    ])

    // Player 1 starts a sale
    player1.send(JSON.stringify({ type: 'sell', sale: { items: [{ item: 'triangle', quantity: 1 }] } }))
    player2.send(JSON.stringify({ type: 'bid', bid: { amount: 50, round: 1 } }))

    await waitToEndRound('auction1')
    // Player 2 disconnects during their turn
    player2.close()
    await waitToReceiveMessage()
    // Player 2 reconnects and starts a sale
    const player2Reconnect = new WebSocket(`ws://localhost:${port}/player2`)
    await connectPlayer(player2Reconnect, 'player2', messages)

    player2Reconnect.send(JSON.stringify({ type: 'sell', sale: { items: [{ item: 'triangle', quantity: 1 }] } }))
    player3.send(JSON.stringify({ type: 'bid', bid: { amount: 50, round: 2 } }))

    await waitToEndRound('auction1')
    // Validate auction behavior
    expect(messages.player3.pop().auction.players[2].money).toBe(50) // Player3 spent 50
    expect(messages.player2.pop().auction.players[1].money).toBe(100) // Player2 received the bid
    expect(messages.player1.pop().auction.players[0].money).toBe(150) // Player1 sold the item

    player1.close()
    player2Reconnect.close()
    player3.close()
  })
  it('should handle player disconnecting before their turn', async () => {
    await service.createAuction({
      id: 'auction1',
      players: [
        { id: 'player1', money: 100, inventory: new Map([['triangle', 2]]), status: 'active' },
        { id: 'player2', money: 100, inventory: new Map([['triangle', 1]]), status: 'active' },
        { id: 'player3', money: 100, inventory: new Map([['triangle', 1]]), status: 'active' },
      ],
      maxRound: 3,
      sellerQueue: ['player1', 'player2', 'player3'],
      currentRound: 1,
      currentSale: undefined,
      currentBid: undefined,
      startTimestamp: new Date(),
    })

    const player1 = new WebSocket(`ws://localhost:${port}/player1`)
    const player2 = new WebSocket(`ws://localhost:${port}/player2`)
    const player3 = new WebSocket(`ws://localhost:${port}/player3`)

    const messages: Record<string, any[]> = { player1: [], player2: [], player3: [] }
    await Promise.all([
      connectPlayer(player1, 'player1', messages),
      connectPlayer(player2, 'player2', messages),
      connectPlayer(player3, 'player3', messages),
    ])

    // Player 1 starts a sale
    player1.send(JSON.stringify({ type: 'sell', sale: { items: [{ item: 'triangle', quantity: 1 }] } }))
    player2.send(JSON.stringify({ type: 'bid', bid: { amount: 50, round: 1 } }))
    // Player 2 disconnects before their turn
    player2.close()
    await waitToReceiveMessage()
    await waitToEndRound('auction1')

    // Player 2 reconnects and starts a sale
    const player2Reconnect = new WebSocket(`ws://localhost:${port}/player2`)
    await connectPlayer(player2Reconnect, 'player2', messages)
    // Player 2 cannot start a new sale now because he should be skipped
    player2Reconnect.send(JSON.stringify({ type: 'sell', sale: { items: [{ item: 'triangle', quantity: 1 }] } }))
    // Player 3 can start a sale
    player3.send(JSON.stringify({ type: 'sell', sale: { items: [{ item: 'triangle', quantity: 1 }] } }))
    await waitToReceiveMessage()
    // Player 1 bid
    player1.send(JSON.stringify({ type: 'bid', bid: { amount: 30, round: 2 } }))
    // Player 2 can also bid
    player2Reconnect.send(JSON.stringify({ type: 'bid', bid: { amount: 50, round: 2 } }))
    // End round
    await waitToEndRound('auction1')

    // Now player 1 can sell
    player1.send(JSON.stringify({ type: 'sell', sale: { items: [{ item: 'triangle', quantity: 1 }] } }))
    // Player 3 can bid
    player3.send(JSON.stringify({ type: 'bid', bid: { amount: 50, round: 3 } }))
    await waitToEndRound('auction1')

    expect(messages.player3.pop().auction.players[2].money).toBe(100) // Player3 spent 50
    expect(messages.player2.pop().auction.players[1].money).toBe(0) // Player2 received the bid
    expect(messages.player1.pop().auction.players[0].money).toBe(200) // Player1 sold the item

    player1.close()
    player2Reconnect.close()
    player3.close()
  })
})
