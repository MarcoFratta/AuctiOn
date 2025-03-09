import { AuctionEventsSource } from './AuctionEventsSource'
import { Leaderboard } from '../schemas/Leaderboard'
import { Auction } from '../domain/auctions/Auction'
import { AuctionInfo } from '../schemas/Auction'

export class CallbacksService implements AuctionEventsSource {
  private auctionsCallbacks = new Map<string, ((auction: AuctionInfo) => void)[]>()
  private leaderBoardCallbacks: ((leaderboard: Leaderboard, auctionId: string) => void)[] = []
  private playersCallbacks = new Map<string, ((auctionId: string, playerId: string) => void)[]>()

  constructor() {
    const auctionTypes = ['onRoundEnd', 'onAuctionEnd', 'onAuctionStarted', 'onNewBid', 'onNewSale', 'onAuctionDeleted']
    const playerTypes = ['onPlayerJoin', 'onPlayerLeave']
    auctionTypes.forEach(t => this.auctionsCallbacks.set(t, []))
    playerTypes.forEach(t => this.playersCallbacks.set(t, []))
  }

  onAuctionEnd(callback: (auction: Leaderboard, auctionId: Auction['id']) => void): void {
    this.leaderBoardCallbacks.push(callback)
  }

  onAuctionStart(callback: (auction: AuctionInfo) => void) {
    this.auctionsCallbacks.get('onAuctionStarted')!.push(callback)
  }

  onRoundEnd(callback: (auction: AuctionInfo) => void): void {
    this.auctionsCallbacks.get('onRoundEnd')!.push(callback)
  }

  onPlayerJoin(callback: (auctionId: string, playerId: string) => void): void {
    this.playersCallbacks.get('onPlayerJoin')!.push(callback)
  }

  onPlayerLeave(callback: (auctionId: string, playerId: string) => void): void {
    this.playersCallbacks.get('onPlayerLeave')!.push(callback)
  }

  onAuctionDeleted(callback: (auction: AuctionInfo) => void): void {
    this.auctionsCallbacks.get('onAuctionDeleted')!.push(callback)
  }

  onNewBid(callback: (auction: AuctionInfo) => void): void {
    this.auctionsCallbacks.get('onNewBid')!.push(callback)
  }

  onNewSale(callback: (auction: AuctionInfo) => void): void {
    this.auctionsCallbacks.get('onNewSale')!.push(callback)
  }

  notifyAuctionUpdate(res: AuctionInfo, type: string) {
    this.auctionsCallbacks.get(type)!.forEach(callback => callback(res))
  }

  notifyPlayerUpdate(auctionId: string, playerId: string, type: string) {
    this.playersCallbacks.get(type)!.forEach(callback => callback(auctionId, playerId))
  }

  notifyLeaderBoardUpdate(leaderboard: Leaderboard, auctionId: string) {
    this.leaderBoardCallbacks.forEach(callback => callback(leaderboard, auctionId))
  }
}
