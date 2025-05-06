import logger from '@auction/common/logger'

export class AuctionTimer {
  startTime: number | null = null
  isRunning: boolean = false
  private timeoutId: NodeJS.Timeout | null = null
  private readonly duration: number

  constructor(
    public readonly id: string,
    duration: number,
    private readonly onComplete: () => void,
    initialStartTime?: number
  ) {
    this.duration = duration
    if (initialStartTime) {
      this.startTime = initialStartTime
    }
  }

  start(): void {
    if (this.isRunning) {
      logger.debug(`Timer ${this.id} is already running`)
      return
    }

    // If we have an initial start time, calculate the remaining time
    let timeToWait = this.duration
    if (this.startTime) {
      const elapsedTime = Date.now() - this.startTime
      timeToWait = Math.max(0, this.duration - elapsedTime)
    } else {
      this.startTime = Date.now()
    }

    this.isRunning = true
    logger.debug(`Starting timer ${this.id} for ${timeToWait}ms`)

    this.timeoutId = setTimeout(() => {
      this.isRunning = false
      this.startTime = null
      this.onComplete()
    }, timeToWait)
  }

  stop(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
    this.isRunning = false
    logger.debug(`Stopped timer ${this.id}`)
  }

  refresh(): void {
    this.stop()
    this.startTime = Date.now()
    this.start()
    logger.debug(`Refreshed timer ${this.id}`)
  }

  getTimeLeft(): number {
    if (!this.startTime || !this.isRunning) {
      return 0
    }
    const elapsed = Date.now() - this.startTime
    return Math.max(0, this.duration - elapsed)
  }
}
