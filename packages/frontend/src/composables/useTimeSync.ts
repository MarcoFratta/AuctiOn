import { useSocketStore } from '@/stores/socketStore'
import { useLobbyStore } from '@/stores/lobbyStore.ts'

export function useTimeSync() {
  const socketStore = useSocketStore()
  let syncInterval: NodeJS.Timeout | null = null
  const lobbyStore = useLobbyStore()

  // Get synchronized time
  const getSyncedTime = (): number => {
    const currentTime = Date.now()
    return currentTime + lobbyStore.serverTimeOffset
  }

  // Sync with server time using Socket.io
  const syncTime = () => {
    if (!socketStore.socket) return
    console.log('Sync time with server')
    const requestTime = Date.now()
    socketStore.socket.emit('time-sync', {}, (response: { serverTime: number }) => {
      const responseTime = Date.now()
      const roundTripTime = responseTime - requestTime

      // Estimate one-way latency as half of round trip time
      const latency = Math.floor(roundTripTime / 2)

      // Calculate offset considering the latency
      const serverTime = response.serverTime

      lobbyStore.setTimeOffset(serverTime - (requestTime + latency))
      console.log('Time synchronized with server, offset:', lobbyStore.serverTimeOffset)
    })
  }

  // Start periodic time synchronization
  const startPeriodicSync = (interval = 60000) => {
    syncTime() // Initial sync

    // Set up periodic sync
    syncInterval = setInterval(() => {
      syncTime()
    }, interval)

    return () => {
      if (syncInterval !== null) {
        clearInterval(syncInterval)
        syncInterval = null
      }
    } // Return cleanup function
  }

  return {
    getSyncedTime,
    syncTime,
    startPeriodicSync,
  }
}
