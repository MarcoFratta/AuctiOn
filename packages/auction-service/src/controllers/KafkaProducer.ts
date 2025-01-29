import { PlayerEventSource } from '../adapters/PlayerEventSource'
import { AuctionService } from '../services/AuctionService'
import { Kafka, Producer } from 'kafkajs'
import logger from '../utils/Logger'
import { Auction } from '../schemas/Auction'
import { AuctionEvent } from '../schemas/AuctionEvents'
import {
  toAuctionEndEvent,
  toBidEvent,
  toPlayerConnectedEvent,
  toPlayerDisconnectedEvent,
  toRoundEndEvent,
  toSaleEvent,
} from '../converters/EventConverter'

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
      logger.info(`Emitted event to Kafka - Topic: ${topic}, Payload: ${JSON.stringify(payload)}`)
    } catch (error) {
      logger.error(`Failed to emit Kafka event: ${error}`)
    }
  }

  private handlePlayerConnect = (playerId: string): void => {
    this.auctionService
      .getPlayerAuction(playerId)
      .then(async auction => {
        const msg = toPlayerConnectedEvent(playerId).convert(auction)
        await this.emitEvent('player-events', msg)
      })
      .catch(error => {
        logger.error(`[KafkaProducer] Failed to get auction for player ${playerId}: ${error}`)
      })
  }

  private handlePlayerDisconnect = (playerId: string): void => {
    this.auctionService
      .getPlayerAuction(playerId)
      .then(async auction => {
        const msg = toPlayerDisconnectedEvent(playerId).convert(auction)
        await this.emitEvent('player-events', msg)
      })
      .catch(error => {
        logger.error(`[KafkaController] Failed to get auction for player ${playerId}: ${error}`)
      })
  }

  private handleAuctionEnd = async (auction: Auction): Promise<void> => {
    const msg = toAuctionEndEvent.convert(auction)
    await this.emitEvent('auction-events', msg)
  }

  private handleRoundEnd = async (auction: Auction): Promise<void> => {
    const msg = toRoundEndEvent.convert(auction)
    await this.emitEvent('auction-events', msg)
  }
  private handleNewBid = async (auction: Auction) => {
    const msg = toBidEvent.convert(auction)
    await this.emitEvent('auction-events', msg)
  }
  private handleNewSale = async (auction: Auction) => {
    const msg = toSaleEvent.convert(auction)
    await this.emitEvent('auction-events', msg)
  }
}
