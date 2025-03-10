import { AuctionConfig, AuctionInfo, AuctionSchema } from '../../schemas/Auction'
import { Player } from '../../schemas/Player'
import { Sale } from '../../schemas/Sale'
import { Bid } from '../../schemas/Bid'
import { InventoryOutput } from '../../schemas/Item'
import { Leaderboard } from '../../schemas/Leaderboard'
import { createPlayer } from './PlayerFactory'
import { PlayOrderStrategy } from './PlayOrderStrategy'
import logger from '@auction/common/logger'
import { WinStrategyFactory } from './WinStrategyFactory'
import { Modifiers } from './Modifier'
import { validateSchema } from '@auction/common/validation'
import { cloneDeep } from 'lodash'

export interface Auction extends AuctionConfig {
  bid: (bid: Bid) => void
  sale: (sale: Sale) => void
  endRound: () => void
  computeLeaderboard: () => Leaderboard
  playerState: (playerId: Player['id'], state: Player['status']) => void
  start: () => void
  join: (player: Player['id']) => void
  leave: (playerId: string) => void
  isTerminated: () => boolean
  isStarted: () => boolean
  toInfo: () => AuctionInfo
}

export class AuctionImpl implements Auction {
  readonly id: string
  currentRound: number
  players: Player[]
  sellerQueue: string[]
  currentSale: Sale | undefined
  currentBid: Bid | undefined
  startTimestamp: string | undefined
  endTimestamp: string | undefined
  readonly maxRound: number
  readonly startAmount: number
  readonly startInventory: InventoryOutput
  readonly bidTime: number
  readonly maxPlayers: number
  readonly creatorId: string
  private modifiers = [Modifiers.noMostItems(), Modifiers.noZeroItems()]

  constructor(info: AuctionInfo) {
    this.id = info.id
    this.creatorId = info.creatorId
    this.currentRound = info.currentRound
    this.players = info.players
    this.sellerQueue = info.sellerQueue
    this.currentSale = info.currentSale
    this.currentBid = info.currentBid
    this.startTimestamp = info.startTimestamp
    this.endTimestamp = undefined
    this.maxRound = info.maxRound
    this.maxPlayers = info.maxPlayers
    this.startAmount = info.startAmount
    this.startInventory = info.startInventory
    this.bidTime = info.bidTime
  }

  bid(bid: Bid): void {
    const playerId: Player['id'] = bid.playerId
    if (!this.currentSale) {
      throw new Error(`Cannot place bid without an active sale`)
    }
    const player: Player = this.getPlayer(playerId)
    if (bid.round !== this.currentRound) {
      throw new Error(`Bid round must match current round`)
    }
    if (bid.playerId == this.currentSale!.sellerId) {
      throw new Error(`Player with id ${playerId} cannot bid on their own items`)
    }
    if (bid.amount > player.money) {
      throw new Error(`Player with id ${playerId} does not have enough money to place bid`)
    }
    if (this.currentBid && bid.amount <= this.currentBid.amount) {
      throw new Error(`Bid amount must be higher than current bid amount`)
    }

    bid.timestamp = new Date().toISOString()
    this.currentBid = bid
  }

  computeLeaderboard(): Leaderboard {
    let leaderBoard = WinStrategyFactory.byMoney().computeLeaderboard(this)
    leaderBoard = Modifiers.modify(this.modifiers, leaderBoard)
    return leaderBoard
  }

  endRound(): void {
    if (!this.startTimestamp) {
      throw new Error(`Auction not started yet`)
    }
    if (this.currentSale && this.currentBid) {
      const highestBid: Bid = this.currentBid
      const winner: Player = this.getPlayer(highestBid.playerId)
      const seller: Player = this.getPlayer(this.currentSale.sellerId)
      winner.money -= highestBid.amount
      winner.inventory = new Map(
        [...winner.inventory].map(([item, quantity]) => [item, quantity + (this.currentSale?.items.get(item) ?? 0)])
      )
      seller.money += highestBid.amount
      seller.inventory = new Map(
        [...seller.inventory].map(([item, quantity]) => [item, quantity - (this.currentSale?.items.get(item) ?? 0)])
      )
      this.currentSale.endTimestamp = new Date().toISOString()
    }
    if (this.currentRound == this.maxRound) {
      logger.debug(`Reached max round: ${this.maxRound}, ending this: ${this.id}`)
      this.endTimestamp = new Date().toISOString()
      return
    }
    this.currentBid = undefined
    this.currentSale = undefined
    this.goToNextRound()
  }

  join(playerId: Player['id']): void {
    this.players.push(createPlayer(playerId, this))
  }

  leave(playerId: string): void {
    this.players = this.players.filter(player => player.id !== playerId)
  }

  sale(sale: Sale): void {
    if (!this.startTimestamp) {
      throw new Error(`Auction not started yet`)
    }
    const player: Player = this.getPlayer(sale.sellerId)
    const sellerIndex = (this.currentRound - 1) % this.players.length
    if (sale.sellerId !== this.sellerQueue[sellerIndex]) {
      throw new Error(`Player with id ${sale.sellerId} is not the current seller`)
    }
    for (const item of sale.items.keys()) {
      if (player.inventory.get(item)! < sale.items.get(item)!) {
        throw new Error(`Player with id ${sale.sellerId} does not have item ${item}`)
      }
    }
    this.currentSale = sale
    this.currentBid = undefined
  }

  playerState(playerId: Player['id'], state: Player['status']): void {
    const player: Player = this.getPlayer(playerId)
    player.status = state
  }

  start(): void {
    this.startTimestamp = new Date().toISOString()
    this.sellerQueue = PlayOrderStrategy.sameOrder(this.players.map(player => player.id))
    this.skipDisconnectedPlayers()
  }

  isTerminated(): boolean {
    return this.endTimestamp !== undefined
  }

  isStarted(): boolean {
    return this.startTimestamp !== undefined
  }

  toInfo: () => AuctionInfo = () => {
    return validateSchema(AuctionSchema, {
      id: this.id,
      creatorId: this.creatorId,
      players: cloneDeep(this.players),
      maxRound: this.maxRound,
      bidTime: this.bidTime,
      sellerQueue: this.sellerQueue,
      currentRound: this.currentRound,
      currentSale: this.currentSale,
      currentBid: this.currentBid,
      startTimestamp: this.startTimestamp,
      maxPlayers: this.maxPlayers,
      startAmount: this.startAmount,
      startInventory: this.startInventory,
    })
  }

  private getPlayer(playerId: Player['id']) {
    const player = this.players.find(player => player.id == playerId)
    if (!player) {
      throw new Error(`Player with id ${playerId} not found in auction`)
    }
    return player
  }

  private goToNextRound(): void {
    this.currentRound++
    logger.info('Going to next round')
    if (!this.skipDisconnectedPlayers()) return // End auction if all players are disconnected
  }

  private skipDisconnectedPlayers(): boolean {
    let disconnectedCounter = 0
    let p = this.getPlayer(this.getCurrentSellerId())
    logger.info(`player ${p.id} inventory ${Array.from(p.inventory)}`)
    while (p.status === 'not-connected' || Array.from(p.inventory.values()).reduce((a, b) => a + b, 0) === 0) {
      logger.debug(`Player ${this.getCurrentSellerId()} unable to sale, skipping...`)
      this.sellerQueue = this.rotateLeft(this.sellerQueue)
      disconnectedCounter++

      if (disconnectedCounter === (this.currentRound == 1 ? this.players.length : this.players.length - 1)) {
        logger.debug(`No player can sell, ending auction: ${this.id}`)
        this.endTimestamp = new Date().toISOString()
        return false // Indicate that the auction should end
      }
      p = this.getPlayer(this.getCurrentSellerId())
      logger.info(`player ${p.id} inventory sum ${Array.from(p.inventory.values()).reduce((a, b) => a + b, 0)}`)
    }
    return true // Indicate that at least one player is connected
  }

  private getCurrentSellerId(): Player['id'] {
    return this.sellerQueue[(this.currentRound - 1) % this.players.length]
  }

  private rotateLeft<T>(array: T[]): T[] {
    if (array.length === 0) return array
    const [first, ...rest] = array
    return [...rest, first]
  }
}
