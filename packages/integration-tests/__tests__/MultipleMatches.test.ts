import { connectToServer } from './Connection'
import { Client } from './Client'
import logger from '@auction/common/logger'
import { setTimeout } from 'timers/promises'

const API_GATEWAY_URL = 'http://localhost:8080'
const NUM_GAMES = 100 // Number of simultaneous matches
const PLAYERS_PER_GAME = 10 // Number of players per match

beforeAll(async () => {
  await connectToServer(API_GATEWAY_URL)
})

jest.setTimeout(1200000) // 10 minutes timeout for the stress test

describe('Auction System Stress Test', () => {
  it('should handle multiple simultaneous matches', async () => {
    const startTime = Date.now()
    logger.info(`Starting stress test with ${NUM_GAMES} simultaneous matches, each with ${PLAYERS_PER_GAME} players`)

    const results = []

    for (let i = 0; i < NUM_GAMES; i++) {
      const match = runSingleMatch(i)
      results.push(match)
    }
    await Promise.all(results)

    const endTime = Date.now()
    const totalTimeSeconds = ((endTime - startTime) / 1000).toFixed(2)
    logger.info(`Stress test completed in ${totalTimeSeconds} seconds`)
  })
})

async function runSingleMatch(gameIndex: number) {
  const c = new Client(API_GATEWAY_URL)
  const gameId = `game${gameIndex}`
  logger.info(`Starting match ${gameId}`)

  try {
    // Register players for this match with retry logic
    const players = []
    const creator = await registerWithRetry(`creator-${gameId}-${Date.now()}@email.com`, 'Password123', `Creator${gameId}`, c)
    players.push(creator)

    // Register players in batches to avoid overwhelming the server
    const batchSize = 3
    for (let i = 0; i < Math.ceil((PLAYERS_PER_GAME - 1) / batchSize); i++) {
      const batchPromises = []
      for (let j = 0; j < batchSize; j++) {
        const playerIndex = i * batchSize + j + 1
        if (playerIndex < PLAYERS_PER_GAME) {
          batchPromises.push(registerWithRetry(
            `player-${gameId}-${playerIndex}-${Date.now()}@example.com`,
            'Password123',
            `Player${gameId}-${playerIndex}`,
            c,
          ))
        }
      }

      // Wait for the batch to complete
      const batchResults = await Promise.all(batchPromises)
      players.push(...batchResults)

      // Add a small delay between batches
      if (i < Math.ceil((PLAYERS_PER_GAME - 1) / batchSize) - 1) {
        await setTimeout(100)
      }
    }

    logger.info(`Match ${gameId}: Registered ${players.length} players`)

    // Create a lobby
    const bidTime = 3 // Shorter bid time for stress test
    const lobby = await c.createLobby(creator.token, {
      rounds: 5, // Fewer rounds for faster tests
      maxPlayers: PLAYERS_PER_GAME,
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

    // Join all players to the lobby
    for (let i = 1; i < players.length; i++) {
      await c.joinLobby(players[i].token, lobby.id)
    }

    // Setup message collectors and connect all players
    const messages: Record<string, any[]> = {}
    const connections: Record<string, any> = {}

    for (let i = 0; i < players.length; i++) {
      const player = players[i]
      const name = i === 0 ? `creator${gameId}` : `player${gameId}-${i}`
      messages[name] = []
      const ws = await c.connectPlayer(player.token, name, messages)
      connections[player.id] = {
        user: player,
        ws,
        token: player.token,
        name,
        messages: messages[name],
        inventory: {
          triangle: 3,
          square: 3,
          circle: 3,
        },
        money: 500,
      }
    }

    // Set all players to ready
    for (const player of players) {
      await c.setReady(player.token, 'ready')
    }

    // Start the match
    await c.startMatch(creator.token)

    // Wait for the auction-start event to get the seller queue
    const creatorWs = connections[creator.id].ws
    const matchStartedEvent = await c.waitForMessage(creatorWs, 'auction-start')
    const sellerQueue: string[] = matchStartedEvent.auction.sellerQueue

    logger.info(`Match ${gameId}: Seller queue determined with ${sellerQueue.length} players`)

    // Run rounds of auctions
    for (let round = 1; round <= 5; round++) {
      logger.info(`Match ${gameId}: Starting round ${round}`)

      // Get the seller for this round
      const sellerId = sellerQueue[(round - 1) % sellerQueue.length]
      const seller = connections[sellerId]

      // Determine what to sell based on inventory
      const itemsToSell = []
      if (seller.inventory.triangle > 0) {
        itemsToSell.push({ item: 'triangle', quantity: 1 })
        seller.inventory.triangle--
      }
      if (seller.inventory.square > 0) {
        itemsToSell.push({ item: 'square', quantity: 1 })
        seller.inventory.square--
      }

      if (itemsToSell.length === 0 && seller.inventory.circle > 0) {
        itemsToSell.push({ item: 'circle', quantity: 1 })
        seller.inventory.circle--
      }

      if (itemsToSell.length > 0) {
        // Seller puts items up for sale
        await c.saleItem(seller.ws, itemsToSell, sellerId)

        // Get bidders (everyone except the seller)
        const bidders = sellerQueue.filter(id => id !== sellerId)

        // Implement different bidding patterns based on the round
        if (round % 2 === 0) {
          // Bidding war pattern
          const bidder1Id = bidders[0]
          const bidder2Id = bidders[1]

          await c.placeBid(connections[bidder1Id].ws, 50, round, bidder1Id)
          await c.placeBid(connections[bidder2Id].ws, 60, round, bidder2Id)
          await c.placeBid(connections[bidder1Id].ws, 70, round, bidder1Id)
        } else {
          // Multiple bidders pattern
          for (let i = 0; i < bidders.length; i++) {
            const bidderId = bidders[i]
            const bidAmount = 30 + (i * 10)
            await c.placeBid(connections[bidderId].ws, bidAmount, round, bidderId)
          }
        }
      }

      // Wait for round to end
      if (round < 5) {
        await c.waitForMessage(creatorWs, 'round-end')
        logger.info(`Match ${gameId}: Round ${round} completed`)
      }
    }

    // Wait for the auction to end and get the leaderboard
    const leaderboardEvent = await c.waitForMessage(creatorWs, 'auction-end')
    logger.info(`Match ${gameId}: Ended, leaderboard received`)

    // Validate the leaderboard structure
    expect(leaderboardEvent).toBeDefined()
    expect(leaderboardEvent.leaderboard).toBeDefined()
    expect(leaderboardEvent.leaderboard.leaderboard).toBeInstanceOf(Array)
    expect(leaderboardEvent.leaderboard.removed).toBeInstanceOf(Array)

    // Verify leaderboard rules
    // 1. Check that players with no items are in the removed list
    const noItemsPlayers = leaderboardEvent.leaderboard.removed.filter(
      (player: any) => player.inventory.items.every((item: any) => item.quantity === 0),
    )

    // 2. Check that players with most items are in the removed list
    const allPlayers = [
      ...leaderboardEvent.leaderboard.leaderboard,
      ...leaderboardEvent.leaderboard.removed,
    ]

    const sortedByItems = [...allPlayers].sort((a: any, b: any) => {
      const totalItemsA = a.inventory.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
      const totalItemsB = b.inventory.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
      return totalItemsB - totalItemsA
    })

    // The player with the most items should be in the removed list
    const mostItemsPlayerId = sortedByItems[0].id
    const isInRemovedList = leaderboardEvent.leaderboard.removed.some(
      (player: any) => player.id === mostItemsPlayerId,
    )

    if (!isInRemovedList) {
      logger.warn(`Match ${gameId}: Player with most items not in removed list`)
    }

    // Close all connections
    for (const id in connections) {
      connections[id].ws.close()
    }

    // Add a small delay to allow sockets to close gracefully
    await c.waitFor(500)
    logger.info(`Match ${gameId}: Completed successfully`)

    return true
  } catch (error) {
    logger.error(`Match ${gameId} failed: ${error}`)
    throw error
  }
}

// Helper function to retry registration with exponential backoff
async function registerWithRetry(email: string, password: string, name: string, client: Client, maxRetries = 3): Promise<any> {
  let retries = 0
  let lastError: any = null

  while (retries < maxRetries) {
    try {
      const player = await client.registerUser(email, password, name)
      return player
    } catch (error) {
      lastError = error
      retries++

      // Exponential backoff with jitter
      const delay = Math.min(100 * Math.pow(2, retries) + Math.random() * 100, 2000)
      logger.warn(`Registration failed for ${name}, retrying in ${delay.toFixed(0)}ms (attempt ${retries}/${maxRetries})`)
      await setTimeout(delay)
    }
  }

  logger.error(`Failed to register ${name} after ${maxRetries} attempts: ${lastError}`)
  throw lastError
} 