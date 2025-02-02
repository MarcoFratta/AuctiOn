import { Consumer, EachMessagePayload, Kafka } from 'kafkajs'
import { AuctionService } from '../services/AuctionService'
import { validateSchema } from '../utils/Validator'
import logger from '../utils/Logger'
import {
  lobbyCreatedEvent,
  lobbyDeletedEvent,
  LobbyEventType,
  lobbyEventTypeSchema,
  lobbyJoinedEvent,
  lobbyLeftEvent,
  lobbyStartedEvent,
} from '../schemas/LobbyEvents'
import { match } from 'ts-pattern'

export class KafkaConsumer {
  private consumer: Consumer
  private auctionService: AuctionService

  constructor(kafka: Kafka, auctionService: AuctionService, groupId: string) {
    this.consumer = kafka.consumer({ groupId })
    this.auctionService = auctionService
  }

  async connect(): Promise<void> {
    await this.consumer.connect()
    await this.consumer.subscribe({ topic: 'lobby-events', fromBeginning: true })

    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        try {
          const message = JSON.parse(payload.message.value?.toString() || '')
          const type: LobbyEventType = validateSchema(lobbyEventTypeSchema, message)
          await this.handleLobbyEvent(message, type)
        } catch (error) {
          logger.error('Error processing message:', error)
        }
      },
    })

    logger.info('Kafka consumer connected and subscribed to lobby-events')
  }

  async disconnect(): Promise<void> {
    await this.consumer.disconnect()
    logger.info('Kafka consumer disconnected')
  }

  private async handleLobbyEvent(msg: any, type: LobbyEventType): Promise<void> {
    logger.info(`Processing lobby event: ${JSON.stringify(type)}`)
    try {
      match(type.type)
        .with('lobby-started', async () => {
          const event = validateSchema(lobbyStartedEvent, msg)
          await this.auctionService.startAuction(event.lobbyId)
        })
        .with('lobby-joined', async () => {
          const event = validateSchema(lobbyJoinedEvent, msg)
          await this.auctionService.playerJoin(event.playerId, event.lobbyId)
        })
        .with('lobby-created', async () => {
          const event = validateSchema(lobbyCreatedEvent, msg)
          await this.auctionService.createAuction(event.lobby)
          await this.auctionService.playerJoin(event.creator, event.lobby.id)
        })
        .with('lobby-left', async () => {
          const event = validateSchema(lobbyLeftEvent, msg)
          await this.auctionService.playerLeave(event.playerId, event.lobbyId)
        })
        .with('lobby-deleted', async () => {
          const event = validateSchema(lobbyDeletedEvent, msg)
          await this.auctionService.removeAuction(event.lobbyId)
        })
        .otherwise(() => {
          logger.info(`Unknown lobby event type: ${type}`)
        })
    } catch (e) {
      logger.error(`[KafkaConsumer] Error handling message: ${e}`)
    }
  }
}
