import { Consumer, EachMessagePayload, Kafka } from 'kafkajs'
import { AuctionService } from '../services/AuctionService'
import { validateSchema } from '@auction/common/validation'
import logger from '@auction/common/logger'
import {
  lobbyCreatedEventSchema,
  lobbyDeletedEventSchema,
  LobbyEventType,
  lobbyEventTypeSchema,
  lobbyJoinedEventSchema,
  lobbyLeftEventSchema,
  lobbyStartedEventSchema,
  playerStatusEventSchema,
} from '@auction/common/events/lobby'
import { match } from 'ts-pattern'
import { auctionConfigSchema } from '../schemas/Auction'
import { UserService } from '../services/UserService'

export class KafkaConsumer {
  private consumer: Consumer
  private auctionService: AuctionService
  private userService: UserService

  constructor(kafka: Kafka, auctionService: AuctionService, groupId: string, userService: UserService) {
    this.consumer = kafka.consumer({ groupId })
    this.auctionService = auctionService
    this.userService = userService
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
          logger.debug('Error processing message:', error)
        }
      },
    })

    logger.info('Kafka consumer connected and subscribed to lobby-events')
  }

  async disconnect(): Promise<void> {
    await this.consumer.disconnect()
    logger.info('Kafka consumer disconnected')
  }

  private async handleLobbyEvent(msg: unknown, type: LobbyEventType): Promise<void> {
    logger.debug(`Processing lobby event: ${JSON.stringify(type)}`)
    try {
      match(type.type)
        .with('lobby-started', async () => {
          const event = validateSchema(lobbyStartedEventSchema, msg)
          await this.auctionService.startAuction(event.lobbyId)
        })
        .with('lobby-joined', async () => {
          const event = validateSchema(lobbyJoinedEventSchema, msg)
          await this.userService.addUser(event.playerId, {
            username: event.username,
            status: 'not-ready',
          })
          await this.auctionService.playerJoin(event.playerId, event.lobbyId)
        })
        .with('lobby-created', async () => {
          const event = validateSchema(lobbyCreatedEventSchema, msg)
          const lobby = validateSchema(auctionConfigSchema, { creatorId: event.creator, ...event.lobby })
          await this.auctionService.createAuction(lobby)
        })
        .with('lobby-left', async () => {
          const event = validateSchema(lobbyLeftEventSchema, msg)
          await this.userService.removeUser(event.playerId)
          await this.auctionService.playerLeave(event.playerId, event.lobbyId)
        })
        .with('lobby-deleted', async () => {
          const event = validateSchema(lobbyDeletedEventSchema, msg)
          this.auctionService.getAuction(event.lobbyId).then(auction => {
            auction.players.forEach(async player => {
              await this.userService.removeUser(player.id)
            })
          })
          await this.auctionService.removeAuction(event.lobbyId)
        })
        .with('player-status', async () => {
          const event = validateSchema(playerStatusEventSchema, msg)
          await this.userService.updateUser(event.playerId, { status: event.status })
        })
        .otherwise(() => {
          logger.debug(`[KafkaConsumer] Unknown lobby event type: ${type}`)
        })
    } catch (e) {
      logger.warn(`[KafkaConsumer] Error handling message: ${e}`)
    }
  }
}
