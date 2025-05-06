import { AuctionService } from './AuctionService'
import logger from '@auction/common/logger'
import { PlayerChannel } from '../adapters/PlayerChannel'
import { AuctionTimer } from '../domain/auctions/Timer'
import { AuctionInfo } from '../schemas/Auction'
import { PlayerEventSource } from '../adapters/PlayerEventSource'
import { timerStartMessage } from '../domain/messages/MessageFactory'
import { TimerEventSource } from './TimerEventSource'
import { TimerRepo } from '../repositories/TimerRepo'
import { AuctionEventsSource } from './AuctionEventsSource'

export class TimerServiceImpl implements TimerEventSource {
  private localTimers: Map<string, AuctionTimer> = new Map()
  private callbacks: ((auctionId: string, timerStart: number) => void)[] = []

  constructor(
    private readonly auctionService: AuctionService,
    private readonly playerChannel: PlayerChannel,
    private readonly playerEventSource: PlayerEventSource,
    private readonly timerRepo: TimerRepo,
    private readonly auctionEventsSource: AuctionEventsSource
  ) {
    this.subscribeToEvents()
  }

  onTimerStart(callback: (auctionId: string, timerStart: number) => void): void {
    this.callbacks.push(callback)
  }

  private subscribeToEvents(): void {
    this.auctionService.onNewSale(async auction => {
      logger.debug(`Starting timer for auction ${auction.id}`)
      await this.startTimer(auction.id, auction.bidTime)
      const timer = this.localTimers.get(auction.id)
      if (timer && timer.startTime) {
        this.notifyTimerStart(auction.id, timer.startTime)
      }
    })

    this.auctionService.onAuctionEnd(async (_, auctionId) => {
      logger.debug('Auction ended, clearing timers')
      this.localTimers.delete(auctionId)
      await this.timerRepo.removeTimer(auctionId)
    })
    this.auctionService.onAuctionDeleted(async auction => {
      logger.debug('Auction deleted, clearing timers')
      const timer = this.localTimers.get(auction.id)
      if (timer) {
        logger.debug(`Stopping timer for auction ${auction.id}`)
        timer.stop()
      } else {
        logger.debug(`No timer found for auction ${auction.id}`)
      }
      this.localTimers.delete(auction.id)
      await this.timerRepo.removeTimer(auction.id)
    })

    this.playerEventSource.onPlayerConnect(playerId => {
      this.auctionService
        .getPlayerAuction(playerId)
        .then(async auction => {
          if (!auction.startTimestamp || !auction.currentSale) {
            return
          }
          logger.debug(`Getting timer for auction ${auction.id} for player ${playerId}`)
          const timer = await this.timerRepo.getTimer(auction.id)
          if (!timer) {
            return
          }
          this.playerChannel.sendToPlayer(playerId, timerStartMessage(timer))
        })
        .catch(error => {
          logger.debug(`[TimerController] Failed to get auction for player ${playerId}: ${error}`)
        })
    })
    this.auctionEventsSource.onNewBid(async (auction: AuctionInfo) => {
      logger.debug(`[TimerController] Refreshing timer for auction ${auction.id}`)
      if (this.localTimers.has(auction.id)) {
        logger.debug(`Refreshing local timer for auction ${auction.id}`)
        await this.refreshTimer(auction.id, auction.bidTime)
        const timer = this.localTimers.get(auction.id)
        if (timer && timer.startTime) {
          this.notifyTimerStart(auction.id, timer.startTime)
        }
      }
    })
  }

  private async startTimer(auctionId: string, duration: number, startTime: number = Date.now()): Promise<void> {
    // Stop existing timer if any
    const existingTimer = this.localTimers.get(auctionId)
    if (existingTimer) {
      existingTimer.stop()
    }
    this.localTimers.delete(auctionId)
    // Create and start new local timer
    const timer = new AuctionTimer(auctionId, duration * 1000 + 100, async () => {
      try {
        logger.debug(`[Timer] Ending round for auction ${auctionId}`)
        this.localTimers.delete(auctionId)
        await this.timerRepo.removeTimer(auctionId)
        await this.auctionService.endRound(auctionId)
      } catch (error) {
        logger.warn(`Error ending round for auction ${auctionId}:`, error)
      }
    })

    this.localTimers.set(auctionId, timer)
    timer.start()
    await this.timerRepo.saveTimer(auctionId, startTime, duration)
    // Notify listeners about timer start
  }

  private async refreshTimer(auctionId: string, duration: number): Promise<void> {
    const timer = this.localTimers.get(auctionId)
    if (!timer) {
      logger.warn(`Cannot refresh timer for auction ${auctionId}: Timer not found`)
      return
    }
    timer.refresh()
    // Update the timer in Redis with a new TTL
    await this.timerRepo.saveTimer(auctionId, timer.startTime!, duration)
    // Notify listeners about timer refresh
  }

  private notifyTimerStart(auctionId: string, startTime: number): void {
    logger.debug(`Notifying timer start for auction ${auctionId} at ${startTime}`)
    for (const callback of this.callbacks) {
      try {
        callback(auctionId, startTime)
      } catch (error) {
        logger.error(`Error in timer start callback:`, error)
      }
    }
  }
}
