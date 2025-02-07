import request from 'supertest'
import logger from '@auction/common/logger'
import WebSocket from 'ws'

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
    return res.body.lobby
  }

  async joinLobby(token: string, lobbyId: string) {
    const res = await request(this.url).post(`/lobbies/${lobbyId}/join`).set('Authorization', `Bearer ${token}`)
    await this.waitFor(1000)
    return res.body.lobby
  }

  async createMatch(token: string) {
    const res = await request(this.url).post(`/lobbies/start`).set('Authorization', `Bearer ${token}`)
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
    const player = new WebSocket(`${this.url}/auction`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return new Promise<WebSocket>((resolve, reject) => {
      player.on('open', () => {
        logger.info(`${id} connected`)
        resolve(player)
      })
      player.on('error', err => {
        logger.error(`[${id}] error connecting ${err}`)
        reject(err)
      })
      player.on('message', message => {
        const msg = JSON.parse(message.toString())
        if (msg.type) {
          if (msg.type == 'timer-start') {
            return
          }
          if (msg.type == 'error') {
            logger.error(`[${id}] ${JSON.stringify(msg)})`)
            return
          }
        }
        // logger.info(`[${id}] ${JSON.stringify(msg)})`)
        messages[id].push(msg)
      })
    })
  }

  waitFor = async (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async placeBid(player: WebSocket, amount: number, round: number) {
    player.send(
      JSON.stringify({
        type: 'bid',
        bid: {
          amount: amount,
          round,
        },
      })
    )
    await this.waitFor(1000)
  }

  async saleItem(player: WebSocket, inventory: { item: string; quantity: number }[]) {
    player.send(
      JSON.stringify({
        type: 'sell',
        sale: {
          items: inventory,
        },
      })
    )
    await this.waitFor(1000)
  }
}
