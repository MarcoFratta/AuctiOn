import { Player } from '../schemas/Player'
import { Auction } from '../domain/auctions/Auction'
import Redis from 'ioredis'
import logger from '@auction/common/logger'

export interface PlayerAuctionMapRepo {
  setPlayerAuction(playerId: Player['id'], auctionId: Auction['id']): Promise<void>

  getPlayerAuction(playerId: Player['id']): Promise<string | null>

  removePlayer(playerId: Player['id']): Promise<void>

  removePlayersForAuction(auctionId: Auction['id']): Promise<void>
}

export class RedisPlayerAuctionMapRepo implements PlayerAuctionMapRepo {
  private redisClient: Redis
  private readonly mapKey = 'player-auction-map'

  constructor(redis: Redis) {
    this.redisClient = redis
  }

  async setPlayerAuction(playerId: Player['id'], auctionId: Auction['id']): Promise<void> {
    try {
      await this.redisClient.hset(this.mapKey, playerId, auctionId)
    } catch (error) {
      logger.error(`Failed to set player ${playerId} to auction ${auctionId}:`, error)
      throw new Error(`Failed to map player to auction: ${error}`)
    }
  }

  async getPlayerAuction(playerId: Player['id']): Promise<string | null> {
    try {
      return await this.redisClient.hget(this.mapKey, playerId)
    } catch (error) {
      logger.error(`Failed to get auction for player ${playerId}:`, error)
      throw new Error(`Failed to retrieve player's auction: ${error}`)
    }
  }

  async removePlayer(playerId: Player['id']): Promise<void> {
    try {
      await this.redisClient.hdel(this.mapKey, playerId)
    } catch (error) {
      logger.error(`Failed to remove player ${playerId} from map:`, error)
      throw new Error(`Failed to remove player from map: ${error}`)
    }
  }

  async removePlayersForAuction(auctionId: Auction['id']): Promise<void> {
    try {
      const allEntries = await this.redisClient.hgetall(this.mapKey)
      const playersToRemove = []

      for (const [playerId, playerAuctionId] of Object.entries(allEntries)) {
        if (playerAuctionId === auctionId) {
          playersToRemove.push(playerId)
        }
      }

      if (playersToRemove.length > 0) {
        await this.redisClient.hdel(this.mapKey, ...playersToRemove)
        logger.info(`Removed ${playersToRemove.length} players from map for auction ${auctionId}`)
      }
    } catch (error) {
      logger.error(`Failed to remove players for auction ${auctionId}:`, error)
      throw new Error(`Failed to clean up player map for auction: ${error}`)
    }
  }
}
