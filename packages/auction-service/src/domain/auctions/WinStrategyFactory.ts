import { WinStrategy } from './WinStrategy'
import { Leaderboard, leaderboardEntry, leaderboardSchema } from '../../schemas/Leaderboard'
import { Auction } from '../../schemas/Auction'
import { validateSchema } from '@auction/common/validation'
import { toInventory, toWeight } from '../../converters/AuctionConverter'
import { Player } from '../../schemas/Player'

export class WinStrategyFactory {
  static byMoney(): WinStrategy {
    return {
      computeLeaderboard: (auction: Auction): Leaderboard => {
        return validateSchema(leaderboardSchema, {
          leaderboard: auction.players
            .sort((a, b) => b.money - a.money) // Highest money first
            .map((player, index) =>
              validateSchema(leaderboardEntry, {
                id: player.id,
                position: index + 1,
                money: player.money,
                inventory: toInventory.convert(player.inventory),
              })
            ),
          removed: [],
        })
      },
    }
  }

  static byWeight(): WinStrategy {
    return {
      computeLeaderboard: (auction: Auction): Leaderboard => {
        return validateSchema(leaderboardSchema, {
          leaderboard: auction.players
            .sort(
              (a: Player, b: Player) =>
                toWeight.convert(toInventory.convert(b.inventory)) - toWeight.convert(toInventory.convert(a.inventory))
            ) // Highest weight first
            .map((player, index) =>
              validateSchema(leaderboardEntry, {
                id: player.id,
                position: index + 1,
                money: player.money,
                inventory: toInventory.convert(player.inventory),
              })
            ),
          removed: [],
        })
      },
    }
  }
}
