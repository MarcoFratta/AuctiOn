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
import AsyncLock from 'async-lock'

export class AuctionServiceImpl extends CallbacksService implements AuctionService {
  private players: Map<string, string> = new Map()
  private repo: AuctionRepo
  private lock = new AsyncLock()

  constructor(repo: AuctionRepo) {
    super()
    this.repo = repo
  }

  async withLock(auctionId: Auction['id'], op: (auction: Auction) => Promise<void>): Promise<Auction> {
    const res = await this.lock.acquire(auctionId, async () => {
      const auction = await this.findAuctionById(auctionId) // read
      await op(auction) // modify
      await this.saveAuction(auction) //write
      return auction
    })
    return res
  }

  async createAuction(config: AuctionConfig): Promise<AuctionInfo> {
    const auction = await this.repo.getAuction(config.id)
    if (auction) {
      logger.warn(`Auction with id ${config.id} already exists`)
      throw new Error(`Cannot create auction: Auction with id ${config.id} already exists`)
    }
    const newAuction: Auction = createAuctionFromConfig(config)
    await this.saveAuction(newAuction)
    return newAuction.toInfo()
  }

  async playerBid(bid: Bid): Promise<AuctionInfo> {
    const auctionId: string = await this.findPlayerAuction(bid.playerId)
    const res = await this.withLock(auctionId, async auction => {
      auction.bid(bid)
      const res = auction.toInfo()
      logger.debug(`Player ${bid.playerId} bid ${bid.amount} in auction ${auction.id}`)
      this.notifyAuctionUpdate(res, 'onNewBid')
    })
    return res.toInfo()
  }

  async playerSale(sale: Sale): Promise<AuctionInfo> {
    const auctionId: string = await this.findPlayerAuction(sale.sellerId)
    const res = await this.withLock(auctionId, async auction => {
      auction.sale(sale)
      const res = auction.toInfo()
      logger.debug(`Player ${sale.sellerId} sold items in auction ${auction.id}`)
      this.notifyAuctionUpdate(res, 'onNewSale')
    })
    return res.toInfo()
  }

  async endRound(auctionId: Auction['id']): Promise<AuctionInfo | Leaderboard> {
    const auction = await this.withLock(auctionId, async auction => {
      auction.endRound()
      logger.debug(`Round ended for auction ${auction.id}`)
    })
    if (auction.isTerminated()) {
      await this.deleteAuction(auction)
      const leaderboard = auction.computeLeaderboard()
      this.notifyLeaderBoardUpdate(leaderboard, auctionId)
      return cloneDeep(leaderboard)
    }
    const res = auction.toInfo()
    this.notifyAuctionUpdate(res, 'onRoundEnd')
    return res
  }

  async setPlayerState(playerId: Player['id'], state: PlayerState): Promise<AuctionInfo> {
    const auctionId: string = await this.findPlayerAuction(playerId)
    const res = await this.withLock(auctionId, async auction => {
      logger.debug(`Setting player ${playerId} state to ${state} for auction ${auction.id}`)
      auction.playerState(playerId, state)
    })
    return res.toInfo()
  }

  async playerJoin(playerId: Player['id'], auctionId: Auction['id']): Promise<AuctionInfo> {
    const res = await this.withLock(auctionId, async auction => {
      auction.join(playerId)
      this.players.set(playerId, auctionId)
      logger.debug(`Player ${playerId} joined auction ${auction.id}`)
      this.notifyPlayerUpdate(auctionId, playerId, 'onPlayerJoin')
    })
    return res.toInfo()
  }

  async getAuction(auctionId: Auction['id']): Promise<AuctionInfo> {
    return (await this.findAuctionById(auctionId)).toInfo()
  }

  async getPlayerAuction(playerId: Player['id']): Promise<AuctionInfo> {
    return (await this.findAuctionById(await this.findPlayerAuction(playerId))).toInfo()
  }

  async playerLeave(playerId: Player['id'], auctionId: Auction['id']): Promise<AuctionInfo> {
    const auction = await this.withLock(auctionId, async auction => {
      auction.leave(playerId)
      this.players.delete(playerId)
      logger.debug(`Player ${playerId} left auction ${auction.id}`)
    })
    this.notifyPlayerUpdate(auctionId, playerId, 'onPlayerLeave')
    const res = auction.toInfo()
    if (auction.isTerminated()) {
      await this.deleteAuction(auction)
      const leaderboard = auction.computeLeaderboard()
      this.notifyLeaderBoardUpdate(leaderboard, auctionId)
      return res
    }
    return res
  }

  async removeAuction(auctionId: Auction['id']): Promise<void> {
    const auction = await this.findAuctionById(auctionId)
    logger.debug(`Removing auction ${auction.id}`)
    await this.deleteAuction(auction)
    this.notifyAuctionUpdate(auction.toInfo(), 'onAuctionDeleted')
  }

  async startAuction(auctionId: Auction['id']): Promise<AuctionInfo> {
    logger.info(`Starting auction ${auctionId}`)
    const auction = await this.withLock(auctionId, async auction => {
      auction.start()
    })
    // Auction can terminate on start for different reasons
    if (auction.isTerminated()) {
      await this.deleteAuction(auction)
      const leaderboard = auction.computeLeaderboard()
      this.notifyLeaderBoardUpdate(leaderboard, auctionId)
    }
    this.notifyAuctionUpdate(auction.toInfo(), 'onAuctionStarted')
    return auction.toInfo()
  }

  loadAuctions = async () => {
    const auctions = await this.repo.getAuctions()
    auctions.forEach(auction => {
      logger.info(`Restoring auction: ${auction.id} from db`)
      auction.players.forEach((player: Player) => {
        this.players.set(player.id, auction.id)
      })
    })
  }

  private async deleteAuction(auction: Auction) {
    await this.repo.deleteAuction(auction.id)
    logger.info(`deleted auction: ${auction.id}`)
  }

  private async findAuctionById(auctionId: Auction['id']): Promise<Auction> {
    const auction = await this.repo.getAuction(auctionId)
    if (!auction) {
      logger.warn(`Auction with id ${auctionId} not found`)
      throw new Error(`Auction with id ${auctionId} not found`)
    }
    return createFromInfo(auction)
  }

  private async findPlayerAuction(playerId: Player['id']): Promise<string> {
    const playerAuctionId = this.players.get(playerId)
    if (!playerAuctionId) {
      logger.warn(`Player with id ${playerId} not found`)
      throw new Error(`Player with id ${playerId} not found`)
    }
    return playerAuctionId
  }

  private async saveAuction(res: Auction) {
    await this.repo.saveAuction(res.toInfo())
  }
}
