import { Auction } from '../schemas/Auction'
import { AuctionRepo } from './AuctionRepo'
import Redis from 'ioredis'
import logger from '@auction/common/logger'
import { toAuction, toStoredAuction } from '../converters/AuctionConverter'

export class RedisAuctionRepo implements AuctionRepo {
  private redisClient

  constructor(redis: Redis) {
    this.redisClient = redis
  }

  async saveAuction(auction: Auction): Promise<void> {
    try {
      const key = `auction:${auction.id}`
      const storedAuction = toStoredAuction.convert(auction)
      await this.redisClient.set(key, JSON.stringify(storedAuction))
    } catch (error) {
      logger.error(error)
    }
  }

  async getAuctions(): Promise<Auction[]> {
    const keys = await this.redisClient.keys('auction:*')
    return await Promise.all(
      keys.map(async key => {
        return await this.redisClient.get(key)
      })
    ).then(auctions =>
      auctions
        .filter(auction => auction !== null)
        .map(auction => {
          try {
            return toAuction.convert(JSON.parse(auction))
          } catch (error) {
            logger.error(error)
            return null
          }
        })
        .filter(auction => auction !== null)
    )
  }

  async deleteAuction(auctionId: string): Promise<void> {
    const key = `auction:${auctionId}`
    await this.redisClient.del(key)
  }
}
