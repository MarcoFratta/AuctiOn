import { Modifiers } from '../src/domain/auctions/Modifier'
import { Leaderboard } from '../src/schemas/Leaderboard'

describe('Modifiers tests', () => {
  function createPlayer(id: string, position: number, items: number,
                        money: number = 10): any {
    return {
      id,
      position,
      inventory: {
        items: [{ item: 'square', quantity: items }],
      },
      money: money,
    }
  }

  describe('Modifiers.noMostItems', () => {
    it('removes a single player with the most items', () => {
      const leaderboard: Leaderboard = {
        leaderboard: [
          createPlayer('p1', 1, 3),
          createPlayer('p2', 2, 10), // Most items
          createPlayer('p3', 3, 5),
        ],
        removed: [],
      }

      const modifier = Modifiers.noMostItems()
      const updated = modifier.apply(leaderboard)

      expect(updated.leaderboard).toHaveLength(2)
      expect(updated.leaderboard.map(p => p.id)).toEqual(['p1', 'p3']) // p2 is removed
      expect(updated.leaderboard.map(p => p.position)).toEqual([1, 2]) // Positions adjusted
      expect(updated.removed.map(p => p.id)).toContain('p2')
    })

    it('removes multiple players with the most items', () => {
      const leaderboard: Leaderboard = {
        leaderboard: [
          createPlayer('p1', 1, 3),
          createPlayer('p2', 2, 10), // Tie for most items
          createPlayer('p3', 3, 10), // Tie for most items
          createPlayer('p4', 4, 5),
        ],
        removed: [],
      }

      const modifier = Modifiers.noMostItems()
      const updated = modifier.apply(leaderboard)

      expect(updated.leaderboard).toHaveLength(2)
      expect(updated.leaderboard.map(p => p.id)).toEqual(['p1', 'p4'])
      expect(updated.leaderboard.map(p => p.position)).toEqual([1, 2]) // Positions shifted correctly
      expect(updated.removed.map(p => p.id)).toContain('p2')
      expect(updated.removed.map(p => p.id)).toContain('p3')
    })

    it('correctly shifts positions after removing a middle player', () => {
      const leaderboard: Leaderboard = {
        leaderboard: [
          createPlayer('p1', 1, 3),
          createPlayer('p2', 2, 10), // Most items
          createPlayer('p3', 3, 5),
          createPlayer('p4', 4, 2),
        ],
        removed: [],
      }

      const modifier = Modifiers.noMostItems()
      const updated = modifier.apply(leaderboard)

      expect(updated.leaderboard.map(p => p.id)).toEqual(['p1', 'p3', 'p4'])
      expect(updated.leaderboard.map(p => p.position)).toEqual([1, 2, 3]) // p3 & p4 move up
    })

    it('does not shift unaffected players if the last player is removed', () => {
      const leaderboard: Leaderboard = {
        leaderboard: [
          createPlayer('p1', 1, 5),
          createPlayer('p2', 2, 4),
          createPlayer('p3', 3, 10), // Most items
        ],
        removed: [],
      }

      const modifier = Modifiers.noMostItems()
      const updated = modifier.apply(leaderboard)

      expect(updated.leaderboard.map(p => p.id)).toEqual(['p1', 'p2'])
      expect(updated.leaderboard.map(p => p.position)).toEqual([1, 2]) // Positions unchanged for p1, p2
    })

    it('removes all players if they all have the same number of items', () => {
      const leaderboard: Leaderboard = {
        leaderboard: [
          createPlayer('p1', 1, 5),
          createPlayer('p2', 2, 5),
          createPlayer('p3', 3, 5),
        ],
        removed: [],
      }

      const modifier = Modifiers.noMostItems()
      const updated = modifier.apply(leaderboard)

      expect(updated.leaderboard).toHaveLength(0) // All removed
      expect(updated.removed.map(p => p.id)).toEqual(['p1', 'p2', 'p3'])
    })

    it('handles an empty leaderboard without errors', () => {
      const leaderboard: Leaderboard = {
        leaderboard: [],
        removed: [],
      }

      const modifier = Modifiers.noMostItems()
      const updated = modifier.apply(leaderboard)

      expect(updated.leaderboard).toHaveLength(0)
      expect(updated.removed.map(p => p.id)).toHaveLength(0)
    })
  })
  describe('Modifiers.noZeroItems', () => {
    it('removes a single player with zero items', () => {
      const leaderboard: Leaderboard = {
        leaderboard: [
          createPlayer('p1', 1, 5, 100),
          createPlayer('p2', 2, 0, 200), // Should be removed
          createPlayer('p3', 3, 3, 300),
        ],
        removed: [],
      }

      const modifier = Modifiers.noZeroItems()
      const updated = modifier.apply(leaderboard)

      expect(updated.leaderboard).toHaveLength(2)
      expect(updated.leaderboard.map(p => p.id)).toEqual(['p1', 'p3']) // p2 is removed
      expect(updated.leaderboard.map(p => p.position)).toEqual([1, 2]) // Positions adjusted
      expect(updated.removed.map(p => p.id)).toContain('p2')
    })

    it('removes multiple players with zero items', () => {
      const leaderboard: Leaderboard = {
        leaderboard: [
          createPlayer('p1', 1, 0, 100), // Should be removed
          createPlayer('p2', 2, 5, 200),
          createPlayer('p3', 3, 0, 300), // Should be removed
          createPlayer('p4', 4, 8, 400),
        ],
        removed: [],
      }

      const modifier = Modifiers.noZeroItems()
      const updated = modifier.apply(leaderboard)

      expect(updated.leaderboard).toHaveLength(2)
      expect(updated.leaderboard.map(p => p.id)).toEqual(['p2', 'p4']) // p1 & p3 removed
      expect(updated.leaderboard.map(p => p.position)).toEqual([1, 2]) // Positions shifted
      expect(updated.removed.map(p => p.id)).toContain('p1')
      expect(updated.removed.map(p => p.id)).toContain('p3')
    })

    it('does not remove any players if all have items', () => {
      const leaderboard: Leaderboard = {
        leaderboard: [
          createPlayer('p1', 1, 5, 100),
          createPlayer('p2', 2, 3, 200),
          createPlayer('p3', 3, 8, 300),
        ],
        removed: [],
      }

      const modifier = Modifiers.noZeroItems()
      const updated = modifier.apply(leaderboard)

      expect(updated.leaderboard).toHaveLength(3)
      expect(updated.leaderboard.map(p => p.id)).toEqual(['p1', 'p2', 'p3']) // No changes
      expect(updated.removed.map(p => p.id)).toHaveLength(0)
    })

    it('removes a player at the beginning of the leaderboard', () => {
      const leaderboard: Leaderboard = {
        leaderboard: [
          createPlayer('p1', 1, 0, 100), // Should be removed
          createPlayer('p2', 2, 7, 200),
          createPlayer('p3', 3, 4, 300),
        ],
        removed: [],
      }

      const modifier = Modifiers.noZeroItems()
      const updated = modifier.apply(leaderboard)

      expect(updated.leaderboard.map(p => p.id)).toEqual(['p2', 'p3']) // p1 removed
      expect(updated.leaderboard.map(p => p.position)).toEqual([1, 2]) // p2 moves up
      expect(updated.removed.map(p => p.id)).toContain('p1')
    })

    it('removes a player at the end of the leaderboard', () => {
      const leaderboard: Leaderboard = {
        leaderboard: [
          createPlayer('p1', 1, 3, 100),
          createPlayer('p2', 2, 5, 200),
          createPlayer('p3', 3, 0, 300), // Should be removed
        ],
        removed: [],
      }

      const modifier = Modifiers.noZeroItems()
      const updated = modifier.apply(leaderboard)

      expect(updated.leaderboard.map(p => p.id)).toEqual(['p1', 'p2']) // p3 removed
      expect(updated.leaderboard.map(p => p.position)).toEqual([1, 2]) // No unnecessary shifts
      expect(updated.removed.map(p => p.id)).toContain('p3')
    })

    it('removes all players if everyone has zero items', () => {
      const leaderboard: Leaderboard = {
        leaderboard: [
          createPlayer('p1', 1, 0, 100),
          createPlayer('p2', 2, 0, 200),
          createPlayer('p3', 3, 0, 300),
        ],
        removed: [],
      }

      const modifier = Modifiers.noZeroItems()
      const updated = modifier.apply(leaderboard)

      expect(updated.leaderboard).toHaveLength(0) // All removed
      expect(updated.removed.map(p => p.id)).toEqual(['p1', 'p2', 'p3'])
    })

    it('handles an empty leaderboard without errors', () => {
      const leaderboard: Leaderboard = {
        leaderboard: [],
        removed: [],
      }

      const modifier = Modifiers.noZeroItems()
      const updated = modifier.apply(leaderboard)

      expect(updated.leaderboard).toHaveLength(0)
      expect(updated.removed).toHaveLength(0)
    })
  })
})
