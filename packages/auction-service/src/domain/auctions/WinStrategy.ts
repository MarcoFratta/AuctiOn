import { Leaderboard } from '../../schemas/Leaderboard'
import { AuctionInfo } from '../../schemas/Auction'

export interface WinStrategy {
  computeLeaderboard: (auction: AuctionInfo) => Leaderboard
}
