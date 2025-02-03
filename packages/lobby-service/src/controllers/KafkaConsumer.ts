import { Consumer, EachMessagePayload, Kafka } from 'kafkajs'
import { validateSchema } from '@auction/common/validation'
import logger from '@auction/common/logger'
import { match } from 'ts-pattern'
import { AuctionEventType, AuctionEventTypeSchema, EndAuctionEventSchema } from '../schemas/AuctionEvents'
import { LobbyService } from '../services/LobbyService'

export class KafkaConsumer {
  private consumer: Consumer
  private lobbyService: LobbyService

  constructor(kafka: Kafka, auctionService: LobbyService, groupId: string) {
    this.consumer = kafka.consumer({ groupId })
    this.lobbyService = auctionService
  }

  async connect(): Promise<void> {
    await this.consumer.connect()
    await this.consumer.subscribe({ topic: 'auction-events', fromBeginning: true })

    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        try {
          const message = JSON.parse(payload.message.value?.toString() || '')
          const type: AuctionEventType = validateSchema(AuctionEventTypeSchema, message)
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

  private async handleLobbyEvent(msg: any, type: AuctionEventType): Promise<void> {
    logger.info(`Processing lobby event: ${JSON.stringify(type)}`)
    try {
      match(type.type)
        .with('end-auction', async () => {
          try {
            const event = validateSchema(EndAuctionEventSchema, msg)
            await this.lobbyService.terminateMatch(event.auctionId)
          } catch (error) {
            logger.error(`Failed to terminate match: ${error}`)
          }
        })
        .otherwise(() => {
          logger.info(`Unknown lobby event type: ${type}`)
        })
    } catch (e) {
      logger.error(`[KafkaConsumer] Error handling message: ${e}`)
    }
  }
}
