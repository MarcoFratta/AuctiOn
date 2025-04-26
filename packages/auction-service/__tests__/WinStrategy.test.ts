import { WinStrategyFactory } from '../src/domain/auctions/WinStrategyFactory'
import { AuctionInfo } from '../src/schemas/Auction'
import { Player } from '../src/schemas/Player'


describe('WinStrategyFactory', () => {
  function createPlayer(id: string, money: number, inventory: Map<string, number>): Player {
    return {
      id,
      money,
      status: 'not-connected',
      inventory, // Inventory passed as a Map
    } as Player
  }

  function createAuction(players: Player[]): AuctionInfo {
    return {
      id: 'auction-1',
      maxPlayers: 4,
      maxRound: 5,
      startAmount: 1000,
      startInventory: {}, // Mocked inventory data
      bidTime: 60,
      players: players,
      sellerQueue: players.map(player => player.id),
      currentRound: 1,
      currentSale: undefined,
      currentBid: undefined,
      startTimestamp: new Date().toISOString(),
    } as AuctionInfo
  }

  describe('byMoney', () => {
    it('sorts players correctly by money', () => {
      const auction = createAuction([
        createPlayer('p1', 500, new Map([['triangle', 10], ['square', 20]])),
        createPlayer('p2', 700, new Map([['square', 5]])),
        createPlayer('p3', 300, new Map([['circle', 3]])),
      ])

      const strategy = WinStrategyFactory.byMoney()
      const leaderboard = strategy.computeLeaderboard(auction)
      expect(leaderboard.leaderboard.map(p => p.position)).toEqual([1, 2, 3])
    })


    it('handles an empty auction without errors', () => {
      const auction = createAuction([])

      const strategy = WinStrategyFactory.byMoney()
      const leaderboard = strategy.computeLeaderboard(auction)

      expect(leaderboard.leaderboard).toHaveLength(0)
      expect(leaderboard.removed).toHaveLength(0)
    })

    it('handles a single-player auction correctly', () => {
      const auction = createAuction([createPlayer('p1', 500, new Map([['triangle', 10]]))])
      const strategy = WinStrategyFactory.byMoney()
      const leaderboard = strategy.computeLeaderboard(auction)

      expect(leaderboard.leaderboard).toHaveLength(1)
      expect(leaderboard.leaderboard[0].id).toBe('p1')
      expect(leaderboard.leaderboard[0].position).toBe(1)
    })
    it('handles a tie correctly with two players having the same amount of money', () => {
      const auction = createAuction([
        createPlayer('p1', 500, new Map([['triangle', 10], ['square', 20]])),
        createPlayer('p2', 500, new Map([['square', 5]])),
        createPlayer('p3', 300, new Map([['circle', 3]])),
      ])

      const strategy = WinStrategyFactory.byMoney()
      const leaderboard = strategy.computeLeaderboard(auction)

      expect(leaderboard.leaderboard.map(p => p.id)).toEqual(['p1', 'p2', 'p3']) // Order should remain the same
      expect(leaderboard.leaderboard.map(p => p.position)).toEqual([1, 1, 3]) // p1 and p2 tied for first place
    })
  })

  describe('byWeight', () => {
    it('sorts players correctly by inventory weight', () => {
      const auction = createAuction([
        createPlayer('p1', 500, new Map([['triangle', 10], ['square', 20]])),
        createPlayer('p2', 700, new Map([['square', 5]])),
        createPlayer('p3', 300, new Map([['circle', 3]])),
      ])

      const strategy = WinStrategyFactory.byWeight()
      const leaderboard = strategy.computeLeaderboard(auction)

      // Weight calculation: p1 = (10 * 2) + (20 * 1) = 60, p2 = 5 * 1 = 5, p3 = 3 * 3 = 9
      expect(leaderboard.leaderboard.map(p => p.id)).toEqual(['p1', 'p3', 'p2'])
      expect(leaderboard.leaderboard.map(p => p.position)).toEqual([1, 2, 3])
    })

    it('maintains order for players with equal weight', () => {
      const auction = createAuction([
        createPlayer('p1', 500, new Map([['triangle', 10], ['square', 20]])),
        createPlayer('p2', 700, new Map([['square', 5]])),
        createPlayer('p3', 300, new Map([['circle', 3]])),
      ])

      const strategy = WinStrategyFactory.byWeight()
      const leaderboard = strategy.computeLeaderboard(auction)

      // Weight calculation: p1 = (10 * 2) + (20 * 1) = 60, p2 = 5 * 1 = 5, p3 = 3 * 3 = 9
      expect(leaderboard.leaderboard.map(p => p.id)).toEqual(['p1', 'p3', 'p2'])
      expect(leaderboard.leaderboard.map(p => p.position)).toEqual([1, 2, 3])
    })

    it('handles an empty auction without errors', () => {
      const auction = createAuction([])

      const strategy = WinStrategyFactory.byWeight()
      const leaderboard = strategy.computeLeaderboard(auction)

      expect(leaderboard.leaderboard).toHaveLength(0)
      expect(leaderboard.removed).toHaveLength(0)
    })

    it('handles a single-player auction correctly', () => {
      const auction = createAuction([createPlayer('p1', 500, new Map([['triangle', 10]]))])

      const strategy = WinStrategyFactory.byWeight()
      const leaderboard = strategy.computeLeaderboard(auction)

      expect(leaderboard.leaderboard).toHaveLength(1)
      expect(leaderboard.leaderboard[0].id).toBe('p1')
      expect(leaderboard.leaderboard[0].position).toBe(1)
    })
    it('handles a tie correctly with two players having the same inventory weight', () => {
      const auction = createAuction([
        createPlayer('p1', 500, new Map([['triangle', 10], ['square', 20]])), // Weight = (10 * 2) + (20 * 1) = 60
        createPlayer('p2', 700, new Map([['triangle', 10], ['square', 20]])), // Same weight = 60
        createPlayer('p3', 300, new Map([['circle', 3]])), // Weight = 3 * 3 = 9
      ])

      const strategy = WinStrategyFactory.byWeight()
      const leaderboard = strategy.computeLeaderboard(auction)

      expect(leaderboard.leaderboard.map(p => p.id)).toEqual(['p1', 'p2', 'p3']) // Order should remain the same
      expect(leaderboard.leaderboard.map(p => p.position)).toEqual([1, 1, 3]) // p1 and p2 tied for first place
    })
  })
})
