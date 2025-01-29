import Redis from 'ioredis'
import { RedisAuctionRepo } from '../src/repositories/RedisAuctionRepo'
import { Auction } from '../src/schemas/Auction'
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
      const auction: Auction = {
        id: '123456789012345678901234',
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

      await auctionRepo.saveAuction(auction)

      const savedAuction = await mockRedisClient.get(`auction:${auction.id}`)
      expect(savedAuction).toBe(JSON.stringify(auction))
    })
  })

  describe('getAuctions', () => {
    it('should retrieve all auctions from Redis', async () => {
      const auction1: Auction = {
        id: '123456789012345678901234',
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

      const auction2: Auction = {
        id: '123456789012345678901235',
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

    it('should return an empty array if no auctions exist', async () => {
      const auctions = await auctionRepo.getAuctions()
      expect(auctions).toHaveLength(0)
    })
  })
})