import { useSocketStore } from '@/stores/socketStore.ts'
import { useLobbyService } from '@/composables/useLobbyService.ts'
import { NotFound } from '@/api/Errors.ts'

export function useAuctionConnection() {
  const socketStore = useSocketStore()
  const lobbyService = useLobbyService()
  let connectionPromise: Promise<void> | null = null

  function connect(): Promise<void> {
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
          try {
            socketStore.connect(() => {
              resolve()
            })
          } catch (_error) {
            reject()
          }
        })
        .catch(async () => {
          reject(new NotFound())
        })
    })
    connectionPromise.finally(() => {
      connectionPromise = null
    })

    return connectionPromise
  }

  return { connect }
}
