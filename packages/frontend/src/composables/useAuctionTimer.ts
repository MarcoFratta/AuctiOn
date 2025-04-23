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
    console.log('[useAuctionTimer] Attempting to start timer...')
    stopTimer()

    if (lobbyStore.auctionEndTime !== null) {
      console.log('[useAuctionTimer] Conditions met (auctionEndTime exists). Starting timer.')
      remainingTime.value = calculateRemainingTime()

      timerInterval = window.setInterval(() => {
        remainingTime.value = calculateRemainingTime()
      }, 1000)
      console.log('[useAuctionTimer] Interval timer started with ID:', timerInterval)
    } else {
      console.log(
        '[useAuctionTimer] Conditions not met (auctionEndTime is null). Setting remainingTime to 0.',
      )
      remainingTime.value = 0
    }
  }

  const stopTimer = () => {
    if (timerInterval) {
      console.log('[useAuctionTimer] Stopping timer interval ID:', timerInterval)
      window.clearInterval(timerInterval)
      timerInterval = undefined
    }
  }

  watch(
    () => lobbyStore.auctionEndTime,
    (newEndTime, oldEndTime) => {
      console.log(
        `[useAuctionTimer] Watch triggered: auctionEndTime changed from ${oldEndTime} to ${newEndTime}. Restarting timer.`,
      )
      startTimer()
    },
  )

  onMounted(() => {
    console.log('[useAuctionTimer] Component Mounted. Starting timer.')
    startTimer()
  })

  onBeforeUnmount(() => {
    console.log('[useAuctionTimer] Component Unmounting. Stopping timer.')
    stopTimer()
  })

  return {
    remainingTime,
  }
}
