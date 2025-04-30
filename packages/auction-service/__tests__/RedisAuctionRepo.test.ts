import Redis from 'ioredis'
import { RedisAuctionRepo } from '../src/repositories/RedisAuctionRepo'
import { AuctionInfo } from '../src/schemas/Auction'
import redisMock from 'ioredis-mock'

describe('RedisAuctionRepo', () => {
  let auctionRepo: RedisAuctionRepo
  let mockRedisClient: Redis

  beforeAll(() => {
    // Initialize the mocked Redis client
    mockRedisClient = new redisMock()
    auctionRepo = new RedisAuctionRepo(mockRedisClient) // Pass the mocked client
  })

  afterEach(async () => {
    // Clear all keys in the mocked Redis after each test
    await mockRedisClient.flushall()
  })

  describe('saveAuction', () => {
    it('should save an auction to Redis', async () => {
      const auction: AuctionInfo = {
        id: '123456789012345678901234',
        players: [],
        maxRound: 3,
        sellerQueue: [],
        currentRound: 1,
        currentSale: undefined,
        currentBid: undefined,
        startTimestamp: new Date().toISOString(),
        creatorId: '123446789012345678901234',
        maxPlayers: 4,
        startAmount: 100,
        startInventory: {
          items: [
            { item: 'triangle', quantity: 1 },
          ],
        },
        bidTime: 10,
      }

      await auctionRepo.saveAuction(auction)

      const savedAuction = await mockRedisClient.get(`auction:${auction.id}`)
      expect(savedAuction).toEqual(JSON.stringify(auction))
    })
  })

  describe('getAuctions', () => {
    it('should retrieve all auctions from Redis', async () => {
      const auction1: AuctionInfo = {
        id: '123456789012345678901234',
        creatorId: '11111111111111111111111',
        players: [],
        maxRound: 3,
        sellerQueue: [],
        currentRound: 1,
        currentSale: undefined,
        currentBid: undefined,
        startTimestamp: new Date().toISOString(),
        maxPlayers: 4,
        startAmount: 100,
        startInventory: {
          items: [
            { item: 'triangle', quantity: 1 },
          ],
        },
        bidTime: 10,
      }

      const auction2: AuctionInfo = {
        id: '123456789012345678901235',
        creatorId: '22222222222222222222222',
        players: [],
        maxRound: 5,
        sellerQueue: [],
        currentRound: 1,
        currentSale: undefined,
        currentBid: undefined,
        startTimestamp: new Date().toISOString(),
        maxPlayers: 6,
        startAmount: 200,
        startInventory: {
          items: [
            { item: 'square', quantity: 2 },
          ],
        },
        bidTime: 15,
      }

      await auctionRepo.saveAuction(auction1)
      await auctionRepo.saveAuction(auction2)

      const auctions = await auctionRepo.getAuctions()
      expect(auctions).toHaveLength(2)
      expect(auctions).toEqual(expect.arrayContaining([auction1, auction2]))
    })
    it('should return an auction if it exists', async () => {
      const auction1: AuctionInfo = {
        id: '123456789012345678901234',
        creatorId: '11111111111111111111111',
        players: [],
        maxRound: 3,
        sellerQueue: [],
        currentRound: 1,
        currentSale: undefined,
        currentBid: undefined,
        startTimestamp: new Date().toISOString(),
        maxPlayers: 4,
        startAmount: 100,
        startInventory: {
          items: [
            { item: 'triangle', quantity: 1 },
          ],
        },
        bidTime: 10,
      }
      await auctionRepo.saveAuction(auction1)
      const res = await auctionRepo.getAuction(auction1.id)
      expect(res).toEqual(auction1)
    })
    it('should return null if the auction does not exist', async () => {
      await expect(auctionRepo.getAuction('non-existent-id')).resolves.toBeNull()
    })

    it('should return an empty array if no auctions exist', async () => {
      const auctions = await auctionRepo.getAuctions()
      expect(auctions).toHaveLength(0)
    })
  })
})