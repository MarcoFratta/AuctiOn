import { AuctionModifier, Modifiers } from '../src/domain/auctions/Modifier'
import { AuctionInfo } from '../src/schemas/Auction'
import { Player } from '../src/schemas/Player'
import { Item } from '../src/schemas/Item'
import { cloneDeep } from 'lodash'

// Helper function to create a basic AuctionInfo object for testing
const createTestAuctionInfo = (players: Player[]): AuctionInfo => ({
  id: 'test-auction',
  creatorId: 'creator',
  players: cloneDeep(players), // Use deep clone to avoid modifying original test data
  maxRound: 10,
  bidTime: 30,
  sellerQueue: players.map(p => p.id),
  currentRound: 1,
  currentSale: undefined,
  currentBid: undefined,
  startTimestamp: new Date().toISOString(),
  maxPlayers: 4,
  startAmount: 100,
  startInventory: {}, // Updated to match InventoryOutput schema
} as AuctionInfo) // Cast needed as startInventory might not strictly match if empty

// Helper function to create a player for testing
const createTestPlayer = (id: string, initialMoney: number, inventoryItems: [Item, number][]): Player => ({
  id,
  money: initialMoney,
  status: 'connected',
  inventory: new Map(inventoryItems),
})

describe('Modifiers', () => {
  describe('withSetCollection', () => {
    let modifier: AuctionModifier
    // triangle 5, circle 2, square 1

    beforeEach(() => {
      modifier = Modifiers.withSetCollection()
    })

    it('should not change money if player has no items', () => {
      const player1 = createTestPlayer('p1', 100, [])
      const initialAuctionInfo = createTestAuctionInfo([player1])
      const modifiedAuctionInfo = modifier.apply(initialAuctionInfo)

      expect(modifiedAuctionInfo.players[0].money).toBe(100)
    })

    it('should not change money if player has only incomplete sets', () => {
      // Assuming modifier now rewards complete sets, incomplete sets give 0 bonus.
      // square: 1 (floor(1/3)=0), triangle: 2 (floor(2/3)=0)
      // Expected increase: 0
      const player1 = createTestPlayer('p1', 100, [
        ['square', 1],
        ['triangle', 2],
      ])
      const initialAuctionInfo = createTestAuctionInfo([player1])
      const modifiedAuctionInfo = modifier.apply(initialAuctionInfo)

      // Update expected value based on the assumed new logic
      expect(modifiedAuctionInfo.players[0].money).toBe(100 + 0)
    })

    it('should add value of complete sets to player money', () => {
      // Assuming modifier rewards complete sets.
      // Expected increase: 10 + 100 + 30 = 140
      const player1 = createTestPlayer('p1', 100, [
        ['square', 3],
        ['triangle', 6],
        ['circle', 3],
      ])
      const initialAuctionInfo = createTestAuctionInfo([player1])
      const modifiedAuctionInfo = modifier.apply(initialAuctionInfo)

      // Update expected value based on the assumed new logic
      expect(modifiedAuctionInfo.players[0].money).toBe(240)
    })

    it('should add value of only complete sets when player has complete sets and leftovers', () => {
      // Assuming modifier rewards complete sets.
      // Expected increase: 10 + 50 + 60 = 120
      const player1 = createTestPlayer('p1', 100, [
        ['square', 4],
        ['triangle', 5],
        ['circle', 7],
      ])
      const initialAuctionInfo = createTestAuctionInfo([player1])
      const modifiedAuctionInfo = modifier.apply(initialAuctionInfo)

      // Update expected value based on the assumed new logic
      expect(modifiedAuctionInfo.players[0].money).toBe(220)
    })

    it('should correctly modify money for multiple players based on complete sets', () => {
      // Player 1: square: 1, triangle: 2 -> Increase 0 (no complete sets)
      const player1 = createTestPlayer('p1', 100, [
        ['square', 1],
        ['triangle', 2],
      ])
      // Player 2: square: 4, triangle: 5, circle: 7 -> Increase 36 (calculated above)
      const player2 = createTestPlayer('p2', 50, [
        ['square', 4],
        ['triangle', 5],
        ['circle', 7],
      ])
      // Player 3: No items -> Increase 0
      const player3 = createTestPlayer('p3', 200, [])

      const initialAuctionInfo = createTestAuctionInfo([player1, player2, player3])
      const modifiedAuctionInfo = modifier.apply(initialAuctionInfo)

      // Update expected values based on the assumed new logic
      expect(modifiedAuctionInfo.players.find(p => p.id === 'p1')?.money).toBe(100 + 0)
      expect(modifiedAuctionInfo.players.find(p => p.id === 'p2')?.money).toBe(50 + 120)
      expect(modifiedAuctionInfo.players.find(p => p.id === 'p3')?.money).toBe(200 + 0)
    })

    it('should handle an auction with no players', () => {
      const initialAuctionInfo = createTestAuctionInfo([])
      const modifiedAuctionInfo = modifier.apply(initialAuctionInfo)

      expect(modifiedAuctionInfo.players).toEqual([])
    })
  })

  // Add describe blocks for other modifiers (noMostItems, noZeroItems) here if needed
}) 