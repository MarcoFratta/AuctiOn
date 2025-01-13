import { Auction } from '../schemas/Auction'
import { Bid } from '../schemas/Bid'
import { ItemsMap, Player } from '../schemas/Player'
import { AuctionService } from './AuctionService'
import { PlayOrderStrategy } from './PlayOrderStrategy'

export class AuctionServiceImpl implements AuctionService {
  private auctions: Map<string, Auction> = new Map()
  private players: Map<string, string> = new Map()

  async createAuction(auction: Auction): Promise<Auction> {
    if (this.auctions.has(auction.id)) {
      throw new Error(`Auction with id ${auction.id} already exists`)
    }

    auction.sellerQueue = PlayOrderStrategy.sameOrder(auction.players.map(player => player.id))
    auction.players.forEach(player => this.players.set(player.id, auction.id))
    auction.currentRound = 1
    auction.currentBid = this.defaultBid(auction.currentRound)
    auction.currentSale = undefined
    auction.startTimestamp = new Date()
    this.auctions.set(auction.id, auction)
    return auction
  }

  async playerBid(playerId: string, bid: Bid): Promise<Auction> {
    const auction: Auction = this.getPlayerAuction(playerId)
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
    if (bid.amount <= auction.currentBid.amount) {
      throw new Error(`Bid amount must be higher than current bid amount`)
    }

    bid.timestamp = new Date()
    auction.currentBid = bid
    return auction
  }

  async playerSale(playerId: string, saleItems: ItemsMap): Promise<Auction> {
    const auction: Auction = this.getPlayerAuction(playerId)
    const player: Player = this.getPlayer(auction, playerId)
    const sellerIndex = (auction.currentRound - 1) % auction.sellerQueue.length
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
    auction.currentBid = this.defaultBid(auction.currentRound)
    return auction
  }

  async endRound(auctionId: string): Promise<Auction> {
    const auction: Auction = await this.getAuction(auctionId)
    if (auction.currentSale) {
      const highestBid: Bid = auction.currentBid
      const winnerId = auction.currentBid.playerId
      if (winnerId) {
        const winner: Player = this.getPlayer(auction, winnerId)
        winner.money -= highestBid.amount
        winner.inventory = new Map(
          [...winner.inventory].map(([item, quantity]) => [item, quantity + (auction.currentSale?.items.get(item) ?? 0)])
        )
        const seller: Player = this.getPlayer(auction, auction.currentSale!.sellerId)
        seller.money += highestBid.amount
        seller.inventory = new Map(
          [...seller.inventory].map(([item, quantity]) => [item, quantity - (auction.currentSale?.items.get(item) ?? 0)])
        )
      }

      auction.currentSale.endTimestamp = new Date()
      // save auction sale results
    }
    if (auction.currentRound == auction.maxRound) {
      return this.endAuction(auctionId)
    }

    auction.currentRound++
    auction.currentBid = this.defaultBid(auction.currentRound)
    auction.currentSale = undefined
    return auction
  }

  async endAuction(auctionId: string): Promise<Auction> {
    const auction: Auction = await this.getAuction(auctionId)
    this.auctions.delete(auction.id)
    // save auction results
    return auction
  }

  private defaultBid(round: number): Bid {
    return {
      playerId: undefined,
      round: round,
      amount: 1,
      timestamp: new Date(),
    }
  }

  private getPlayer(auction: Auction, playerId: string) {
    const player = auction.players.find(player => player.id == playerId)
    if (!player) {
      throw new Error(`Player with id ${playerId} not found in auction`)
    }
    return player
  }

  private getPlayerAuction(playerId: string) {
    const playerAuctionId = this.players.get(playerId)
    if (!playerAuctionId) {
      throw new Error(`Player with id ${playerId} not found`)
    }
    const auction = this.auctions.get(playerAuctionId)
    if (!auction) {
      throw new Error(`Auction with id ${playerAuctionId} not found`)
    }
    return auction
  }

  async getAuction(auctionId: string): Promise<Auction> {
    const auction: Auction | undefined = this.auctions.get(auctionId)
    if (!auction) {
      throw new Error(`Auction with id ${auctionId} not found`)
    }
    return auction
  }
}
