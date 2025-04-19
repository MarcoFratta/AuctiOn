import { useHistoryStore } from '@/stores/historyStore.ts'
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { useInventoryUtils } from '@/composables/useInventoryUtils.ts'
import { computed } from 'vue'

export function useStatsCreator() {
  const historyStore = useHistoryStore()
  const lobbyStore = useLobbyStore()
  const utils = useInventoryUtils()

  const avgBid = computed(() => {
    const bids = historyStore.bids
    if (bids.length === 0) return 0
    const total = bids.reduce((acc, bid) => acc + bid.amount, 0)
    return Math.round((total / bids.length) * 100) / 100
  })

  const bids = computed(() => {
    return historyStore.bids.map((b) => b.amount)
  })

  const bidLabels = computed(() => {
    return historyStore.bids.map((b, index) => `S${b.round}: B${index + 1}`)
  })

  const highestBid = computed(() => {
    if (historyStore.bids.length === 0) return 0
    return Math.max(...historyStore.bids.map((b) => b.amount))
  })

  const lowestBid = computed(() => {
    if (historyStore.bids.length === 0) return 0
    return Math.min(...historyStore.bids.map((b) => b.amount))
  })

  const bidCount = computed(() => {
    return historyStore.bids.length
  })

  const recentMomentum = computed(() => {
    const bids = historyStore.bids
    const lastSaleIndex = historyStore.lastSaleIndex
    if (bids.length <= lastSaleIndex + 1) {
      return 0
    }

    const previousBid = bids[bids.length - 2].amount
    const lastBid = bids[bids.length - 1].amount

    return Math.round(((lastBid - previousBid) / previousBid) * 100)
  })

  // Calculate dollar per weight ratio from historical sales
  const dollarPerWeightHistory = computed(() => {
    const result = []

    // Process each completed sale
    for (let i = 0; i < historyStore.sales.length; i++) {
      // Find the winning bid for this sale
      const winningBid = historyStore.bids
        .filter((bid) => bid.round == i)
        .sort()
        .pop()
      const sale = historyStore.sales[i]
      if (winningBid && sale.info.weight > 0) {
        // Calculate $ per weight unit
        const ratio = winningBid.amount / sale.info.weight
        result.push(ratio)
      }
    }

    return result
  })

  // Calculate average dollar per weight ratio
  const avgDollarPerWeight = computed(() => {
    const ratios = dollarPerWeightHistory.value
    if (ratios.length === 0) return 0

    const sum = ratios.reduce((acc, item) => acc + item, 0)
    return sum / ratios.length
  })

  // Calculate predicted price for current sale
  const predictedSalePrice = computed(() => {
    const currentSale = lobbyStore.lobby?.currentSale
    if (!currentSale || !currentSale.info.weight || avgDollarPerWeight.value === 0) {
      return 0
    }

    return Math.round(currentSale.info.weight * avgDollarPerWeight.value)
  })

  // Calculate price trend (is the current price above or below prediction)
  const priceVsPrediction = computed(() => {
    const currentBid = lobbyStore.lobby?.currentBid?.amount || 0
    if (predictedSalePrice.value === 0 || currentBid === 0) return 0

    return Math.round(((currentBid - predictedSalePrice.value) / predictedSalePrice.value) * 100)
  })

  // Calculate price difference in dollars
  const priceDifference = computed(() => {
    const currentBid = lobbyStore.lobby?.currentBid?.amount || 0
    return currentBid - predictedSalePrice.value
  })

  // Calculate average weight per item
  const avgWeightPerItem = computed(() => {
    if (!lobbyStore.weights || lobbyStore.weights.length === 0) return 0
    return lobbyStore.weights.reduce((sum, w) => sum + w.weight, 0) / lobbyStore.weights.length
  })

  // Estimate number of items in current sale based on weight
  const estimatedItemsInSale = computed(() => {
    if (!lobbyStore.lobby?.currentSale || avgWeightPerItem.value === 0) return 0
    // Get the sale weight
    const saleWeight = lobbyStore.lobby.currentSale.info.weight
    // Estimate number of items based on total weight divided by average weight per item
    return Math.round(saleWeight / avgWeightPerItem.value)
  })

  // Calculate total items in player's inventory
  const playerItemsCount = computed(() =>
    utils.getItemsCount(lobbyStore.playerInfo?.inventory.items || []),
  )

  // Calculate average items per player based on starting inventory and player count
  const averageItemsPerPlayer = computed(() => {
    if (!lobbyStore.lobby) return 0

    // Get total items from starting inventory
    const startingItemsCount = utils.getItemsCount(lobbyStore.lobby.startInventory.items)

    // Get player count from seller queue (assuming all players are in the queue)
    const playerCount = lobbyStore.lobby.sellerQueue.length

    return playerCount > 0 ? Math.round(startingItemsCount / playerCount) : 0
  })

  // Check if player is at risk of having the most items
  const isAtRiskOfMostItems = computed(() => {
    // If we don't have a current sale, we can't calculate risk
    if (!lobbyStore.lobby?.currentSale) return false

    // Calculate how many items the player would have after winning this sale
    const potentialItemsAfterWin = playerItemsCount.value + estimatedItemsInSale.value

    // If player would have significantly more than average, they're at risk (using 2x threshold)
    return potentialItemsAfterWin > averageItemsPerPlayer.value * 2
  })

  // Get price trend analysis based on momentum
  const priceTrendAnalysis = computed(() => {
    if (bidCount.value < 2) return ''

    if (recentMomentum.value > 100) {
      return 'Prices are rising rapidly, indicating high competition.'
    } else if (recentMomentum.value > 50) {
      return 'Prices are trending upward, suggesting growing interest.'
    } else if (recentMomentum.value < 20) {
      return 'Prices are stabilizing'
    } else {
      return 'Price momentum is neutral.'
    }
  })

  // Get value assessment
  const valueAssessment = computed(() => {
    if (priceVsPrediction.value > 50) {
      return 'Current bid is significantly above expected value.'
    } else if (priceVsPrediction.value > 25) {
      return 'Current bid is moderately above expected value.'
    } else if (priceVsPrediction.value > 5) {
      return 'Current bid is slightly above expected value.'
    } else if (priceVsPrediction.value < -50) {
      return 'Current bid is significantly below expected value.'
    } else if (priceVsPrediction.value < -25) {
      return 'Current bid is moderately below expected value.'
    } else if (priceVsPrediction.value < -5) {
      return 'Current bid is slightly below expected value.'
    } else {
      return 'Current bid is close to expected value.'
    }
  })

  return {
    avgBid,
    bids,
    bidLabels,
    highestBid,
    lowestBid,
    bidCount,
    recentMomentum,
    dollarPerWeightHistory,
    avgDollarPerWeight,
    predictedSalePrice,
    priceVsPrediction,
    priceDifference,
    estimatedItemsInSale,
    playerItemsCount,
    averageItemsPerPlayer,
    isAtRiskOfMostItems,
    priceTrendAnalysis,
    valueAssessment,
  }
}
