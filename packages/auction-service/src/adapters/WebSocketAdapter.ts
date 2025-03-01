import { Server, Socket } from 'socket.io'
import logger from '@auction/common/logger'
import { PlayerEventSource } from './PlayerEventSource'
import { PlayerChannel } from './PlayerChannel'
import { AuctionMessage } from '@auction/common/messages'

export class WebSocketAdapter implements PlayerEventSource, PlayerChannel {
  private clients: Map<string, Socket> = new Map()

  private connectListeners: ((playerId: string) => void)[] = []
  private disconnectListeners: ((playerId: string) => void)[] = []
  private messageListeners: ((playerId: string, msg: AuctionMessage) => void)[] = []

  constructor(private io: Server) {
    logger.info('Socket.IO server started')

    this.io.on('connection', socket => {
      logger.info(`[SocketIOAdapter] New connection: ${socket.handshake.auth}`)
      try {
        logger.info(`[SocketIOAdapter] New connection: ${socket.id}`)
        const playerId = this.extractPlayerId(socket.handshake.auth)
        if (!playerId) {
          logger.warn(`Player ID not found in handshake, disconnecting`)
          socket.disconnect(true)
          return
        }
        // 🛑 If user already has a socket, disconnect the old one
        if (this.clients.has(playerId)) {
          const oldSocket = this.clients.get(playerId)
          if (oldSocket && oldSocket.id !== socket.id) {
            logger.info(`Disconnecting previous socket for player ${playerId}`)
            oldSocket.disconnect(true) // Force disconnect old socket
          }
        }

        logger.info(`New Socket.IO connection with player: ${playerId}`)
        this.clients.set(playerId, socket)
        this.notifyConnect(playerId)

        socket.onAny((event, payload) => {
          logger.info(`[SocketIOAdapter] Event '${event}' from player ${playerId} with payload: ${JSON.stringify(payload)}`)
          this.notifyMessage(playerId, event, payload)
        })

        socket.on('disconnect', () => {
          logger.info(`[SocketIOAdapter] Player disconnected: ${playerId}`)
          this.clients.delete(playerId)
          this.notifyDisconnect(playerId)
        })

        socket.on('error', error => {
          logger.error(`[SocketIOAdapter] Error for player ${playerId}: ${error}`)
        })
      } catch (e) {
        logger.error(`Error while handling player connection:`, e)
      }
    })
  }

  closeConnection(playerId: string, normal: boolean = true, reason: string = ''): void {
    const socket = this.clients.get(playerId)
    if (socket) {
      socket.disconnect(true)
      logger.info(`Closing connection for player ${playerId} with reason: ${reason}`)
    }
  }

  sendToPlayer(playerId: string, msg: AuctionMessage): void {
    const socket = this.clients.get(playerId)
    if (socket) {
      socket.emit(msg.type, { ...msg, type: undefined })
    }
  }

  broadcast(producer: (id: string) => AuctionMessage, predicate?: (id: string) => boolean): void {
    this.clients.forEach((socket, id) => {
      if (!predicate || predicate(id)) {
        const msg = producer(id)
        socket.emit(msg.type, { ...msg, type: undefined })
      }
    })
  }

  onPlayerMessage(callback: (playerId: string, message: AuctionMessage) => void): void {
    this.messageListeners.push(callback)
  }

  onPlayerConnect(callback: (playerId: string) => void): void {
    this.connectListeners.push(callback)
  }

  private extractPlayerId(data: any): string | null {
    try {
      return data.user.id || null
    } catch (e) {
      logger.warn('Failed to extract player ID from handshake/auth')
      return null
    }
  }

  onPlayerDisconnect(callback: (playerId: string) => void): void {
    this.disconnectListeners.push(callback)
  }

  private notifyConnect(playerId: string): void {
    this.connectListeners.forEach(callback => callback(playerId))
  }

  private notifyMessage(playerId: string, event: string, payload: any): void {
    const msg = { type: event, ...payload }
    this.messageListeners.forEach(callback => callback(playerId, msg))
  }

  private notifyDisconnect(playerId: string): void {
    this.disconnectListeners.forEach(callback => callback(playerId))
  }
}
