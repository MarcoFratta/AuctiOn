import { WinStrategy } from './WinStrategy'
import { Leaderboard, leaderboardEntry, leaderboardSchema } from '../../schemas/Leaderboard'
import { validateSchema } from '@auction/common/validation'
import { toInventory, toWeight } from '../../converters/AuctionConverter'
import { Player } from '../../schemas/Player'
import { AuctionInfo } from '../../schemas/Auction'

export class WinStrategyFactory {
  static byMoney(): WinStrategy {
    return {
      computeLeaderboard: (auction: AuctionInfo): Leaderboard => {
        const maxMoney = auction.players.reduce((max, player) => Math.max(max, player.money), 0)
        return validateSchema(leaderboardSchema, {
          leaderboard: auction.players
            .sort((a, b) => b.money - a.money) // Highest money first
            .map((player, index) =>
              validateSchema(leaderboardEntry, {
                id: player.id,
                position: player.money == maxMoney ? 1 : index + 1,
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
      computeLeaderboard: (auction: AuctionInfo): Leaderboard => {
        const maxWeight = auction.players.reduce((max, player) => Math.max(max, toWeight.convert(toInventory.convert(player.inventory))), 0)
        return validateSchema(leaderboardSchema, {
          leaderboard: auction.players
            .sort(
              (a: Player, b: Player) =>
                toWeight.convert(toInventory.convert(b.inventory)) - toWeight.convert(toInventory.convert(a.inventory))
            ) // Highest weight first
            .map((player, index) =>
              validateSchema(leaderboardEntry, {
                id: player.id,
                position: toWeight.convert(toInventory.convert(player.inventory)) == maxWeight ? 1 : index + 1,
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
