import { AuctionService } from '../services/AuctionService'
import logger from '../utils/Logger'
import { PlayerChannel } from '../adapters/PlayerChannel'
import { AuctionTimer } from '../domain/auctions/Timer'
import { validateSchema } from '../utils/Validator'
import { TimerMessageSchema } from '../schemas/TimeMessages'
import { Auction } from '../schemas/Auction'

export class TimerController {
  private timers: Map<string, AuctionTimer> = new Map()

  constructor(
    private readonly auctionService: AuctionService,
    private readonly playerChannel: PlayerChannel
  ) {
    this.subscribeToEvents()
  }

  // For cleanup in tests
  public stop(): void {
    this.clearAllTimers()
  }

  private subscribeToEvents(): void {
    this.auctionService.onNewSale(auction => {
      logger.info(`Starting timer for auction ${auction.id}`)
      this.startTimer(auction.id, auction.bidTime * 1000)
      this.sendTimeUpdate(auction)
    })

    this.auctionService.onNewBid(auction => {
      logger.info(`Refreshing timer for auction ${auction.id}`)
      this.getTimer(auction.id)?.refresh()
      this.sendTimeUpdate(auction)
    })

    this.auctionService.onAuctionEnd(() => {
      logger.info('Auction ended, clearing timers')
      this.clearAllTimers()
    })
  }

  private sendTimeUpdate(auction: Auction) {
    const msg = validateSchema(TimerMessageSchema, {
      type: 'timer-start',
      timestamp: this.timers.get(auction.id)!.startTime!,
    })
    this.playerChannel.broadcast(
      () => JSON.stringify(msg),
      id => auction.sellerQueue.includes(id)
    )
  }

  private startTimer(auctionId: string, duration: number): void {
    const timer = new AuctionTimer(auctionId, duration, async () => {
      try {
        await this.auctionService.endRound(auctionId)
      } catch (error) {
        logger.error(`Error ending round for auction ${auctionId}:`, error)
      }
    })

    const existingTimer = this.timers.get(auctionId)
    existingTimer?.stop()

    this.timers.set(auctionId, timer)
    timer.start()
  }

  private getTimer(auctionId: string): AuctionTimer | undefined {
    return this.timers.get(auctionId)
  }

  private clearAllTimers(): void {
    for (const timer of this.timers.values()) {
      timer.stop()
    }
    this.timers.clear()
  }
}
