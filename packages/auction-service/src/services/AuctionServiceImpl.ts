import { Auction, AuctionConfig } from '../schemas/Auction'
import { Bid } from '../schemas/Bid'
import { ItemsMap, Player, PlayerState } from '../schemas/Player'
import { AuctionService } from './AuctionService'
import { cloneDeep } from 'lodash'
import logger from '@auction/common/logger'
import { validateSchema } from '@auction/common/validation'
import { SaleSchema } from '../schemas/Sale'
import { createPlayer } from '../domain/auctions/PlayerFactory'
import { PlayOrderStrategy } from '../domain/auctions/PlayOrderStrategy'
import { createAuctionFromConfig } from '../domain/auctions/AuctionFactory'
import { AuctionRepo } from '../repositories/AuctionRepo'
import { WinStrategyFactory } from '../domain/auctions/WinStrategyFactory'
import { LeaderboardModifier, Modifiers } from '../domain/auctions/Modifier'
import { Leaderboard, leaderboardSchema } from '../schemas/Leaderboard'

export class AuctionServiceImpl implements AuctionService {
  private auctions: Map<string, Auction> = new Map()
  private players: Map<string, string> = new Map()
  private auctionsCallbacks = new Map<string, ((auction: Auction) => void)[]>()
  private leaderBoardCallbacks: ((leaderboard: Leaderboard, auctionId: string) => void)[] = []
  private playersCallbacks = new Map<string, ((id: string) => void)[]>()
  private repo: AuctionRepo
  private readonly modifiers: LeaderboardModifier[]

  constructor(repo: AuctionRepo) {
    this.repo = repo
    this.modifiers = [Modifiers.noMostItems(), Modifiers.noZeroItems()]
    this.initCallbacks()
    this.loadAuctions()
  }

  initCallbacks = () => {
    const auctionTypes = ['onRoundEnd', 'onAuctionEnd', 'onNewBid', 'onNewSale', 'onAuctionDeleted']
    const playerTypes = ['onPlayerJoin', 'onPlayerLeave']
    auctionTypes.forEach(t => this.auctionsCallbacks.set(t, []))
    playerTypes.forEach(t => this.playersCallbacks.set(t, []))
  }

  async createAuction(config: AuctionConfig): Promise<Auction> {
    if (this.auctions.has(config.id)) {
      throw new Error(`Auction with id ${config.id} already exists`)
    }
    logger.info(`creating auction: ${config.id}`)
    const newAuction: Auction = createAuctionFromConfig(config)
    this.auctions.set(newAuction.id, newAuction)
    logger.info(`created auction: ${JSON.stringify(newAuction)}`)
    await this.repo.saveAuction(newAuction)
    return cloneDeep(newAuction)
  }

  async playerBid(bid: Bid): Promise<Auction> {
    const playerId: string = bid.playerId
    const auction: Auction = this.findPlayerAuction(playerId)
    if (!auction.currentSale) {
      logger.error(bid)
      throw new Error(`Cannot place bid without an active sale`)
    }
    const player: Player = this.getPlayer(auction, playerId)
    if (bid.round !== auction.currentRound) {
      throw new Error(`Bid round must match current round`)
    }
    if (bid.playerId == auction.currentSale!.sellerId) {
      throw new Error(`Player with id ${playerId} cannot bid on their own items`)
    }
    if (bid.amount > player.money) {
      throw new Error(`Player with id ${playerId} does not have enough money to place bid`)
    }
    if (auction.currentBid && bid.amount <= auction.currentBid.amount) {
      throw new Error(`Bid amount must be higher than current bid amount`)
    }

    bid.timestamp = new Date().toISOString()
    auction.currentBid = bid
    const res = cloneDeep(auction)
    this.notifyAuctionUpdate(res, 'onNewBid')
    this.saveAuction(auction)
    return res
  }

  async playerSale(playerId: string, saleItems: ItemsMap): Promise<Auction> {
    const auction: Auction = this.findPlayerAuction(playerId)
    if (!auction.startTimestamp) {
      throw new Error(`Auction not started yet`)
    }
    const player: Player = this.getPlayer(auction, playerId)
    const sellerIndex = (auction.currentRound - 1) % auction.players.length
    if (playerId !== auction.sellerQueue[sellerIndex]) {
      throw new Error(`Player with id ${playerId} is not the current seller`)
    }
    for (const item of saleItems.keys()) {
      if (player.inventory.get(item)! < saleItems.get(item)!) {
        throw new Error(`Player with id ${playerId} does not have item ${item}`)
      }
    }
    auction.currentSale = validateSchema(SaleSchema, {
      sellerId: playerId,
      items: saleItems,
    })
    auction.currentBid = undefined
    const res = cloneDeep(auction)
    this.notifyAuctionUpdate(res, 'onNewSale')
    this.saveAuction(auction)
    return res
  }

  async endRound(auctionId: string): Promise<Auction | Leaderboard> {
    const auction: Auction = this.findAuctionById(auctionId)
    if (!auction.startTimestamp) {
      throw new Error(`Auction not started yet`)
    }
    if (auction.currentSale && auction.currentBid) {
      const highestBid: Bid = auction.currentBid
      const winner: Player = this.getPlayer(auction, highestBid.playerId)
      const seller: Player = this.getPlayer(auction, auction.currentSale.sellerId)
      winner.money -= highestBid.amount
      winner.inventory = new Map(
        [...winner.inventory].map(([item, quantity]) => [item, quantity + (auction.currentSale?.items.get(item) ?? 0)])
      )
      seller.money += highestBid.amount
      seller.inventory = new Map(
        [...seller.inventory].map(([item, quantity]) => [item, quantity - (auction.currentSale?.items.get(item) ?? 0)])
      )
      auction.currentSale.endTimestamp = new Date().toISOString()
      // TODO: save auction sale results
    }
    if (auction.currentRound == auction.maxRound) {
      logger.info(`Reached max round: ${auction.maxRound}, ending auction: ${auctionId}`)
      return this.endAuction(auctionId)
    }
    auction.currentBid = undefined
    auction.currentSale = undefined
    const res: Auction | Leaderboard = await this.goToNextRound(auction, auctionId)
    if (!this.isLeaderboard(res)) {
      this.saveAuction(res as Auction)
    }
    return res
  }

  async setPlayerState(playerId: string, state: PlayerState): Promise<Auction> {
    const auction: Auction = this.findPlayerAuction(playerId)
    const player: Player = this.getPlayer(auction, playerId)
    player.status = state
    this.saveAuction(auction)
    logger.debug(`player ${playerId} state set to ${state}`)
    return cloneDeep(auction)
  }

  async endAuction(auctionId: string): Promise<Leaderboard> {
    const auction: Auction = this.findAuctionById(auctionId)
    logger.info(`ending auction: ${auctionId}`)
    this.auctions.delete(auction.id)
    // TODO: save auction results
    let leaderBoard = WinStrategyFactory.byMoney().computeLeaderboard(auction)
    leaderBoard = Modifiers.modify(this.modifiers, leaderBoard)
    await this.repo.deleteAuction(auctionId)
    this.leaderBoardCallbacks.forEach(c => c(leaderBoard, auctionId)) // change
    return cloneDeep(leaderBoard)
  }

  async playerJoin(playerId: string, auctionId: string): Promise<Auction> {
    const auction = this.findAuctionById(auctionId)
    auction.players.push(createPlayer(playerId, auction))
    this.players.set(playerId, auctionId)
    this.saveAuction(auction)
    this.notifyPlayerUpdate(playerId, 'onPlayerJoin')
    return cloneDeep(auction)
  }

  onRoundEnd(callback: (auction: Auction) => void): void {
    this.auctionsCallbacks.get('onRoundEnd')!.push(callback)
  }

  private getPlayer(auction: Auction, playerId: string) {
    const player = auction.players.find(player => player.id == playerId)
    if (!player) {
      throw new Error(`Player with id ${playerId} not found in auction`)
    }
    return player
  }

  async getAuction(auctionId: string): Promise<Auction> {
    return cloneDeep(this.findAuctionById(auctionId))
  }

  async getPlayerAuction(playerId: string): Promise<Auction> {
    return cloneDeep(this.findPlayerAuction(playerId))
  }

  async playerLeave(playerId: string, auctionId: string): Promise<Auction> {
    const auction = this.findAuctionById(auctionId)
    auction.players = auction.players.filter(player => player.id !== playerId)
    this.players.delete(playerId)
    this.saveAuction(auction)
    this.notifyPlayerUpdate(playerId, 'onPlayerLeave')
    return cloneDeep(auction)
  }

  private findAuctionById(auctionId: string): Auction {
    const auction: Auction | undefined = this.auctions.get(auctionId)
    if (!auction) {
      throw new Error(`Auction with id ${auctionId} not found`)
    }
    return auction
  }

  private findPlayerAuction(playerId: string): Auction {
    const playerAuctionId = this.players.get(playerId)
    if (!playerAuctionId) {
      throw new Error(`Player with id ${playerId} not found`)
    }
    return this.findAuctionById(playerAuctionId)
  }

  private getCurrentSellerId(auction: Auction): string {
    return auction.sellerQueue[(auction.currentRound - 1) % auction.players.length]
  }

  private rotateLeft<T>(array: T[]): T[] {
    if (array.length === 0) return array // Handle empty array
    const [first, ...rest] = array
    return [...rest, first]
  }

  onAuctionEnd(callback: (auction: Leaderboard, auctionId: string) => void): void {
    this.leaderBoardCallbacks.push(callback)
  }

  onPlayerJoin(callback: (auction: string) => void): void {
    this.playersCallbacks.get('onPlayerJoin')!.push(callback)
  }

  onPlayerLeave(callback: (auction: string) => void): void {
    this.playersCallbacks.get('onPlayerLeave')!.push(callback)
  }

  onAuctionDeleted(callback: (auction: Auction) => void): void {
    this.auctionsCallbacks.get('onAuctionDeleted')!.push(callback)
  }

  onNewBid(callback: (auction: Auction) => void): void {
    this.auctionsCallbacks.get('onNewBid')!.push(callback)
  }

  onNewSale(callback: (auction: Auction) => void): void {
    this.auctionsCallbacks.get('onNewSale')!.push(callback)
  }

  async removeAuction(auctionId: string): Promise<void> {
    const auction = this.findAuctionById(auctionId)
    this.auctions.delete(auctionId)
    await this.repo.deleteAuction(auctionId)
    this.notifyAuctionUpdate(auction, 'onAuctionDeleted')
    logger.info(`deleted auction: ${auctionId}`)
  }

  private notifyAuctionUpdate(res: Auction, type: string) {
    this.auctionsCallbacks.get(type)!.forEach(callback => callback(res))
  }

  async startAuction(auctionId: string): Promise<Auction> {
    const auction: Auction = this.findAuctionById(auctionId)
    auction.startTimestamp = new Date().toISOString()
    auction.sellerQueue = PlayOrderStrategy.sameOrder(auction.players.map(player => player.id))
    this.saveAuction(auction)
    return cloneDeep(auction)
  }

  private notifyPlayerUpdate(id: string, type: string) {
    this.playersCallbacks.get(type)!.forEach(callback => callback(id))
  }

  private saveAuction = (res: Auction) => {
    this.repo
      .saveAuction(res)
      .then(() => logger.info(`saved auction: ${res.id}`))
      .catch(error => logger.error(`failed to save auction: ${res.id}`, error))
  }

  private async goToNextRound(auction: Auction, auctionId: string): Promise<Auction | Leaderboard> {
    auction.currentRound++
    let disconnectedCounter = 0
    logger.info('going to next turn:')
    logger.info(auction.players)
    while (this.getPlayer(auction, this.getCurrentSellerId(auction)).status === 'not-connected') {
      logger.info(`Player ${this.getCurrentSellerId(auction)} disconnected, skipping round: ${auction.currentRound}`)
      auction.sellerQueue = this.rotateLeft(auction.sellerQueue)
      disconnectedCounter++
      if (disconnectedCounter == auction.players.length - 1) {
        logger.info(`Too many players disconnected, ending auction: ${auctionId}`)
        this.notifyAuctionUpdate(auction, 'onRoundEnd')
        return this.endAuction(auctionId)
      }
    }
    this.notifyAuctionUpdate(auction, 'onRoundEnd')
    return cloneDeep(auction)
  }

  private isLeaderboard(value: any): boolean {
    try {
      validateSchema(leaderboardSchema, value)
      return true
    } catch (e) {
      return false
    }
  }

  private loadAuctions = () => {
    this.repo.getAuctions().then(auctions => {
      auctions.forEach(auction => {
        logger.info(`loading auction: ${auction.id}`)
        this.auctions.set(auction.id, auction)
        auction.players.forEach(player => {
          this.players.set(player.id, auction.id)
        })
      })
    })
  }
}
