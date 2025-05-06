import { AuctionConfig, AuctionInfo } from '../schemas/Auction'
import { Bid } from '../schemas/Bid'
import { Player, PlayerState } from '../schemas/Player'
import { AuctionService } from './AuctionService'
import { cloneDeep } from 'lodash'
import logger from '@auction/common/logger'
import { Sale } from '../schemas/Sale'
import { createAuctionFromConfig, createFromInfo } from '../domain/auctions/AuctionFactory'
import { AuctionRepo } from '../repositories/AuctionRepo'
import { Leaderboard } from '../schemas/Leaderboard'
import { CallbacksService } from './CallbacksService'
import { Auction } from '../domain/auctions/Auction'
import { RedisLock } from './RedisLock'
import { PlayerAuctionMapRepo } from '../repositories/PlayerAuctionMapRepo'

export class AuctionServiceImpl extends CallbacksService implements AuctionService {
  private readonly LOCK_PREFIX = 'locks:auction:'
  private readonly LOCK_TTL = 10000 // 10 seconds
  private readonly PLAYER_MAP_LOCK = 'locks:player-map'
  private readonly PLAYER_MAP_LOCK_TTL = 5000 // 5 seconds
  private repo: AuctionRepo
  private playerMapRepo: PlayerAuctionMapRepo
  private redlock: RedisLock

  constructor(repo: AuctionRepo, playerMapRepo: PlayerAuctionMapRepo, redlock: RedisLock) {
    super()
    this.repo = repo
    this.playerMapRepo = playerMapRepo
    this.redlock = redlock
  }

  async createAuction(config: AuctionConfig): Promise<AuctionInfo> {
    const existingAuction = await this.repo.getAuction(config.id)
    if (existingAuction) {
      logger.warn(`Auction with id ${config.id} already exists`)
      throw new Error(`Cannot create auction: Auction with id ${config.id} already exists`)
    }
    const newAuction: Auction = createAuctionFromConfig(config)
    await this.saveAuction(newAuction)
    await this.playerJoin(config.creatorId, newAuction.id)
    return newAuction.toInfo()
  }

  async playerBid(bid: Bid): Promise<AuctionInfo> {
    const playerAuctionId = await this.findPlayerAuction(bid.playerId)
    if (!playerAuctionId) {
      throw new Error(`Player ${bid.playerId} not found in any active auction.`)
    }

    return await this.withAuctionLock(playerAuctionId, 'playerBid', async auction => {
      if (bid.amount <= (auction.toInfo().currentBid?.amount || 0)) {
        throw new Error(`Bid amount must be greater than the current bid.`)
      }
      auction.bid(bid)
      const res = auction.toInfo()
      logger.debug(`Player ${bid.playerId} bid ${bid.amount} in auction ${auction.id}`)
      this.notifyAuctionUpdate(res, 'onNewBid')
      return res
    })
  }

  async playerSale(sale: Sale): Promise<AuctionInfo> {
    const playerAuctionId = await this.findPlayerAuction(sale.sellerId)
    if (!playerAuctionId) {
      throw new Error(`Player ${sale.sellerId} not found in any active auction.`)
    }

    return await this.withAuctionLock(playerAuctionId, 'playerSale', async auction => {
      auction.sale(sale)
      const res = auction.toInfo()
      logger.debug(`Player ${sale.sellerId} sold items in auction ${auction.id}`)
      this.notifyAuctionUpdate(res, 'onNewSale')
      return res
    })
  }

  async endRound(auctionId: Auction['id']): Promise<AuctionInfo | Leaderboard> {
    const auction = await this.withAuctionLock(auctionId, 'endRound', async auction => {
      auction.endRound()
      logger.debug(`Round ended for auction ${auction.id}`)
      return auction
    })

    if (auction.isTerminated()) {
      const leaderboard = auction.computeLeaderboard()
      await this.deleteAuction(auctionId)
      this.notifyLeaderBoardUpdate(leaderboard, auctionId)
      return cloneDeep(leaderboard)
    } else {
      const res = auction.toInfo()
      this.notifyAuctionUpdate(res, 'onRoundEnd')
      return res
    }
  }

  async setPlayerState(playerId: Player['id'], state: PlayerState): Promise<AuctionInfo> {
    const playerAuctionId = await this.findPlayerAuction(playerId)
    if (!playerAuctionId) {
      if (state == 'not-connected') {
        throw new Error(`Auction ended for player ${playerId}`)
      }
      logger.warn(`Player ${playerId} not found, cannot set state.`)
      throw new Error(`Player ${playerId} not found.`)
    }

    return await this.withAuctionLock(playerAuctionId, 'setPlayerState', async auction => {
      logger.debug(`Setting player ${playerId} state to ${state} for auction ${auction.id}`)
      auction.playerState(playerId, state)
      return auction.toInfo()
    })
  }

  async playerJoin(playerId: Player['id'], auctionId: Auction['id']): Promise<AuctionInfo> {
    const auction = await this.findAuctionById(auctionId)
    if (auction.toInfo().players.some(p => p.id === playerId)) {
      logger.warn(`Player ${playerId} already in auction ${auctionId}`)
      return auction.toInfo()
    }
    const res = await this.withAuctionLock(auctionId, 'playerJoin', async auction => {
      auction.join(playerId)
      return auction.toInfo()
    })

    await this.playerMapRepo.setPlayerAuction(playerId, auctionId)

    logger.debug(`Player ${playerId} joined auction ${auction.id}`)
    this.notifyPlayerUpdate(auctionId, playerId, 'onPlayerJoin')
    return res
  }

  async playerLeave(playerId: Player['id'], auctionId: Auction['id']): Promise<AuctionInfo> {
    const auction = await this.withAuctionLock(auctionId, 'playerLeave', async auction => {
      auction.leave(playerId)
      return auction
    })

    await this.playerMapRepo.removePlayer(playerId)

    logger.debug(`Player ${playerId} left auction ${auction.id}`)
    const res = auction.toInfo()
    this.notifyPlayerUpdate(auctionId, playerId, 'onPlayerLeave')
    if (auction.isTerminated()) {
      const leaderboard = auction.computeLeaderboard()
      await this.deleteAuction(auctionId)
      this.notifyLeaderBoardUpdate(leaderboard, auctionId)
      return res
    }
    return res
  }

  async startAuction(auctionId: Auction['id']): Promise<AuctionInfo> {
    const a = await this.findAuctionById(auctionId)
    if (a.isStarted()) {
      logger.warn(`Auction ${auctionId} already started.`)
      return a.toInfo()
    }
    logger.info(`Starting auction ${auctionId}`)
    const auction = await this.withAuctionLock(auctionId, 'startAuction', async auction => {
      auction.start()
      return auction
    })
    const res = auction.toInfo()
    if (auction.isTerminated()) {
      const leaderboard = auction.computeLeaderboard()
      await this.deleteAuction(auctionId)
      this.notifyLeaderBoardUpdate(leaderboard, auctionId)
    } else {
      this.notifyAuctionUpdate(res, 'onAuctionStarted')
    }
    return res
  }

  async getAuction(auctionId: Auction['id']): Promise<AuctionInfo> {
    const auction = await this.repo.getAuction(auctionId)
    if (!auction) {
      throw new Error(`Auction with id ${auctionId} not found`)
    }
    return auction
  }

  async getPlayerAuction(playerId: Player['id']): Promise<AuctionInfo> {
    const playerAuctionId = await this.findPlayerAuction(playerId)
    if (!playerAuctionId) {
      throw new Error(`Player with id ${playerId} not found in an active auction`)
    }
    return this.getAuction(playerAuctionId)
  }

  async removeAuction(auctionId: Auction['id']): Promise<void> {
    const lockKey = `${this.LOCK_PREFIX}${auctionId}`
    const info = await this.redlock.runWithLock(
      lockKey,
      this.LOCK_TTL,
      async () => {
        try {
          const auctionInfo = await this.repo.getAuction(auctionId)
          if (auctionInfo) {
            await this.deleteAuction(auctionId)
            return auctionInfo
          } else {
            throw new Error(`Auction with id ${auctionId} not found`)
          }
        } catch (err) {
          logger.error(`Error during removeAuction for ${auctionId}:`, err)
          throw err
        }
      },
      50
    )
    this.notifyAuctionUpdate(info, 'onAuctionDeleted')
  }

  private async withAuctionLock<T>(auctionId: string, operationName: string, operation: (auction: Auction) => Promise<T>): Promise<T> {
    const lockKey = `${this.LOCK_PREFIX}${auctionId}`
    return await this.redlock.runWithLock(
      lockKey,
      this.LOCK_TTL,
      async () => {
        try {
          const auction = await this.findAuctionById(auctionId)
          const result = await operation(auction)
          await this.saveAuction(auction)
          return result
        } catch (err) {
          logger.error(`[${operationName}] Failed:`, err)
          throw err
        }
      },
      50
    )
  }

  private async withPlayerMapLock<T>(operationName: string, operation: () => Promise<T>): Promise<T> {
    return await this.redlock.runWithLock(
      this.PLAYER_MAP_LOCK,
      this.PLAYER_MAP_LOCK_TTL,
      async () => {
        try {
          return await operation()
        } catch (err) {
          logger.error(`[${operationName}] Player map operation failed:`, err)
          throw err
        }
      },
      50
    )
  }

  private async findAuctionById(auctionId: Auction['id']): Promise<Auction> {
    const auctionInfo = await this.repo.getAuction(auctionId)
    if (!auctionInfo) {
      logger.error(`Auction ${auctionId} not found during locked operation!`)
      throw new Error(`Auction with id ${auctionId} not found.`)
    }
    return createFromInfo(auctionInfo)
  }

  private async saveAuction(auction: Auction): Promise<void> {
    await this.repo.saveAuction(auction.toInfo())
  }

  private async deleteAuction(auctionId: string): Promise<void> {
    await this.repo.deleteAuction(auctionId)
    await this.playerMapRepo.removePlayersForAuction(auctionId)
    logger.info(`Deleted auction: ${auctionId}.`)
  }

  private async findPlayerAuction(playerId: Player['id']): Promise<string | null> {
    const playerAuctionId = await this.playerMapRepo.getPlayerAuction(playerId)
    if (!playerAuctionId) {
      logger.warn(`Player with id ${playerId} not found in player-auction map`)
      return null
    }
    return playerAuctionId
  }
}
