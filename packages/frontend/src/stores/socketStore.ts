import { defineStore } from 'pinia'
import { Socket } from 'socket.io-client'
import { useLobbyService } from '@/composables/useLobbyService.ts'
import { useAuthStore } from '@/stores/authStore.ts'
import { UnauthenticatedError } from '@/api/Errors.ts'
import type { AuctionMessage } from '@auction/common'

type Listener = {
  onOpen?: () => void
  onMessage?: (event: AuctionMessage) => void
  onClose?: (reason: string | undefined) => void
  onError?: (err: unknown) => void
  attached: boolean
}

export const useSocketStore = defineStore('socket', {
  state: () => ({
    socket: undefined as Socket | undefined,
    isConnected: false,
    listeners: new Map<string, Listener>(),
  }),
  actions: {
    connect(onOpen?: () => void) {
      if (this.socket) {
        return
      }
      try {
        const authStore = useAuthStore()
        const lobbyService = useLobbyService()

        if (!authStore.accessToken) {
          throw new UnauthenticatedError()
        }
        console.log('Connecting to WebSocket...')
        this.socket = lobbyService.connectToLobby()
        this.socket.on('connect', () => {
          this.isConnected = true

          // Attach any stored listeners that aren't already attached
          this.attachPendingListeners()

          if (onOpen) {
            onOpen()
          }
        })
        this.socket.on('disconnect', () => {
          this.isConnected = false

          // Mark all listeners as not attached
          for (const [name, listener] of this.listeners.entries()) {
            this.listeners.set(name, { ...listener, attached: false })
          }
        })
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error)
        throw error
      }
    },

    attachPendingListeners() {
      if (!this.socket || !this.socket.connected) return

      for (const [name, listener] of this.listeners.entries()) {
        if (!listener.attached) {
          this.attachListenerToSocket(name, listener)
        }
      }
    },

    attachListenerToSocket(name: string, listener: Listener) {
      if (!this.socket) return

      const { onOpen, onMessage, onClose, onError } = listener

      if (onOpen) {
        onOpen()
      }

      if (onMessage) {
        this.socket.onAny((event, msg) => {
          onMessage({ ...msg, type: event })
        })
      }

      if (onClose) {
        this.socket.on('disconnect', (reason) => {
          onClose(reason)
        })
      }

      if (onError) {
        this.socket.on('connect_error', (err) => {
          onError(err)
        })
      }

      // Mark as attached
      this.listeners.set(name, { ...listener, attached: true })
    },

    attach(
      name: string,
      onOpen?: () => void,
      onMessage?: (event: AuctionMessage) => void,
      onClose?: (reason: string | undefined) => void,
      onError?: (err: unknown) => void,
    ) {
      if (this.listeners.has(name)) {
        return
      }
      const listener = {
        onOpen,
        onMessage,
        onClose: onClose
          ? (reason: string | undefined) => {
              this.socket = undefined
              onClose(reason)
            }
          : undefined,
        onError: onError
          ? (err: unknown) => {
              this.socket = undefined
              onError(err)
            }
          : undefined,
        attached: false,
      }

      // Store the listener
      this.listeners.set(name, listener)

      // If socket is already connected, attach immediately
      if (this.socket && this.socket.connected) {
        this.attachListenerToSocket(name, listener)
      }
    },

    disconnect() {
      if (this.socket) {
        this.socket.disconnect()
      }
    },

    detach(name: string) {
      if (this.socket && this.listeners.has(name)) {
        // Remove all event listeners for this name
        const listener = this.listeners.get(name)
        if (listener?.onOpen) this.socket.off('connect', listener.onOpen)
        if (listener?.onClose) this.socket.off('disconnect', listener.onClose)
        if (listener?.onError) this.socket.off('connect_error', listener.onError)
        if (listener?.onMessage) this.socket.offAny()

        // Remove from our tracking
        this.listeners.delete(name)
      }
    },
  },
  getters: {
    connected: (state) => state.isConnected,
  },
})
