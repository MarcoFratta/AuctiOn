import request from 'supertest'
import logger from '@auction/common/logger'
import { io, Socket } from 'socket.io-client'
import { AuctionMessage } from '@auction/common/messages'

export class Client {
  constructor(private readonly url: string) {}

  async registerUser(email: string, password: string, name: string) {
    const res = await request(this.url).post('/auth/register').send({
      email,
      password,
      name,
    })
    if (res.status !== 201) {
      logger.info(`Failed to register user: ${JSON.stringify(res)}`)
      throw new Error('Failed to register user')
    }
    return res.body.user
  }

  async createLobby(creatorToken: string, options: any) {
    const res = await request(this.url).post('/lobbies/create').set('Authorization', `Bearer ${creatorToken}`).send(options)
    logger.info(`Lobby created: ${JSON.stringify(res.body)}`)
    return res.body.lobby
  }

  async joinLobby(token: string, lobbyId: string) {
    const res = await request(this.url).post(`/lobbies/${lobbyId}/join`).set('Authorization', `Bearer ${token}`)
    await this.waitFor(2000)
    return res.body.lobby
  }

  async setReady(token: string, status: string) {
    const res = await request(this.url).put(`/lobbies/status`).set('Authorization', `Bearer ${token}`).send({ status })
    return res.body.lobby
  }

  async startMatch(token: string) {
    const res = await request(this.url).post(`/lobbies/start`).set('Authorization', `Bearer ${token}`)
    return res.body.lobby
  }

  async connectPlayer(token: string, id: string, messages: Record<string, any[]>) {
    const player = io(`http://localhost:8080`, {
      path: '/auction',
      auth: { token },
    })
    return new Promise<Socket>((resolve, reject) => {
      player.on('connect', () => {
        logger.info(`${id} connected (socket ID: ${player.id})`)
        setTimeout(() => resolve(player), 100)
      })
      player.on('connect_error', err => {
        logger.error(`[${id}] error connecting ${err}`)
        reject(err)
      })
      player.on('disconnect', reason => {
        logger.info(`${id} disconnected: ${reason}`)
      })
      player.on('error', err => {
        logger.error(`[${id}] error ${err}`)
      })

      player.onAny((eventName, ...args) => {
        const msg = args[0]
        logger.info(`[${id} Received] Event: ${eventName}, Data: ${JSON.stringify(msg)}`)
        if (msg && typeof msg === 'object') {
          messages[id].push(msg)
        } else {
          messages[id].push({ type: eventName, payload: msg })
        }
      })
      player.on('error', msg => {
        logger.error(`[${id}] Received error event: ${JSON.stringify(msg)}`)
      })
    })
  }

  waitFor = async (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async waitForMessage(playerSocket: Socket, type: AuctionMessage['type'], predicate?: (v: any) => boolean): Promise<any> {
    const timeout = 300000
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | null = null

      const listener = (eventName: string, ...args: any[]) => {
        const msg = args[0]
        const messageType = eventName === type ? type : msg && msg.type

        if (messageType === type) {
          const parsedMsg = typeof msg === 'string' ? JSON.parse(msg) : msg
          if (parsedMsg && (!predicate || predicate(parsedMsg))) {
            logger.debug(`[waitForMessage SID: ${playerSocket.id}] Found matching message type "${type}":
             ${JSON.stringify(parsedMsg)}`)
            if (timeoutId) {
              clearTimeout(timeoutId)
            }
            playerSocket.offAny(listener)
            resolve(parsedMsg)
          }
        }
      }

      playerSocket.onAny(listener)
      logger.debug(`[waitForMessage SID: ${playerSocket.id}] Attached listener for type "${type}"`)

      timeoutId = setTimeout(() => {
        logger.error(`[waitForMessage SID: ${playerSocket.id}] Timeout waiting for message type "${type}".`)
        playerSocket.offAny(listener)
        reject(new Error(`Timeout waiting for message type "${type}" on socket ${playerSocket.id}`))
      }, timeout)
    })
  }

  async placeBid(player: Socket, amount: number, round: number, expectedPlayerId: string) {
    const payload = {
      bid: {
        amount: amount,
        round,
      },
    }
    player.emit('bid', payload)
    logger.debug(`[placeBid SID: ${player.id}] Emitted 'bid' for AppID ${expectedPlayerId}, Round ${round}, Amount ${amount}`)

    try {
      await this.waitForMessage(player, 'new-bid', msg => {
        return msg.bid?.playerId === expectedPlayerId && msg.bid?.amount === amount && msg.bid?.round === round
      })
      logger.debug(`[placeBid SID: ${player.id}] Received confirmation for bid 
      (AppID ${expectedPlayerId}, Round ${round}, Amount ${amount})`)
    } catch (error) {
      logger.error(`[placeBid SID: ${player.id}] Failed to receive confirmation for bid
       (AppID ${expectedPlayerId}, Round ${round}, Amount ${amount}): ${error}`)
      throw error
    }
  }

  async saleItem(player: Socket, inventory: { item: string; quantity: number }[], id: string) {
    player.emit('sell', {
      sale: {
        items: inventory,
      },
    })
    try {
      await this.waitForMessage(player, 'new-sale', msg => {
        return msg.sale.sellerId == id
      })
      logger.debug(`[saleItem SID: ${player.id}] Emitted 'sell'`)
    } catch (error) {
      logger.error(`[placeBid SID: ${player.id}] Failed to receive confirmation for sale (ID ${id},): ${error}`)
      throw error
    }
  }
}
