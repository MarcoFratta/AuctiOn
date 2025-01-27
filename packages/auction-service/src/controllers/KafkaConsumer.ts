import { Consumer, EachMessagePayload, Kafka } from 'kafkajs'
import { AuctionService } from '../services/AuctionService'
import { validateSchema } from '../utils/Validator'
import logger from '../utils/Logger'
import { LobbyCreatedEvent, LobbyEventType, LobbyEventTypeSchema, LobbyJoinedEvent, LobbyLeftEvent } from '../schemas/LobbyEvents'
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
          const type: LobbyEventType = validateSchema(LobbyEventTypeSchema, message)
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
          const event = validateSchema(LobbyCreatedEvent, msg)
          await this.auctionService.createAuction(event.lobby)
        })
        .with('lobby-joined', async () => {
          const event = validateSchema(LobbyJoinedEvent, msg)
          await this.auctionService.playerJoin(event.playerId, event.lobbyId)
        })
        .with('lobby-created', async () => {
          const event = validateSchema(LobbyCreatedEvent, msg)
          await this.auctionService.createAuction(event.lobby)
          await this.auctionService.playerJoin(event.creator, event.lobby.id)
        })
        .with('lobby-left', async () => {
          const event = validateSchema(LobbyLeftEvent, msg)
          await this.auctionService.playerLeave(event.playerId, event.lobbyId)
        })
        .otherwise(() => {
          logger.info(`Unknown lobby event type: ${type}`)
        })
    } catch (e) {
      logger.error(`[KafkaConsumer] Error handling message: ${e}`)
    }
  }
}
