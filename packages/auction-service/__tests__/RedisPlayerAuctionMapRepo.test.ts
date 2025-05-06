import Redis from 'ioredis'
import { RedisPlayerAuctionMapRepo } from '../src/repositories/PlayerAuctionMapRepo'
import redisMock from 'ioredis-mock'

describe('RedisPlayerAuctionMapRepo', () => {
  let playerMapRepo: RedisPlayerAuctionMapRepo
  let mockRedisClient: Redis

  beforeAll(() => {
    // Initialize the mocked Redis client
    mockRedisClient = new redisMock()
    playerMapRepo = new RedisPlayerAuctionMapRepo(mockRedisClient)
  })

  afterEach(async () => {
    // Clear all keys in the mocked Redis after each test
    await mockRedisClient.flushall()
  })

  describe('setPlayerAuction', () => {
    it('should map a player to an auction in Redis', async () => {
      const playerId = 'player123'
      const auctionId = 'auction456'

      await playerMapRepo.setPlayerAuction(playerId, auctionId)

      const result = await mockRedisClient.hget('player-auction-map', playerId)
      expect(result).toEqual(auctionId)
    })

    it('should handle errors when mapping fails', async () => {
      const playerId = 'player123'
      const auctionId = 'auction456'

      // Mock Redis error
      jest.spyOn(mockRedisClient, 'hset').mockImplementationOnce(() => {
        throw new Error('Redis connection error')
      })

      await expect(playerMapRepo.setPlayerAuction(playerId, auctionId))
        .rejects
        .toThrow('Failed to map player to auction: Error: Redis connection error')
    })
  })

  describe('getPlayerAuction', () => {
    it('should retrieve the auction ID for a player', async () => {
      const playerId = 'player123'
      const auctionId = 'auction456'

      // Set up test data
      await playerMapRepo.setPlayerAuction(playerId, auctionId)

      const result = await playerMapRepo.getPlayerAuction(playerId)
      expect(result).toEqual(auctionId)
    })

    it('should return null if player is not mapped to any auction', async () => {
      const result = await playerMapRepo.getPlayerAuction('nonexistent-player')
      expect(result).toBeNull()
    })

    it('should handle errors when retrieval fails', async () => {
      // Mock Redis error
      jest.spyOn(mockRedisClient, 'hget').mockImplementationOnce(() => {
        throw new Error('Redis connection error')
      })

      await expect(playerMapRepo.getPlayerAuction('player123'))
        .rejects
        .toThrow('Failed to retrieve player\'s auction: Error: Redis connection error')
    })
  })

  describe('removePlayer', () => {
    it('should remove a player from the map', async () => {
      const playerId = 'player123'
      const auctionId = 'auction456'

      // Set up test data
      await mockRedisClient.hset('player-auction-map', playerId, auctionId)

      // Verify setup
      expect(await mockRedisClient.hget('player-auction-map', playerId)).toEqual(auctionId)

      // Remove player
      await playerMapRepo.removePlayer(playerId)

      // Verify removal
      expect(await mockRedisClient.hget('player-auction-map', playerId)).toBeNull()
    })

    it('should not error when removing a non-existent player', async () => {
      await expect(playerMapRepo.removePlayer('nonexistent-player')).resolves.not.toThrow()
    })

    it('should handle errors when removal fails', async () => {
      // Mock Redis error
      jest.spyOn(mockRedisClient, 'hdel').mockImplementationOnce(() => {
        throw new Error('Redis connection error')
      })

      await expect(playerMapRepo.removePlayer('player123'))
        .rejects
        .toThrow('Failed to remove player from map: Error: Redis connection error')
    })
  })

  describe('removePlayersForAuction', () => {
    it('should remove all players mapped to a specific auction', async () => {
      const auctionId = 'auction456'
      const players = {
        'player1': auctionId,
        'player2': auctionId,
        'player3': 'different-auction',
        'player4': auctionId,
      }

      // Set up test data
      await Promise.all(
        Object.entries(players).map(([playerId, auction]) =>
          mockRedisClient.hset('player-auction-map', playerId, auction),
        ),
      )

      // Verify setup
      for (const [playerId, auction] of Object.entries(players)) {
        expect(await mockRedisClient.hget('player-auction-map', playerId)).toEqual(auction)
      }

      // Remove players for auction
      await playerMapRepo.removePlayersForAuction(auctionId)

      // Verify removal
      expect(await mockRedisClient.hget('player-auction-map', 'player1')).toBeNull()
      expect(await mockRedisClient.hget('player-auction-map', 'player2')).toBeNull()
      expect(await mockRedisClient.hget('player-auction-map', 'player3')).toEqual('different-auction')
      expect(await mockRedisClient.hget('player-auction-map', 'player4')).toBeNull()
    })

    it('should not error when no players are mapped to the auction', async () => {
      await expect(playerMapRepo.removePlayersForAuction('nonexistent-auction')).resolves.not.toThrow()
    })

    it('should handle errors when batch removal fails', async () => {
      // Mock Redis error
      jest.spyOn(mockRedisClient, 'hgetall').mockImplementationOnce(() => {
        throw new Error('Redis connection error')
      })

      await expect(playerMapRepo.removePlayersForAuction('auction123'))
        .rejects
        .toThrow('Failed to clean up player map for auction: Error: Redis connection error')
    })
  })
}) 