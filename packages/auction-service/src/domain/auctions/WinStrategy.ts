import { Auction } from '../../schemas/Auction'
import { Leaderboard } from '../../schemas/Leaderboard'

export interface WinStrategy {
  computeLeaderboard: (auction: Auction) => Leaderboard
}
