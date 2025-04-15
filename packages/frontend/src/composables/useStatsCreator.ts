import { useHistoryStore } from '@/stores/historyStore.ts'
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { computed } from 'vue'

export function useStatsCreator() {
  const historyStore = useHistoryStore()
  const lobbyStore = useLobbyStore()

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
    return historyStore.bids.map((_, index) => `${index + 1}`)
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

  const bidGrowthRate = computed(() => {
    const bids = historyStore.bids
    if (bids.length < 2) return 0

    const firstBid = bids[0].amount
    const lastBid = bids[bids.length - 1].amount

    return Math.round(((lastBid - firstBid) / firstBid) * 100)
  })

  const recentMomentum = computed(() => {
    const bids = historyStore.bids
    if (bids.length < 2) return 0

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

  return {
    avgBid,
    bids,
    bidLabels,
    highestBid,
    lowestBid,
    bidCount,
    bidGrowthRate,
    recentMomentum,
    dollarPerWeightHistory,
    avgDollarPerWeight,
    predictedSalePrice,
    priceVsPrediction,
  }
}
