import WebSocket, { ServerOptions, WebSocketServer } from 'ws'
import { PlayerEventSource } from './PlayerEventSource'
import logger from '@auction/common/logger'
import { PlayerChannel } from './PlayerChannel'
import { Request } from 'express'

export class WebSocketAdapter implements PlayerEventSource, PlayerChannel {
  private readonly wss: WebSocket.Server
  private clients: Map<string, WebSocket> = new Map()

  private connectListeners: ((playerId: string) => void)[] = []
  private messageListeners: ((playerId: string, message: string) => void)[] = []
  private disconnectListeners: ((playerId: string) => void)[] = []

  constructor(config: ServerOptions) {
    this.wss = new WebSocketServer(config)
    logger.info('WebSocket server started')
    this.wss.on('connection', (ws: WebSocket, req: Request) => {
      try {
        logger.info('New WebSocket connection')
        ws.once('message', async data => {
          logger.info(`New WebSocket connection with user:  ${JSON.stringify(data)}`)
          const user = JSON.parse(data.toString())
          const playerId = user.id // Assuming player ID is in the URL
          logger.debug(`[WSAdapter] Player connected: ${playerId}`)
          if (playerId) {
            this.clients.set(playerId, ws)
            this.notifyConnect(playerId)

            ws.on('message', (message: string) => {
              logger.debug(`[WSAdapter] Message from player ${playerId}`)
              this.notifyMessage(playerId, message)
            })

            ws.on('close', () => {
              logger.debug(`[WSAdapter] Player disconnected: ${playerId}`)
              this.clients.delete(playerId)
              this.notifyDisconnect(playerId)
            })

            ws.on('error', error => {
              logger.error(`[WSAdapter] Error for player ${playerId}: ${error}`)
            })
          }
        })
      } catch (e) {
        logger.debug(`Error while connecting player:`)
        ws.close(1008, 'Authentication required')
      }
    })
  }

  closeConnection(playerId: string, normal: boolean = true, reason: string = ''): void {
    const ws = this.clients.get(playerId)
    if (ws) {
      const code = normal ? 1000 : 1011
      ws.close(code, reason)
      logger.debug(`Closing connection for player ${playerId} with code ${code} and reason ${reason}`)
    }
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

  broadcast(producer: (id: string) => string, predicate?: (id: string) => boolean): void {
    this.clients.forEach((client, id) => {
      if (predicate && predicate(id) && client.readyState === WebSocket.OPEN) {
        client.send(producer(id))
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
