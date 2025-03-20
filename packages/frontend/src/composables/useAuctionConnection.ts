import { useSocketStore } from '@/stores/socketStore.ts'

export function useAuctionConnection() {
  const socketStore = useSocketStore()
  let connectionPromise: Promise<void> | null = null

  function connect(): Promise<void> {
    console.log('Connecting to auction...')

    // Return existing connection promise if one is in progress
    if (connectionPromise) {
      return connectionPromise
    }

    // Create a new connection promise
    connectionPromise = new Promise((resolve, reject) => {
      try {
        if (socketStore.isConnected) {
          // If already connected, resolve immediately
          resolve()
          return
        }
        socketStore.connect(() => {
          resolve()
        })
      } catch (error) {
        reject(error)
      } finally {
        // Reset the promise once completed (either successfully or with error)
        // This allows reconnection attempts after a failure
        connectionPromise = null
      }
    })

    return connectionPromise
  }

  return { connect }
}
