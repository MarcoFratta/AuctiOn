export class AuctionTimer {
  private timer: NodeJS.Timeout | undefined

  constructor(
    private readonly _auctionId: string,
    private readonly _duration: number,
    private readonly _onEnd: () => void
  ) {}

  private _startTime: number | undefined

  get startTime(): number | undefined {
    return this._startTime
  }

  private _isRunning: boolean = false

  get isRunning(): boolean {
    return this._isRunning
  }

  get auctionId(): string {
    return this._auctionId
  }

  get duration(): number {
    return this._duration
  }

  start(): void {
    this.stop() // Clear any existing timer
    this._startTime = Date.now()
    this._isRunning = true
    this.timer = setTimeout(() => {
      this._isRunning = false
      this._onEnd()
    }, this._duration)
  }

  stop(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this._isRunning = false
      this.timer = undefined
    }
  }

  refresh(): void {
    this.start()
  }

  getTimeLeft(): number {
    if (!this._startTime || !this._isRunning) {
      return 0
    }
    const elapsed = Date.now() - this._startTime
    return Math.max(0, this._duration - elapsed)
  }
}
