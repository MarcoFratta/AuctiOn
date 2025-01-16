import { Auction, AuctionSchema } from '../schemas/Auction'
import { Bid } from '../schemas/Bid'
import { ItemsMap, Player } from '../schemas/Player'
import { AuctionService } from './AuctionService'
import { PlayOrderStrategy } from './PlayOrderStrategy'
import { cloneDeep } from 'lodash'
import logger from '../utils/Logger'
import { validateSchema } from '../utils/Validator'

export class AuctionServiceImpl implements AuctionService {
  private auctions: Map<string, Auction> = new Map()
  private players: Map<string, string> = new Map()

  async createAuction(auction: Auction): Promise<Auction> {
    if (this.auctions.has(auction.id)) {
      throw new Error(`Auction with id ${auction.id} already exists`)
    }
    logger.info(`creating auction: ${JSON.stringify(auction)}`)
    const newAuction: Auction = validateSchema(AuctionSchema, auction)

    newAuction.players = auction.players.map(player => cloneDeep(player))
    newAuction.sellerQueue = PlayOrderStrategy.sameOrder(newAuction.players.map(player => player.id))
    newAuction.players.forEach(player => this.players.set(player.id, auction.id))
    newAuction.currentRound = 1
    newAuction.currentBid = undefined
    newAuction.currentSale = undefined
    newAuction.startTimestamp = new Date()
    this.auctions.set(newAuction.id, newAuction)
    logger.info(`created auction: ${JSON.stringify(newAuction)}`)
    return cloneDeep(newAuction)
  }

  async playerBid(bid: Bid): Promise<Auction> {
    const playerId: string = bid.playerId
    const auction: Auction = this.findPlayerAuction(playerId)
    if (!auction.currentSale) {
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

    bid.timestamp = new Date()
    auction.currentBid = bid
    return cloneDeep(auction)
  }

  async playerSale(playerId: string, saleItems: ItemsMap): Promise<Auction> {
    const auction: Auction = this.findPlayerAuction(playerId)
    const player: Player = this.getPlayer(auction, playerId)
    logger.info(`player: ${playerId} is selling items: ${JSON.stringify(saleItems)}`)
    const sellerIndex = (auction.currentRound - 1) % auction.players.length
    logger.info(`expected seller: ${sellerIndex} for round ${auction.currentRound}`)
    if (playerId !== auction.sellerQueue[sellerIndex]) {
      throw new Error(`Player with id ${playerId} is not the current seller`)
    }
    for (const item of saleItems.keys()) {
      if (player.inventory.get(item)! < saleItems.get(item)!) {
        throw new Error(`Player with id ${playerId} does not have item ${item}`)
      }
    }
    auction.currentSale = {
      sellerId: playerId,
      items: saleItems,
    }
    auction.currentBid = undefined
    return cloneDeep(auction)
  }

  async endRound(auctionId: string): Promise<Auction> {
    const auction: Auction = this.findAuctionById(auctionId)
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
      auction.currentSale.endTimestamp = new Date()
      // TODO: save auction sale results
    }
    if (auction.currentRound == auction.maxRound) {
      return this.endAuction(auctionId)
    }
    auction.currentBid = undefined
    auction.currentSale = undefined
    return this.goToNextRound(auction, auctionId)
  }

  async setPlayerState(playerId: string, state: string): Promise<Auction> {
    const auction: Auction = this.findPlayerAuction(playerId)
    const player: Player = this.getPlayer(auction, playerId)
    player.status = state
    return cloneDeep(auction)
  }

  async endAuction(auctionId: string): Promise<Auction> {
    const auction: Auction = this.findAuctionById(auctionId)
    this.auctions.delete(auction.id)
    // TODO: save auction results
    return cloneDeep(auction)
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

  private async goToNextRound(auction: Auction, auctionId: string): Promise<Auction> {
    auction.currentRound++
    let disconnectedCounter = 0
    while (this.getPlayer(auction, this.getCurrentSellerId(auction)).status === 'disconnected') {
      logger.info(`Player ${this.getCurrentSellerId(auction)} disconnected, skipping round: ${auction.currentRound}`)
      auction.sellerQueue = this.rotateLeft(auction.sellerQueue)
      disconnectedCounter++
      if (disconnectedCounter == auction.players.length - 1) {
        logger.info(`Too many players disconnected, ending auction: ${auctionId}`)
        return this.endAuction(auctionId)
      }
    }
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
}
