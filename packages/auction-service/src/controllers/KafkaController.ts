import { PlayerEventSource } from '../adapters/PlayerEventSource'
import { AuctionService } from '../services/AuctionService'
import { Kafka, Producer } from 'kafkajs'
import logger from '../utils/Logger'
import { Auction } from '../schemas/Auction'
import { validateSchema } from '../utils/Validator'
import {
  AuctionEvent,
  BidEvent,
  BidEventSchema,
  EndAuctionEvent,
  EndAuctionEventSchema,
  EndRoundEvent,
  EndRoundEventSchema,
  PlayerConnectedEvent,
  PlayerConnectedEventSchema,
  PlayerDisconnectedEvent,
  PlayerDisconnectedEventSchema,
  SaleEvent,
  SaleEventSchema,
} from '../schemas/Events'
import { MessageType, MessageTypeSchema } from '../schemas/AuctionMessages'
import { match } from 'ts-pattern'

export class KafkaController {
  private auctionService: AuctionService
  private eventSource: PlayerEventSource
  private kafkaProducer: Producer

  constructor(client: Kafka, auctionService: AuctionService, eventSource: PlayerEventSource) {
    this.auctionService = auctionService
    this.eventSource = eventSource

    this.kafkaProducer = client.producer()
    this.eventSource.onPlayerConnect(this.handlePlayerConnect)
    this.eventSource.onPlayerDisconnect(this.handlePlayerDisconnect)
    this.eventSource.onPlayerMessage(this.handlePlayerMessage)
    this.auctionService.onAuctionEnd(this.handleAuctionEnd)
    this.auctionService.onRoundEnd(this.handleRoundEnd)
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
    this.auctionService.getPlayerAuction(playerId).then(async auction => {
      const payload = validateSchema<PlayerConnectedEvent>(PlayerConnectedEventSchema, {
        type: 'player-connected',
        playerId,
        auctionId: auction.id,
        timestamp: new Date(),
      })
      await this.emitEvent('player-events', payload)
    })
  }

  private handlePlayerDisconnect = (playerId: string): void => {
    this.auctionService.getPlayerAuction(playerId).then(async auction => {
      const payload = validateSchema<PlayerDisconnectedEvent>(PlayerDisconnectedEventSchema, {
        type: 'player-disconnected',
        playerId,
        auctionId: auction.id,
        timestamp: new Date(),
      })
      await this.emitEvent('player-events', payload)
    })
  }

  private handlePlayerMessage = async (playerId: string, message: string): Promise<void> => {
    try {
      const parsedMessage = JSON.parse(message)
      const msgType: MessageType = validateSchema(MessageTypeSchema, parsedMessage.type)
      match(msgType)
        .with('bid', () => async () => {
          const msg = validateSchema<BidEvent>(BidEventSchema, {
            type: 'player-bid',
            bid: parsedMessage.bid,
          })
          await this.emitEvent('player-events', msg)
        })
        .with('sell', async () => {
          const msg = validateSchema<SaleEvent>(SaleEventSchema, {
            type: 'player-sale',
            sale: parsedMessage.sale,
          })
          await this.emitEvent('player-events', msg)
        })
        .exhaustive()
    } catch (error) {
      logger.error(`Error processing player message from ${playerId}: ${error}`)
    }
  }

  private handleAuctionEnd = async (auction: Auction): Promise<void> => {
    const msg = validateSchema<EndAuctionEvent>(EndAuctionEventSchema, {
      type: 'end-auction',
      auctionId: auction.id,
      timestamp: new Date(),
    })
    await this.emitEvent('auction-events', msg)
  }

  private handleRoundEnd = async (auction: Auction): Promise<void> => {
    const msg = validateSchema<EndRoundEvent>(EndRoundEventSchema, {
      type: 'end-round',
      auctionId: auction.id,
      timestamp: new Date(),
    })
    await this.emitEvent('auction-events', msg)
  }
}
