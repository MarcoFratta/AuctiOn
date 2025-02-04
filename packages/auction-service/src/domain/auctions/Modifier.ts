import { Leaderboard, LeaderboardEntry } from '../../schemas/Leaderboard'
import { InventoryOutput } from '../../schemas/Item'

export interface LeaderboardModifier {
  apply: (leaderboard: Leaderboard) => Leaderboard
}

export class Modifiers {
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
    return {
      leaderboard: updatedLeaderboard,
      removed: [...leaderboard.removed, ...playersToRemove],
    }
  }
}
