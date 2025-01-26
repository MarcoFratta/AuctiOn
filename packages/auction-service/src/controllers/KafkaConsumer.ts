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
          const event = validateSchema(LobbyEventTypeSchema, message)
          await this.handleLobbyEvent(event, message)
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
    logger.info(`Processing lobby event: ${type}`)
    match(type.type)
      .with('lobby-started', () => {
        // TODO: start the timer counter
        // const event = validateSchema(LobbyStartedEvent, msg);
        //         this.auctionService.startAuction(event.lobbyId);
      })
      .with('lobby-joined', () => {
        const event = validateSchema(LobbyJoinedEvent, msg)
        this.auctionService.playerJoin(event.playerId, event.lobbyId)
      })
      .with('lobby-created', async () => {
        const event = validateSchema(LobbyCreatedEvent, msg)
        await this.auctionService.createAuction(event.lobby.lobbyId)
        await this.auctionService.playerJoin(event.lobby.creatorId, event.lobby.lobbyId)
      })
      .with('lobby-left', () => {
        const event = validateSchema(LobbyLeftEvent, msg)
        this.auctionService.playerLeave(event.playerId, event.lobbyId)
      })
      .otherwise(() => {
        logger.info(`Unknown lobby event type: ${type}`)
      })
  }
}
