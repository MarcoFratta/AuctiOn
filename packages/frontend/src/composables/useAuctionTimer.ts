import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useLobbyStore } from '@/stores/lobbyStore'
import { useTimeSync } from '@/composables/useTimeSync'

export function useAuctionTimer() {
  const lobbyStore = useLobbyStore()
  const { getSyncedTime } = useTimeSync()
  const remainingTime = ref(0)
  let timerInterval: number | undefined

  const calculateRemainingTime = () => {
    const endTime = lobbyStore.auctionEndTime
    if (endTime === null) {
      return 0
    }
    const now = getSyncedTime()
    const diff = endTime - now
    return Math.max(0, Math.floor(diff / 1000))
  }

  const startTimer = () => {
    stopTimer()

    if (lobbyStore.auctionEndTime !== null) {
      remainingTime.value = calculateRemainingTime()

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

  watch(
    () => lobbyStore.auctionEndTime,
    () => {
      startTimer()
    },
  )

  onMounted(() => {
    startTimer()
  })

  onBeforeUnmount(() => {
    stopTimer()
  })

  return {
    remainingTime,
  }
}
