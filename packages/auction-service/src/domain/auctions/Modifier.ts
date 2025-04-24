import { Leaderboard, LeaderboardEntry, leaderboardSchema } from '../../schemas/Leaderboard'
import { InventoryOutput, ItemWeights } from '../../schemas/Item'
import { validateSchema } from '@auction/common/validation'
import { AuctionInfo } from '../../schemas/Auction'

export interface LeaderboardModifier {
  apply: (leaderboard: Leaderboard) => Leaderboard
}

export interface AuctionModifier {
  apply: (auctionInfo: AuctionInfo) => AuctionInfo
}

export class Modifiers {
  static modifyAuction(modifiers: AuctionModifier[], auctionInfo: AuctionInfo): AuctionInfo {
    return modifiers.reduce((auction, modifier) => modifier.apply(auction), auctionInfo)
  }

  static modifyLeaderboard(modifiers: LeaderboardModifier[], leaderboard: Leaderboard): Leaderboard {
    return modifiers.reduce((leaderboard, modifier) => modifier.apply(leaderboard), leaderboard)
  }
  static noMostItems(): LeaderboardModifier {
    return {
      apply: (leaderboard: Leaderboard) => {
        if (leaderboard.leaderboard.length === 0) {
          return leaderboard
        }
        // Find the max inventory size
        const maxItems = Math.max(...leaderboard.leaderboard.map(player => this.inventorySize(player.inventory)))

        // Find all players who have the max inventory size
        const playersToRemove = leaderboard.leaderboard.filter(player => this.inventorySize(player.inventory) === maxItems)
        return this.updateLeaderboard(playersToRemove, leaderboard)
      },
    }
  }

  static noZeroItems(): LeaderboardModifier {
    return {
      apply: (leaderboard: Leaderboard) => {
        if (leaderboard.leaderboard.length === 0) {
          return leaderboard
        }
        // Find all players who have zero items
        const playersToRemove = leaderboard.leaderboard.filter(player => this.inventorySize(player.inventory) === 0)
        return this.updateLeaderboard(playersToRemove, leaderboard)
      },
    }
  }

  static withSetCollection(): AuctionModifier {
    return {
      apply: (auctionInfo: AuctionInfo) => {
        const setSize = 3
        auctionInfo.players = auctionInfo.players.map(p => {
          p.money += Array(...p.inventory.entries())
            .map(([k, v]) => Math.floor(v / setSize) * 10 * ItemWeights[k])
            .reduce((acc, v) => acc + v, 0)
          return p
        })
        return auctionInfo
      },
    }
  }

  private static inventorySize(inventory: InventoryOutput): number {
    return inventory.items.map(i => i.quantity).reduce((acc, curr) => acc + curr, 0)
  }

  private static updatePosition(initPos: number, positionsToRemove: number[]): number {
    return initPos - positionsToRemove.filter(pos => pos < initPos).length
  }

  private static updateLeaderboard(playersToRemove: LeaderboardEntry[], leaderboard: Leaderboard): Leaderboard {
    const positionToRemove = playersToRemove.map(player => player.position)
    const idToRemove = playersToRemove.map(player => player.id)
    const updatedLeaderboard = leaderboard.leaderboard
      .filter(player => !idToRemove.includes(player.id))
      .map(player => ({
        ...player,
        position: this.updatePosition(player.position, positionToRemove),
      }))
    return validateSchema(leaderboardSchema, {
      leaderboard: updatedLeaderboard,
      removed: [
        ...leaderboard.removed,
        ...playersToRemove.map(player => {
          return {
            ...player,

            position: undefined,
          }
        }),
      ],
    })
  }
}
