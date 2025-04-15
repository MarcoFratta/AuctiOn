import type { ItemQuantity } from '@/schemas/LobbySchema.ts'
import { useLobbyStore } from '@/stores/lobbyStore.ts'

export function useInventoryUtils() {
  const lobbyStore = useLobbyStore()

  function getItemWeight(item: string) {
    return lobbyStore.weights.find((w) => w.item === item)?.weight || 0
  }

  function getTotalWeight(items: ItemQuantity[]) {
    return items.reduce((total, item) => total + getItemWeight(item.item) * item.quantity, 0)
  }

  function getItemsCount(items: ItemQuantity[]) {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  return { getItemWeight, getTotalWeight, getItemsCount }
}
