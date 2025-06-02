import { PlayerEventSource } from '../adapters/PlayerEventSource'
import { AuctionService } from '../services/AuctionService'
import { Kafka, Producer } from 'kafkajs'
import logger from '@auction/common/logger'
import { AuctionInfo } from '../schemas/Auction'
import { AuctionEvent } from '@auction/common/events/auction'
import { Leaderboard } from '../schemas/Leaderboard'
import * as factory from '../domain/events/EventsFactory'
import { UserService } from '../services/UserService'
import { LobbyEvent } from '@auction/common/events/lobby'
import { Player, PlayerInfo } from '../schemas/Player'
import { AuctionEventsSource } from '../services/AuctionEventsSource'
import { TimerEventSource } from '../services/TimerEventSource'

export class AuctionProducer {
  private kafkaProducer: Producer

  constructor(
    client: Kafka,
    private auctionService: AuctionService,
    private auctionEventsSource: AuctionEventsSource,
    private eventSource: PlayerEventSource,
    private userService: UserService,
    private timerEventSource: TimerEventSource
  ) {
    this.auctionService = auctionService
    this.eventSource = eventSource
    this.userService = userService

    this.kafkaProducer = client.producer()
    this.eventSource.onPlayerConnect(this.handlePlayerConnect)
    this.eventSource.onPlayerDisconnect(this.handlePlayerDisconnect)
    this.auctionEventsSource.onAuctionEnd(this.handleAuctionEnd)
    this.auctionEventsSource.onRoundEnd(this.handleRoundEnd)
    this.auctionEventsSource.onNewBid(this.handleNewBid)
    this.auctionEventsSource.onNewSale(this.handleNewSale)
    this.auctionEventsSource.onAuctionStart(this.handleAuctionStart)
    this.auctionEventsSource.onPlayerLeave(this.handlePlayerLeave)
    this.auctionEventsSource.onPlayerJoin(this.handlePlayerJoin)
    this.auctionEventsSource.onAuctionDeleted(this.handleAuctionDeleted)
    this.userService.onPlayerChange(this.handlePlayerChange)
    this.timerEventSource.onTimerStart(this.handleTimerStart)
  }

  async connect(): Promise<void> {
    await this.kafkaProducer.connect()
  }

  private async emitEvent(topic: string, payload: AuctionEvent | LobbyEvent): Promise<void> {
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
        const msg = factory.playerConnectedEvent(auction.id, playerId)
        await this.emitEvent('auction-events', msg)
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
        const msg = factory.playerDisconnectedEvent(auction.id, playerId)
        await this.emitEvent('auction-events', msg)
      })
      .catch(error => {
        logger.debug(`[KafkaProducer] Failed to get auction for player ${playerId}: ${error}, 
        the auction might have ended`)
      })
  }

  private handleAuctionEnd = async (leaderboard: Leaderboard, auctionId: string): Promise<void> => {
    const msg = factory.auctionEndEvent(auctionId, leaderboard)
    await this.emitEvent('auction-events', msg)
  }

  private handleRoundEnd = async (auction: AuctionInfo): Promise<void> => {
    const msg = factory.roundEndEvent(auction.id)
    await this.emitEvent('auction-events', msg)
  }
  private handleNewBid = async (auction: AuctionInfo) => {
    const msg = factory.bidEvent(auction)
    await this.emitEvent('auction-events', msg)
  }
  private handleNewSale = async (auction: AuctionInfo) => {
    const msg = factory.saleEvent(auction)
    await this.emitEvent('auction-events', msg)
  }
  private handleAuctionStart = async (auction: AuctionInfo) => {
    const msg = factory.auctionStartEvent(auction.id)
    await this.emitEvent('auction-events', msg)
  }
  private handlePlayerLeave = async (auctionId: string, playerId: string) => {
    const msg = factory.playerLeaveEvent(auctionId, playerId)
    await this.emitEvent('auction-events', msg)
  }
  private handlePlayerJoin = async (auctionId: string, playerId: string) => {
    try {
      const player = await this.userService.getUser(playerId)
      logger.debug(`[KafkaProducer] Player ${player} joined auction ${auctionId}`)
      if (!player) {
        logger.error(`Player ${playerId} not found`)
        return
      }
      const msg = factory.playerJoinEvent(auctionId, playerId, player)
      logger.debug(`[KafkaProducer] Emitting player join event: ${JSON.stringify(msg)}`)
      await this.emitEvent('auction-events', msg)
    } catch (_e) {
      logger.warn(`[KafkaProducer] Error handling player join: ${_e}`)
    }
  }
  private handleAuctionDeleted = async (auction: AuctionInfo) => {
    const msg = factory.auctionDeletedEvent(auction.id)
    await this.emitEvent('auction-events', msg)
  }
  private handlePlayerChange = async (id: Player['id'], playerInfo: PlayerInfo) => {
    const msg = factory.playerLobbyInfoEvent(id, playerInfo)
    await this.emitEvent('auction-events', msg)
  }
  private handleTimerStart = async (auctionId: string, timerStart: number) => {
    const msg = factory.timerStartEvent(auctionId, timerStart)
    await this.emitEvent('auction-events', msg)
  }
}
