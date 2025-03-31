import { useSocketStore } from '@/stores/socketStore.ts'
import { useLobbyService } from '@/composables/useLobbyService.ts'

export function useAuctionConnection() {
  const socketStore = useSocketStore()
  const lobbyService = useLobbyService()
  let connectionPromise: Promise<void> | null = null

  function connect(): Promise<void> {
    console.log('Connecting to auction...')

    // Return existing connection promise if one is in progress
    if (connectionPromise) {
      return connectionPromise
    }

    // Create a new connection promise
    connectionPromise = new Promise<void>((resolve, reject) => {
      if (socketStore.isConnected) {
        // If already connected, resolve immediately
        resolve()
        return
      }
      lobbyService
        .checkActiveLobby()
        .then(() => {
          socketStore.connect(() => {
            console.log('Connected to auction')
            resolve()
          })
        })
        .catch((error) => {
          reject(error)
        })
    }).finally(() => {
      connectionPromise = null
      return
    })

    return connectionPromise
  }

  return { connect }
}
