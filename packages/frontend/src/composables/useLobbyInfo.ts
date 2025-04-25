import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { computed } from 'vue'
import { useUserStore } from '@/stores/userStore.ts'
import { useInventoryUtils } from '@/composables/useInventoryUtils.ts'

export function useLobbyInfo() {
  const lobbyStore = useLobbyStore()
  const userStore = useUserStore()
  const utils = useInventoryUtils()
  const isCurrentUserSeller = computed(() => lobbyStore.userIsTheSeller)
  const userMoney = computed(() => lobbyStore.playerInfo?.money || 0)
  const highestBidder = computed(() =>
    lobbyStore.getUser(lobbyStore.lobby?.currentBid?.playerId ?? ''),
  )
  const isHighestBidder = computed(() => {
    return highestBidder.value?.id === userStore.user?.id
  })
  const userIsAdmin = computed(() => lobbyStore.lobby?.creatorId === userStore.user?.id)
  const currentBid = computed(() => lobbyStore.lobby?.currentBid)
  const currentSale = computed(() => lobbyStore.lobby?.currentSale)
  const totalUserWeight = computed(() => currentSale.value?.info.weight ?? 0)
  const userItemsCount = computed(() =>
    utils.getItemsCount(lobbyStore.playerInfo?.inventory.items || []),
  )
  const currentSeller = computed(() => {
    if (!currentSale.value) return undefined
    return lobbyStore.users.find((p) => p.id === currentSale.value?.sellerId)
  })
  return {
    isHighestBidder,
    highestBidder,
    userMoney,
    isCurrentUserSeller,
    totalUserWeight,
    userIsAdmin,
    currentSale,
    currentSeller,
    currentBid,
    userItemsCount,
  }
}
