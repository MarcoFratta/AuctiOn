import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useLobbyStore } from '@/stores/lobbyStore'

export function useAuctionTimer() {
  const lobbyStore = useLobbyStore()
  const remainingTime = ref(0)
  let timerInterval: number | undefined

  const calculateRemainingTime = (): number => {
    const lobby = lobbyStore.lobby
    if (!lobby?.currentSale || !lobbyStore.timerStart) return 0

    const now = new Date()
    const startTime = lobbyStore.timerStart
    const bidTimeMs = (lobby.bidTime || 30) * 1000 // Convert seconds to milliseconds

    // Calculate time elapsed since start
    const elapsedMs = now.getTime() - startTime.getTime()

    // Calculate remaining time
    const remaining = bidTimeMs - elapsedMs

    // Return remaining time in seconds, clamped to 0 if negative
    return Math.max(0, Math.floor(remaining / 1000))
  }

  const startTimer = () => {
    // Clear any existing timer
    stopTimer()

    // Only start timer if there's an active sale
    if (lobbyStore.lobby?.currentSale) {
      // Initial calculation
      remainingTime.value = calculateRemainingTime()

      // Set interval for updates - using a more reliable approach
      timerInterval = window.setInterval(() => {
        remainingTime.value = calculateRemainingTime()
      }, 1000)
    } else {
      remainingTime.value = 0
    }
  }

  const stopTimer = () => {
    if (timerInterval) {
      window.clearInterval(timerInterval)
      timerInterval = undefined
    }
  }

  // Watch for changes in the current sale or timer start
  watch([() => lobbyStore.lobby?.currentSale, () => lobbyStore.timerStart], () => {
    startTimer()
  })

  // Start the timer when the component mounts
  onMounted(() => {
    startTimer()
  })

  // Clean up on unmount
  onBeforeUnmount(() => {
    stopTimer()
  })

  return {
    remainingTime,
    startTimer,
    stopTimer,
  }
}
