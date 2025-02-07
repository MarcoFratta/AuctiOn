import express from 'express'
import http from 'http'
import { Kafka } from 'kafkajs'
import logger from '@auction/common/logger'
import { KafkaProducer } from './controllers/KafkaProducer'
import { AuctionServiceImpl } from './services/AuctionServiceImpl'
import { WebSocketAdapter } from './adapters/WebSocketAdapter'
import { AuctionController } from './controllers/AuctionController'
import { AuthenticatedRequest, authMiddleware } from './middlewares/AuthMiddleware'
import { UserNotAuthenticatedError } from './errors/Errors'
import { Duplex } from 'stream'
import { TimerController } from './controllers/TimerController'
import { KafkaConsumer } from './controllers/KafkaConsumer'
import { RedisAuctionRepo } from './repositories/RedisAuctionRepo'
import Redis from 'ioredis'
import * as process from 'node:process'

export class App {
  public app: express.Application
  public server: http.Server
  public wsAdapter: WebSocketAdapter
  public auctionService: AuctionServiceImpl
  public kafkaProducer: KafkaProducer
  public kafkaConsumer: KafkaConsumer
  public auctionController: AuctionController
  public timerController: TimerController
  public redis: Redis

  constructor(kafka: Kafka, redis: Redis) {
    this.app = express()
    this.redis = redis
    this.server = http.createServer(this.app)
    this.auctionService = new AuctionServiceImpl(new RedisAuctionRepo(redis))
    this.wsAdapter = new WebSocketAdapter({ noServer: true })
    this.setupMiddlewares()
    this.setupWebSocket()

    this.auctionController = new AuctionController(this.auctionService, this.wsAdapter, this.wsAdapter)
    this.timerController = new TimerController(this.auctionService, this.wsAdapter, this.wsAdapter)
    this.kafkaProducer = new KafkaProducer(kafka, this.auctionService, this.wsAdapter)
    this.kafkaConsumer = new KafkaConsumer(kafka, this.auctionService, 'auction-events')
  }

  public async start(port: number): Promise<void> {
    try {
      await Promise.all([
        this.kafkaProducer.connect().then(() => logger.info('Kafka producer connected')),
        this.kafkaConsumer.connect().then(() => logger.info('Kafka consumer connected')),
        this.auctionService.loadAuctions().then(() => logger.info('Auctions loaded')),
      ])
      this.server.listen(port, () => {
        logger.info(`Server is running on port ${port}`)
      })
    } catch (err) {
      logger.error('Failed to start server:', err)
      await this.stop()
      process.exit(1)
    }
  }

  public async stop(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      await this.kafkaConsumer.disconnect()
      this.server.close(err => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  private setupWebSocket() {
    this.server.on('upgrade', async (req: AuthenticatedRequest, socket: Duplex, head: Buffer) => {
      try {
        const authenticated = authMiddleware(req)
        if (!authenticated) {
          throw new UserNotAuthenticatedError()
        }
        this.wsAdapter.getServer().handleUpgrade(req, socket, head, ws => {
          this.wsAdapter.getServer().emit('connection', ws, req)
        })
      } catch (err) {
        logger.error('WebSocket authentication error:', err)
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()
      }
    })
  }

  private setupMiddlewares = () => {
    this.app.head('/health', (req, res) => {
      logger.info('Health check requested')
      res.status(200).send('OK')
    })
  }
}
