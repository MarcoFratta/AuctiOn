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
import { Auction } from 'domain/auctions/Auction'

export class AuctionServiceImpl extends CallbacksService implements AuctionService {
  private auctions: Map<string, Auction> = new Map()
  private players: Map<string, string> = new Map()
  private repo: AuctionRepo

  constructor(repo: AuctionRepo) {
    super()
    this.repo = repo
  }

  async createAuction(config: AuctionConfig): Promise<AuctionInfo> {
    if (this.auctions.has(config.id)) {
      throw new Error(`Auction with id ${config.id} already exists`)
    }
    const newAuction: Auction = createAuctionFromConfig(config)
    this.auctions.set(newAuction.id, newAuction)
    this.saveAuction(newAuction)
    return newAuction.toInfo()
  }

  async playerBid(bid: Bid): Promise<AuctionInfo> {
    const auction: Auction = this.findPlayerAuction(bid.playerId)
    auction.bid(bid)
    const res = auction.toInfo()
    logger.info(`Player ${bid.playerId} bid ${bid.amount} in auction ${auction.id}`)
    this.notifyAuctionUpdate(res, 'onNewBid')
    this.saveAuction(auction)
    return res
  }

  async playerSale(sale: Sale): Promise<AuctionInfo> {
    const auction: Auction = this.findPlayerAuction(sale.sellerId)
    auction.sale(sale)
    const res = auction.toInfo()
    logger.info(`Player ${sale.sellerId} sold items in auction ${auction.id}`)
    this.notifyAuctionUpdate(res, 'onNewSale')
    this.saveAuction(auction)
    return res
  }

  async endRound(auctionId: Auction['id']): Promise<AuctionInfo | Leaderboard> {
    const auction: Auction = this.findAuctionById(auctionId)
    auction.endRound()
    logger.info(`Round ended for auction ${auction.id}`)
    if (auction.terminated()) {
      await this.deleteAuction(auction)
      const leaderboard = auction.computeLeaderboard()
      this.notifyLeaderBoardUpdate(leaderboard, auctionId)
      return cloneDeep(leaderboard)
    }
    this.saveAuction(auction)
    const res = auction.toInfo()
    this.notifyAuctionUpdate(res, 'onRoundEnd')
    return res
  }

  async setPlayerState(playerId: Player['id'], state: PlayerState): Promise<AuctionInfo> {
    const auction: Auction = this.findPlayerAuction(playerId)
    logger.info(`Setting player ${playerId} state to ${state} for auction ${auction.id}`)
    auction.playerState(playerId, state)
    this.saveAuction(auction)
    return auction.toInfo()
  }

  async playerJoin(playerId: Player['id'], auctionId: Auction['id']): Promise<AuctionInfo> {
    const auction = this.findAuctionById(auctionId)
    auction.join(playerId)
    this.players.set(playerId, auctionId)
    logger.info(`Player ${playerId} joined auction ${auction.id}`)
    this.saveAuction(auction)
    this.notifyPlayerUpdate(playerId, 'onPlayerJoin')
    return auction.toInfo()
  }

  async getAuction(auctionId: Auction['id']): Promise<AuctionInfo> {
    return this.findAuctionById(auctionId).toInfo()
  }

  async getPlayerAuction(playerId: Player['id']): Promise<AuctionInfo> {
    return this.findPlayerAuction(playerId).toInfo()
  }

  async playerLeave(playerId: Player['id'], auctionId: Auction['id']): Promise<AuctionInfo> {
    const auction = this.findAuctionById(auctionId)
    auction.leave(playerId)
    this.players.delete(playerId)
    logger.info(`Player ${playerId} left auction ${auction.id}`)
    this.saveAuction(auction)
    this.notifyPlayerUpdate(playerId, 'onPlayerLeave')
    return auction.toInfo()
  }

  async removeAuction(auctionId: Auction['id']): Promise<void> {
    const auction = this.findAuctionById(auctionId)
    logger.info(`Removing auction ${auction.id}`)
    await this.deleteAuction(auction)
    this.notifyAuctionUpdate(auction.toInfo(), 'onAuctionDeleted')
  }

  async startAuction(auctionId: Auction['id']): Promise<AuctionInfo> {
    const auction: Auction = this.findAuctionById(auctionId)
    logger.info(`Starting auction ${auction.id}`)
    auction.start()
    this.saveAuction(auction)
    return auction.toInfo()
  }

  loadAuctions = async () => {
    const auctions = await this.repo.getAuctions()
    auctions.forEach(auction => {
      logger.info(`Restoring auction: ${auction.id} from db`)
      this.auctions.set(auction.id, createFromInfo(auction))
      auction.players.forEach((player: Player) => {
        this.players.set(player.id, auction.id)
      })
    })
  }

  private async deleteAuction(auction: Auction) {
    this.auctions.delete(auction.id)
    await this.repo.deleteAuction(auction.id)
    logger.debug(`deleted auction: ${auction.id}`)
  }

  private findAuctionById(auctionId: Auction['id']): Auction {
    const auction: Auction | undefined = this.auctions.get(auctionId)
    if (!auction) {
      logger.error(`Auction with id ${auctionId} not found`)
      throw new Error(`Auction with id ${auctionId} not found`)
    }
    return auction
  }

  private findPlayerAuction(playerId: Player['id']): Auction {
    const playerAuctionId = this.players.get(playerId)
    if (!playerAuctionId) {
      logger.error(`Player with id ${playerId} not found`)
      throw new Error(`Player with id ${playerId} not found`)
    }
    return this.findAuctionById(playerAuctionId)
  }

  private saveAuction = (res: Auction) => {
    this.repo
      .saveAuction(res.toInfo())
      .then(() => logger.debug(`saved auction: ${res.id}`))
      .catch(error => logger.error(`failed to save auction: ${res.id}`, error))
  }
}
