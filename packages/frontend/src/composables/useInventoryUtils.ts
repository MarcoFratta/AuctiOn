import type { ItemQuantity } from '@/schemas/LobbySchema.ts'
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { computed } from 'vue'

export function useInventoryUtils() {
  const lobbyStore = useLobbyStore()

  const userCollectionTotalGains = computed(() => {
    if (!lobbyStore.playerInfo) return 0
    return lobbyStore.playerInfo.inventory.items.reduce((total, item) => {
      return total + getCollectionGain(item.item, item.quantity)
    }, 0)
  })
  function getItemWeight(item: string) {
    return lobbyStore.weights.find((w) => w.item === item)?.weight || 0
  }

  function getCollectionGain(item: string, quantity: number) {
    return Math.floor(quantity / lobbyStore.collectionSize) * 10 * getItemWeight(item)
  }

  function getTotalWeight(items: ItemQuantity[]) {
    return items.reduce((total, item) => total + getItemWeight(item.item) * item.quantity, 0)
  }

  function getItemsCount(items: ItemQuantity[]) {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  return {
    getItemWeight,
    getTotalWeight,
    getItemsCount,
    getCollectionGain,
    userCollectionTotalGains,
  }
}
