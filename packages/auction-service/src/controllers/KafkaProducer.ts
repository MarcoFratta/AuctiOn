import { PlayerEventSource } from '../adapters/PlayerEventSource'
import { AuctionService } from '../services/AuctionService'
import { Kafka, Producer } from 'kafkajs'
import logger from '@auction/common/logger'
import { Auction } from '../schemas/Auction'
import { AuctionEvent } from '@auction/common/events/auction'
import { Leaderboard } from '../schemas/Leaderboard'
import {
  auctionEndEvent,
  bidEvent,
  playerConnectedEvent,
  playerDisconnectedEvent,
  roundEndEvent,
  saleEvent,
} from '../domain/events/EventsFactory'

export class KafkaProducer {
  private auctionService: AuctionService
  private eventSource: PlayerEventSource
  private kafkaProducer: Producer

  constructor(client: Kafka, auctionService: AuctionService, eventSource: PlayerEventSource) {
    this.auctionService = auctionService
    this.eventSource = eventSource

    this.kafkaProducer = client.producer()
    this.eventSource.onPlayerConnect(this.handlePlayerConnect)
    this.eventSource.onPlayerDisconnect(this.handlePlayerDisconnect)
    this.auctionService.onAuctionEnd(this.handleAuctionEnd)
    this.auctionService.onRoundEnd(this.handleRoundEnd)
    this.auctionService.onNewBid(this.handleNewBid)
    this.auctionService.onNewSale(this.handleNewSale)
  }

  async connect(): Promise<void> {
    await this.kafkaProducer.connect()
  }

  private async emitEvent(topic: string, payload: AuctionEvent): Promise<void> {
    try {
      await this.kafkaProducer.send({
        topic,
        messages: [{ value: JSON.stringify(payload) }],
      })
      logger.debug(`Emitted event to Kafka - Topic: ${topic}, Payload: ${JSON.stringify(payload)}`)
    } catch (error) {
      logger.debug(`Failed to emit Kafka event: ${error}`)
    }
  }

  private handlePlayerConnect = (playerId: string): void => {
    this.auctionService
      .getPlayerAuction(playerId)
      .then(async auction => {
        const msg = playerConnectedEvent(auction.id, playerId)
        await this.emitEvent('player-events', msg)
      })
      .catch(error => {
        logger.debug(`[KafkaProducer] Failed to get auction for player ${playerId}: ${error}, 
        the auction might have ended`)
      })
  }

  private handlePlayerDisconnect = (playerId: string): void => {
    this.auctionService
      .getPlayerAuction(playerId)
      .then(async auction => {
        const msg = playerDisconnectedEvent(auction.id, playerId)
        await this.emitEvent('player-events', msg)
      })
      .catch(error => {
        logger.error(`[KafkaProducer] Failed to get auction for player ${playerId}: ${error}, 
        the auction might have ended`)
      })
  }

  private handleAuctionEnd = async (leaderboard: Leaderboard, auctionId: string): Promise<void> => {
    const msg = auctionEndEvent(auctionId, leaderboard)
    await this.emitEvent('auction-events', msg)
  }

  private handleRoundEnd = async (auction: Auction): Promise<void> => {
    const msg = roundEndEvent(auction.id)
    await this.emitEvent('auction-events', msg)
  }
  private handleNewBid = async (auction: Auction) => {
    const msg = bidEvent(auction)
    await this.emitEvent('auction-events', msg)
  }
  private handleNewSale = async (auction: Auction) => {
    const msg = saleEvent(auction)
    await this.emitEvent('auction-events', msg)
  }
}
