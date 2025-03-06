import { defineStore } from 'pinia'
import { Socket } from 'socket.io-client'
import { useLobbyService } from '@/composables/useLobbyService.ts'
import { useAuthStore } from '@/stores/authStore.ts'
import { UnauthenticatedError } from '@/api/Errors.ts'
import type { AuctionMessage } from '@auction/common'

const lobbyService = useLobbyService()
const authStore = useAuthStore()
export const useSocketStore = defineStore('socket', {
  state: () => ({
    socket: null as Socket | null,
  }),
  actions: {
    connect(
      onOpen?: () => void,
      onMessage?: (event: AuctionMessage) => void,
      onClose?: (reason: string | undefined) => void,
      onError?: (err: unknown) => void,
    ) {
      if (this.socket) {
        return
      }
      try {
        if (!authStore.accessToken) {
          throw new UnauthenticatedError()
        }
        console.log('Connecting to WebSocket...')
        const ws = lobbyService.connectToLobby()
        this.socket = ws
        ws.on('connect', onOpen ?? (() => {}))
        ws.onAny((event, msg) => {
          if (onMessage) {
            onMessage({ ...msg, type: event })
          }
        })
        ws.on('disconnect', (reason) => {
          this.socket = null
          onClose?.(reason)
        })

        ws.on('connect_error', (_) => {
          this.socket = null
          onError?.(_)
        })
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error)
        throw error
      }
    },
    disconnect() {
      if (this.socket) {
        this.socket.disconnect()
        this.socket = null
      }
    },
  },
})
