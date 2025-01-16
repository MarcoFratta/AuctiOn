import WebSocket, { ServerOptions, WebSocketServer } from 'ws'
import { PlayerEventSource } from './PlayerEventSource'
import logger from '../utils/Logger'
import { PlayerChannel } from './PlayerChannel'

export class WebSocketAdapter implements PlayerEventSource, PlayerChannel {
  private wss: WebSocket.Server
  private clients: Map<string, WebSocket> = new Map()

  private connectListeners: ((playerId: string) => void)[] = []
  private messageListeners: ((playerId: string, message: string) => void)[] = []
  private disconnectListeners: ((playerId: string) => void)[] = []

  constructor(config: ServerOptions) {
    this.wss = new WebSocketServer(config)
    logger.info('WebSocket server started')

    this.wss.on('connection', (ws: WebSocket, req) => {
      const playerId = req.url?.split('/').pop() // Assuming player ID is in the URL
      logger.info(`Player connected: ${playerId}`)
      if (playerId) {
        this.clients.set(playerId, ws)
        this.notifyConnect(playerId)

        ws.on('message', (message: string) => {
          this.notifyMessage(playerId, message)
        })

        ws.on('close', () => {
          this.clients.delete(playerId)
          this.notifyDisconnect(playerId)
        })
      }
    })
  }

  sendToPlayer(playerId: string, message: string): void {
    const ws = this.clients.get(playerId)
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(message)
    }
  }

  getServer(): WebSocket.Server {
    return this.wss
  }

  broadcast(message: string, predicate: (id: string) => boolean): void {
    this.clients.forEach((client, id) => {
      if (predicate(id) && client.readyState === WebSocket.OPEN) {
        client.send(message)
      }
    })
  }

  onPlayerConnect(callback: (playerId: string) => void): void {
    this.connectListeners.push(callback)
  }

  onPlayerMessage(callback: (playerId: string, message: string) => void): void {
    this.messageListeners.push(callback)
  }

  onPlayerDisconnect(callback: (playerId: string) => void): void {
    this.disconnectListeners.push(callback)
  }

  private notifyConnect(playerId: string): void {
    this.connectListeners.forEach(callback => callback(playerId))
  }

  private notifyMessage(playerId: string, message: string): void {
    this.messageListeners.forEach(callback => callback(playerId, message))
  }

  private notifyDisconnect(playerId: string): void {
    this.disconnectListeners.forEach(callback => callback(playerId))
  }
}
