export interface TimerEventSource {
  onTimerStart(callback: (auctionId: string, timerStart: number) => void): void
}
