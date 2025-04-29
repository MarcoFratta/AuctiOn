import { AuctionServiceImpl } from '../src/services/AuctionServiceImpl'
import { AuctionService } from '../src/services/AuctionService'
import { AuctionConfig, AuctionInfo } from '../src/schemas/Auction'
import { ItemsMap } from '../src/schemas/Player'
import { Bid } from '../src/schemas/Bid'
import { RedisAuctionRepo } from '../src/repositories/RedisAuctionRepo'
import MockRedis from 'ioredis-mock'
import Redis from 'ioredis'
import { Leaderboard } from '../src/schemas/Leaderboard'
import { Sale } from '../src/schemas/Sale'

describe('AuctionService', () => {
  let service: AuctionService
  let redis: Redis

  beforeEach(async () => {
    redis = new MockRedis()
    await redis.flushall()
    service = new AuctionServiceImpl(new RedisAuctionRepo(redis))

  })
  afterAll(async () => {
    redis.disconnect()
  })

  const defaultConfig: AuctionConfig = {
    id: 'auction1',
    maxPlayers: 4,
    maxRound: 3,
    creatorId: 'player1',
    startAmount: 100,
    startInventory: { items: [{ item: 'square', quantity: 2 }] },
    bidTime: 30,
  }
  const joinAndConnectPlayer =
    async (id: string, auction: string): Promise<AuctionInfo> => {
      await service.playerJoin(id, auction)
      return service.setPlayerState(id, 'connected')
    }

  describe('Player Management', () => {
    it('should allow a player to join an auction', async () => {
      await service.createAuction(defaultConfig)
      await service.playerJoin('player1', defaultConfig.id)

      const auction = await service.getAuction(defaultConfig.id)
      expect(auction.players).toContainEqual(
        expect.objectContaining({
          id: 'player1',
          status: 'not-connected',
          money: defaultConfig.startAmount,
          inventory: expect.any(Map),
        }),
      )
    })

    it('should handle player leaving an auction', async () => {
      await service.createAuction(defaultConfig)
      await service.playerJoin('player1', defaultConfig.id)
      const auction = await service.playerLeave('player1', defaultConfig.id)

      expect(auction.players).toHaveLength(0)
    })

    it('should allow setting player state', async () => {
      await service.createAuction(defaultConfig)
      await service.playerJoin('player1', defaultConfig.id)
      await service.setPlayerState('player1', 'not-connected')

      const auction = await service.getAuction(defaultConfig.id)
      const player = auction.players.find(p => p.id === 'player1')
      expect(player?.status).toBe('not-connected')
    })
  })

  describe('Auction Start', () => {
    it('should start an auction', async () => {
      await service.createAuction(defaultConfig)
      await joinAndConnectPlayer('player1', defaultConfig.id)
      await joinAndConnectPlayer('player2', defaultConfig.id)

      await service.startAuction(defaultConfig.id)

      const auction = await service.getAuction(defaultConfig.id)
      expect(auction.sellerQueue).toHaveLength(2)
      expect(auction.currentRound).toBe(1)
      expect(auction.startTimestamp).toBeDefined()
    })

    it('should set up seller queue on start', async () => {
      await service.createAuction(defaultConfig)
      await joinAndConnectPlayer('player1', defaultConfig.id)
      await joinAndConnectPlayer('player2', defaultConfig.id)
      await service.startAuction(defaultConfig.id)

      const auction = await service.getAuction(defaultConfig.id)
      expect(auction.sellerQueue).toContain('player1')
      expect(auction.sellerQueue).toContain('player2')
    })
  })

  it('should create auction with config', async () => {
    const auction = await service.createAuction(defaultConfig)

    expect(auction.id).toBe(defaultConfig.id)
    expect(auction.maxRound).toBe(defaultConfig.maxRound)
    expect(auction.startAmount).toBe(defaultConfig.startAmount)
    expect(auction.startInventory).toEqual(defaultConfig.startInventory)
    expect(auction.bidTime).toBe(defaultConfig.bidTime)
    expect(auction.players).toHaveLength(0)
    expect(auction.currentRound).toBe(1)
    expect(auction.startTimestamp).not.toBeDefined()
  })

  it('should not allow duplicate auction ids', async () => {
    await service.createAuction(defaultConfig)
    await expect(service.createAuction(defaultConfig)).rejects.toThrow(
      `Auction with id ${defaultConfig.id} already exists`,
    )
  })
  const createMockAuction = (): AuctionConfig => ({
    id: 'auction1',
    maxPlayers: 2,
    creatorId: 'player1',
    maxRound: 3,
    startAmount: 100,
    startInventory: { items: [{ item: 'square', quantity: 2 }] },
    bidTime: 30,
  })

  it('should throw an error if a player try to sell but the auction is not started yet', async () => {
    const auction = createMockAuction()
    await service.createAuction(auction)
    await joinAndConnectPlayer('player1', auction.id)
    const sale: Sale = {
      sellerId: 'player1',
      items: new Map([['square', 2]]),
    }
    await expect(service.playerSale(sale)).rejects.toThrow(`Auction not started yet`)
  })
  it('should throw an error if a player bids but there is not a current sale', async () => {
    const auction = createMockAuction()
    await service.createAuction(auction)
    await joinAndConnectPlayer('player1', auction.id)
    const bid: Bid = { playerId: 'player1', round: 1, amount: 50, timestamp: new Date().toISOString() }
    await expect(service.playerBid(bid)).rejects.toThrow(`Cannot place bid without an active sale`)
  })

  it('should allow a player to bid higher than the current bid', async () => {
    const auction = createMockAuction()
    auction.startInventory.items[0].quantity = 5
    await service.createAuction(auction)
    await joinAndConnectPlayer('player1', auction.id)
    await joinAndConnectPlayer('player2', auction.id)
    await service.startAuction(auction.id)
    const sale: Sale = {
      sellerId: 'player1',
      items: new Map([['square', 2]]),
    }
    await service.playerSale(sale)
    const bid: Bid = { playerId: 'player2', round: 1, amount: 50, timestamp: new Date().toISOString() }
    const updatedAuction = await service.playerBid(bid)

    expect(updatedAuction.currentBid).toEqual(bid)
  })

  it('should throw an error if the player has insufficient funds to bid', async () => {
    const auction = createMockAuction()
    auction.startInventory.items[0].quantity = 5
    auction.startAmount = 10
    await service.createAuction(auction)
    await joinAndConnectPlayer('player1', auction.id)
    await joinAndConnectPlayer('player2', auction.id)
    await service.startAuction(auction.id)
    const sale: Sale = {
      sellerId: 'player1',
      items: new Map([['square', 2]]),
    }
    await service.playerSale(sale)

    const bid: Bid = { playerId: 'player2', round: 1, amount: 50, timestamp: new Date().toISOString() }
    await expect(service.playerBid(bid)).rejects.toThrow(`Player with id player2 does not have enough money to place bid`)
  })

  it('should throw an error if the bid round does not match the current round', async () => {
    const auction = createMockAuction()
    auction.startInventory.items[0].quantity = 5
    await service.createAuction(auction)
    await joinAndConnectPlayer('player1', auction.id)
    await joinAndConnectPlayer('player2', auction.id)
    await service.startAuction(auction.id)
    const sale: Sale = {
      sellerId: 'player1',
      items: new Map([['square', 2]]),
    }
    await service.playerSale(sale)

    const bid: Bid = { playerId: 'player2', round: 2, amount: 50, timestamp: new Date().toISOString() }
    await expect(service.playerBid(bid)).rejects.toThrow(`Bid round must match current round`)
  })

  it('should allow a player to sell items', async () => {
    const auction = createMockAuction()
    auction.startInventory.items[0].quantity = 5
    await service.createAuction(auction)
    await joinAndConnectPlayer('player1', auction.id)
    await joinAndConnectPlayer('player2', auction.id)
    await service.startAuction(auction.id)
    const saleItems: ItemsMap = new Map([['square', 2]])
    const sale: Sale = {
      sellerId: 'player1',
      items: saleItems,
    }
    let updatedAuction = await service.playerSale(sale)

    expect(updatedAuction.currentSale).toEqual({
      items: saleItems,
      sellerId: 'player1',
      endTimestamp: undefined,
    })
    updatedAuction = await service.playerBid({
      playerId: 'player2',
      round: 1,
      amount: 50,
      timestamp: new Date().toISOString(),
    })
    updatedAuction = (await service.endRound('auction1')) as AuctionInfo
    expect(updatedAuction.players[1].money).toBe(50)
    expect(updatedAuction.players[0].money).toBe(150)
    expect(updatedAuction.players[0].inventory.get('square')).toBe(3)
    expect(updatedAuction.players[1].inventory.get('square')).toBe(7)
  })

  it('should throw an error if the seller is not the current seller', async () => {
    const auction = createMockAuction()
    await service.createAuction(auction)
    await joinAndConnectPlayer('player1', auction.id)
    await joinAndConnectPlayer('player2', auction.id)
    await service.startAuction(auction.id)

    const saleItems: ItemsMap = new Map([['square', 2]])
    const sale: Sale = {
      sellerId: 'player2',
      items: saleItems,
    }
    await expect(service.playerSale(sale)).rejects.toThrow(`Player with id player2 is not the current seller`)
  })

  it('should end the round and transfer items and money', async () => {
    const auction = createMockAuction()
    auction.startInventory.items[0].quantity = 5
    await service.createAuction(auction)
    await joinAndConnectPlayer('player1', auction.id)
    await joinAndConnectPlayer('player2', auction.id)
    await service.startAuction(auction.id)
    const sale: Sale = {
      sellerId: 'player1',
      items: new Map([['square', 2]]),
    }
    await service.playerSale(sale)
    await service.playerBid({ playerId: 'player2', round: 1, amount: 50, timestamp: new Date().toISOString() })

    const updatedAuction = (await service.endRound('auction1')) as AuctionInfo
    const player1 = updatedAuction.players[0]
    const player2 = updatedAuction.players[1]

    expect(player1.money).toBe(150) // Seller gains money
    expect(player1.inventory.get('square')).toBe(3) // Items reduced
    expect(player2.money).toBe(50) // Bidder loses money
    expect(player2.inventory.get('square')).toBe(7) // Items increased
  })

  it('should end the auction when the last round is completed', async () => {
    const auction = createMockAuction()
    auction.maxRound = 1 // Set only one round
    await service.createAuction(auction)
    await joinAndConnectPlayer('player1', auction.id)
    await service.startAuction(auction.id)

    const endedAuction = (await service.endRound('auction1')) as Leaderboard
    expect(endedAuction).toHaveProperty('leaderboard') // Auction data returned
  })

  it('should throw an error if trying to end a non-existent auction', async () => {
    await expect(service.endRound('invalidAuction'))
      .rejects.toThrow(`Auction with id invalidAuction not found`)
  })
  it('should correctly handle turns for multiple players', async () => {
    const auction = createMockAuction()
    auction.maxPlayers = 5
    auction.maxRound = 5
    auction.startInventory.items.map(item => item.quantity = 5)
    await service.createAuction(auction)
    await joinAndConnectPlayer('player1', auction.id)
    await joinAndConnectPlayer('player2', auction.id)
    await joinAndConnectPlayer('player3', auction.id)
    await service.startAuction(auction.id)

    // Round 1

    await service.playerSale({ sellerId: 'player1', items: new Map([['square', 2]]) })
    const res = await service.endRound('auction1')

    // Round 2
    await service.playerSale({ sellerId: 'player2', items: new Map([['square', 2]]) })
    await service.endRound('auction1')

    // Round 3
    await service.playerSale({ sellerId: 'player3', items: new Map([['square', 2]]) })
    await service.endRound('auction1')

    // Round 4
    await service.playerSale({ sellerId: 'player1', items: new Map([['square', 2]]) })
    await service.endRound('auction1')

    // Round 5
    await service.playerSale({ sellerId: 'player2', items: new Map([['square', 2]]) })
    await service.endRound('auction1')

    await expect(service.playerSale({
      sellerId: 'player3',
      items: new Map([['square', 2]]),
    })).rejects.toThrow()
  })

  it('should not bid if the player is the seller', async () => {
    const auction = createMockAuction()
    auction.startInventory.items[0].quantity = 5
    await service.createAuction(auction)
    await joinAndConnectPlayer('player1', auction.id)
    await service.startAuction(auction.id)
    const sale: Sale = {
      sellerId: 'player1',
      items: new Map([['square', 2]]),
    }
    await service.playerSale(sale)
    await expect(
      service.playerBid({
        playerId: 'player1',
        round: 1,
        amount: 50,
        timestamp: new Date().toISOString(),
      })
    ).rejects.toThrow()
  })
  it('should not allow a player to bid lower or equal than the current bid', async () => {
    const auction = createMockAuction()
    auction.startInventory.items[0].quantity = 5
    await service.createAuction(auction)
    await joinAndConnectPlayer('player1', auction.id)
    await joinAndConnectPlayer('player2', auction.id)
    await service.startAuction(auction.id)
    const sale: Sale = {
      sellerId: 'player1',
      items: new Map([['square', 2]]),
    }
    await service.playerSale(sale)

    await service.playerBid({ playerId: 'player2', round: 1, amount: 50, timestamp: new Date().toISOString() })
    await expect(
      service.playerBid({
        playerId: 'player2',
        round: 1,
        amount: 40,
        timestamp: new Date().toISOString(),
      })
    ).rejects.toThrow()
    await expect(
      service.playerBid({
        playerId: 'player2',
        round: 1,
        amount: 50,
        timestamp: new Date().toISOString(),
      })
    ).rejects.toThrow()
  })
  it('should not allow a player to bid if they do not have enough money', async () => {
    const auction = createMockAuction()
    auction.startAmount = 10
    await service.createAuction(auction)
    await joinAndConnectPlayer('player1', auction.id)
    await joinAndConnectPlayer('player2', auction.id)
    await service.startAuction(auction.id)

    await expect(service.playerBid({
      playerId: 'player2',
      round: 1,
      amount: 50,
      timestamp: new Date().toISOString(),
    })).rejects.toThrow()
  })
  it('should not remove in sale items from the seller if no one bids', async () => {
    const auction = createMockAuction()
    auction.startInventory.items[0].quantity = 5
    await service.createAuction(auction)
    await joinAndConnectPlayer('player1', auction.id)
    await joinAndConnectPlayer('player2', auction.id)
    await service.startAuction(auction.id)
    const sale: Sale = {
      sellerId: 'player1',
      items: new Map([['square', 2]]),
    }
    await service.playerSale(sale)
    await service.endRound('auction1')
    const updatedAuction = await service.getAuction('auction1')
    expect(updatedAuction.players[0].inventory.get('square')).toBe(5)
  })

  it('should skip disconnected players and end the auction if only one player is connected', async () => {
    await service.createAuction(defaultConfig)
    await service.playerJoin('player1', defaultConfig.id)
    await service.playerJoin('player2', defaultConfig.id)
    await service.playerJoin('player3', defaultConfig.id)


    // Set players' states
    await service.setPlayerState('player1', 'connected')
    await service.startAuction(defaultConfig.id)

    const result: Leaderboard = (await service.endRound(defaultConfig.id)) as Leaderboard
    expect(result.removed).toEqual([
        { id: 'player1', money: 100, inventory: { items: [{ item: 'square', quantity: 2 }] } },
        { id: 'player2', money: 100, inventory: { items: [{ item: 'square', quantity: 2 }] } },
        { id: 'player3', money: 100, inventory: { items: [{ item: 'square', quantity: 2 }] } },
      ],
    )
  })

  it('should skip a disconnected player when determining the next seller', async () => {
    await service.createAuction(defaultConfig)
    await joinAndConnectPlayer('player1', defaultConfig.id)
    await joinAndConnectPlayer('player3', defaultConfig.id)
    await service.playerJoin('player2', defaultConfig.id)
    await service.setPlayerState('player2', 'not-connected')
    await service.startAuction(defaultConfig.id)

    const result = (await service.endRound(defaultConfig.id)) as AuctionInfo

    expect(result.currentRound).toBe(2)
    expect(result.players.find(p => p.id === 'player2')?.status).toBe('not-connected')
    expect(result.players.find(p => p.id === 'player1')?.status).toBe('connected')
    expect(result.players.find(p => p.id === 'player3')?.status).toBe('connected')
    expect(result.maxRound).toBe(defaultConfig.maxRound)

    // Player3 should be able to make a sale since player2 is skipped
    const sale: Sale = {
      sellerId: 'player3',
      items: new Map([['square', 1]]),
    }
    await service.playerSale(sale)
  })
  it('should skip the disconnected player also if it is the first player', async () => {
    const auction = createMockAuction()
    auction.maxPlayers = 3
    auction.maxRound = 3
    auction.startInventory.items.map(item => item.quantity = 5)
    await service.createAuction(auction)
    await service.playerJoin('player1', auction.id)
    await joinAndConnectPlayer('player2', auction.id)
    await joinAndConnectPlayer('player3', auction.id)
    await service.setPlayerState('player1', 'not-connected')
    const info = await service.startAuction(auction.id)
    expect(info.currentRound).toBe(1)
    expect(info.sellerQueue).toEqual(['player2', 'player3', 'player1'])
  })
  it('should skip a player if he cannot make a sale', async () => {
    const auction = createMockAuction()
    auction.maxPlayers = 3
    auction.maxRound = 5
    auction.startInventory.items = [{ item: 'square', quantity: 2 }]
    await service.createAuction(auction)
    await joinAndConnectPlayer('player1', auction.id)
    await joinAndConnectPlayer('player2', auction.id)
    await joinAndConnectPlayer('player3', auction.id)
    await service.startAuction(auction.id)
    await service.playerSale({ sellerId: 'player1', items: new Map([['square', 2]]) })
    await service.playerBid({ playerId: 'player2', round: 1, amount: 50, timestamp: new Date().toISOString() })
    await service.endRound('auction1')
    await service.playerSale({ sellerId: 'player2', items: new Map([['square', 1]]) })
    await service.endRound('auction1')
    await service.playerSale({ sellerId: 'player3', items: new Map([['square', 1]]) })
    const info = await service.endRound('auction1') as AuctionInfo
    expect(info.currentRound).toBe(4)
    expect(info.sellerQueue[0]).toBe('player2')
  })

  it('should skip the seller if he leaves the game', async () => {
    await service.createAuction(defaultConfig)
    await joinAndConnectPlayer('player1', defaultConfig.id)
    await joinAndConnectPlayer('player2', defaultConfig.id)
    await joinAndConnectPlayer('player3', defaultConfig.id)
    const auction = await service.startAuction(defaultConfig.id)

    expect(auction.sellerQueue[0]).toBe('player1')
    const r1 = await service.endRound(defaultConfig.id) as AuctionInfo
    expect(r1.sellerQueue[1]).toBe('player2')
    const info = await service.playerLeave('player2', defaultConfig.id)
    expect(info.sellerQueue).toEqual(['player1', 'player3'])
    expect(info.currentRound).toBe(2)

  })
})
