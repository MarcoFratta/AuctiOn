import { Consumer, EachMessagePayload, Kafka } from 'kafkajs'
import { AuctionService } from '../services/AuctionService'
import { validateSchema } from '@auction/common/validation'
import logger from '@auction/common/logger'
import {
  lobbyDeletedEventSchema,
  lobbyJoinedEventSchema,
  lobbyLeftEventSchema,
  lobbyStartedEventSchema,
} from '@auction/common/events/lobby'
import { match } from 'ts-pattern'
import { UserService } from '../services/UserService'
import { EventType, eventTypeSchema } from '../schemas/events/Events'
import { CallbacksService } from '../services/CallbacksService'
import { Player, PlayerInfo } from '../schemas/Player'
import { UserEventSource } from '../services/UserEventSource'
import {
  bidEventSchema,
  endAuctionEventSchema,
  endRoundEventSchema,
  playerConnectedEventSchema,
  playerDisconnectedEventSchema,
  playerUpdateEventSchema,
  saleEventSchema,
  timerStartSchema,
} from '@auction/common/events/auction'
import { TimerEventSource } from '../services/TimerEventSource'
import { Leaderboard } from '../schemas/Leaderboard'
import { PlayerEventSource } from '../adapters/PlayerEventSource'
import { util } from 'zod'
import * as crypto from 'node:crypto'
import Omit = util.Omit

export class AuctionConsumer
  extends CallbacksService
  implements UserEventSource, TimerEventSource, Omit<PlayerEventSource, 'onPlayerMessage'>
{
  private consumer: Consumer
  private auctionService: AuctionService
  private userService: UserService
  private playerCallbacks: ((id: Player['id'], playerInfo: PlayerInfo) => void)[] = []
  private timerCallbacks: ((auctionId: string, timerStart: number) => void)[] = []
  private playerConnectedCallbacks: ((playerId: string) => void)[] = []
  private playerDisconnectedCallbacks: ((playerId: string) => void)[] = []

  constructor(kafka: Kafka, auctionService: AuctionService, groupId: string, userService: UserService) {
    super()
    this.consumer = kafka.consumer({ groupId: `${groupId}-${Date.now()}-${crypto.randomUUID()}` })
    this.auctionService = auctionService
    this.userService = userService
  }

  async connect(): Promise<void> {
    await this.consumer.connect()
    await this.consumer.subscribe({ topic: 'auction-events' })
    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        try {
          const message = JSON.parse(payload.message.value?.toString() || '')
          const type: EventType = validateSchema(eventTypeSchema, message.type)
          logger.debug(`[Auction Consumer] Consuming event: ${JSON.stringify(message)}`)
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

  onPlayerChange(cb: (id: Player['id'], playerInfo: PlayerInfo) => void): void {
    this.playerCallbacks.push(cb)
  }

  onTimerStart(callback: (auctionId: string, timerStart: number) => void): void {
    this.timerCallbacks.push(callback)
  }

  onPlayerConnect(callback: (playerId: string) => void): void {
    this.playerConnectedCallbacks.push(callback)
  }

  onPlayerDisconnect(callback: (playerId: string) => void): void {
    this.playerDisconnectedCallbacks.push(callback)
  }

  private async handleLobbyEvent(msg: unknown, type: EventType): Promise<void> {
    logger.info(`Processing lobby event: ${JSON.stringify(type)}`)
    try {
      match(type)
        .with('lobby-started', async () => {
          const event = validateSchema(lobbyStartedEventSchema, msg)
          const auction = await this.auctionService.getAuction(event.lobbyId)
          this.notifyAuctionUpdate(auction, 'onAuctionStarted')
        })
        .with('lobby-joined', async () => {
          const event = validateSchema(lobbyJoinedEventSchema, msg)
          this.notifyPlayerUpdate(event.lobbyId, event.playerId, 'onPlayerJoin')
        })
        .with('lobby-left', async () => {
          const event = validateSchema(lobbyLeftEventSchema, msg)
          this.notifyPlayerUpdate(event.lobbyId, event.playerId, 'onPlayerLeave')
        })
        .with('lobby-deleted', async () => {
          const event = validateSchema(lobbyDeletedEventSchema, msg)
          const auction = await this.auctionService.getAuction(event.lobbyId)
          this.notifyAuctionUpdate(auction, 'onAuctionDeleted')
        })
        .with('player-update', async () => {
          const event = validateSchema(playerUpdateEventSchema, msg)
          const playerInfo = await this.userService.getUser(event.playerId)
          if (!playerInfo) {
            logger.debug(`[KafkaConsumer] Player info not found for ID: ${event.playerId} while sending status`)
            return
          }
          playerInfo.status = event.status
          this.playerCallbacks.forEach(cb => cb(event.playerId, playerInfo))
        })
        .with('bid', async () => {
          const event = validateSchema(bidEventSchema, msg)
          const auction = await this.auctionService.getAuction(event.auctionId)
          this.notifyAuctionUpdate(
            {
              ...auction,
              currentBid: {
                ...event.bid,
                playerId: event.playerId,
                timestamp: event.timestamp,
              },
            },
            'onNewBid'
          )
        })
        .with('sale', async () => {
          const event = validateSchema(saleEventSchema, msg)
          const auction = await this.auctionService.getAuction(event.auctionId)
          this.notifyAuctionUpdate(auction, 'onNewSale')
        })
        .with('end-round', async () => {
          const event = validateSchema(endRoundEventSchema, msg)
          const auction = await this.auctionService.getAuction(event.auctionId)
          this.notifyAuctionUpdate(auction, 'onRoundEnd')
        })
        .with('end-auction', async () => {
          const event = validateSchema(endAuctionEventSchema, msg)
          this.notifyLeaderBoardUpdate(event.leaderboard as Leaderboard, event.auctionId)
        })
        .with('timer-start', async () => {
          const event = validateSchema(timerStartSchema, msg)
          this.timerCallbacks.forEach(cb => cb(event.auctionId, event.timer))
        })
        .with('player-connected', () => {
          const event = validateSchema(playerConnectedEventSchema, msg)
          this.playerConnectedCallbacks.forEach(cb => cb(event.playerId))
        })
        .with('player-disconnected', () => {
          const event = validateSchema(playerDisconnectedEventSchema, msg)
          this.playerDisconnectedCallbacks.forEach(cb => cb(event.playerId))
        })
        .otherwise(() => {
          logger.debug(`[KafkaConsumer] Unknown lobby event type: ${type}`)
        })
    } catch (e) {
      logger.warn(`[Auction Listener] Error handling message: ${e}`)
    }
  }
}
