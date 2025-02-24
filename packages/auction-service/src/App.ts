import express, { Express } from 'express'
import http from 'http'
import { Kafka } from 'kafkajs'
import logger from '@auction/common/logger'
import { KafkaProducer } from './controllers/KafkaProducer'
import { AuctionServiceImpl } from './services/AuctionServiceImpl'
import { WebSocketAdapter } from './adapters/WebSocketAdapter'
import { AuctionController } from './controllers/AuctionController'
import { TimerController } from './controllers/TimerController'
import { KafkaConsumer } from './controllers/KafkaConsumer'
import { RedisAuctionRepo } from './repositories/RedisAuctionRepo'
import Redis from 'ioredis'
import * as process from 'node:process'
import { Server } from 'socket.io'
import { UserNotAuthenticatedError } from './errors/Errors'
import { validateSchema } from '@auction/common/validation'
import { userSchema } from './schemas/User'
import { config } from './configs/config'

export class App {
  public wsAdapter: WebSocketAdapter
  public auctionService: AuctionServiceImpl
  public kafkaProducer: KafkaProducer
  public kafkaConsumer: KafkaConsumer
  public auctionController: AuctionController
  public timerController: TimerController
  public redis: Redis
  readonly server: http.Server
  private readonly app: Server
  private readonly express: Express

  constructor(kafka: Kafka, redis: Redis) {
    this.redis = redis
    this.express = this.setupMiddlewares()
    this.server = http.createServer(this.express)
    this.app = this.setupWebSocket()
    this.auctionService = new AuctionServiceImpl(new RedisAuctionRepo(redis))
    this.wsAdapter = new WebSocketAdapter(this.app)
    this.auctionController = new AuctionController(this.auctionService, this.wsAdapter, this.wsAdapter)
    this.timerController = new TimerController(this.auctionService, this.wsAdapter, this.wsAdapter)
    this.kafkaProducer = new KafkaProducer(kafka, this.auctionService, this.wsAdapter)
    this.kafkaConsumer = new KafkaConsumer(kafka, this.auctionService, 'auction-events')
    this.server.on('upgrade', (req, socket, head) => {
      logger.info(`WebSocket server upgrade request received: ${req.url}`)
    })
    this.app.on('upgrade', (req, socket, head) => {
      logger.info(`WebSocket upgrade request received: ${req.url}`)
    })
    this.app.on('connection', socket => {
      logger.info(`New WebSocket connection: ${socket.id}`)
    })
    this.app.on('connect_error', err => {
      logger.error(`WebSocket connection error: ${err}`)
    })
  }

  public async start(port: number): Promise<void> {
    try {
      await Promise.all([
        this.kafkaProducer.connect().then(() => logger.info('Kafka producer connected')),
        this.kafkaConsumer.connect().then(() => logger.info('Kafka consumer connected')),
        this.auctionService.loadAuctions().then(() => logger.info('Auctions loaded')),
      ])
      this.server.listen(port)
      //this.express.listen(3006)
      logger.info(`Server started on port ${port}`)
    } catch (err) {
      logger.error('Failed to start server:', err)
      await this.stop()
      process.exit(1)
    }
  }

  public async stop(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      await this.kafkaConsumer.disconnect()
      this.app.close(err => reject(err)).then(resolve)
    })
  }

  private setupWebSocket(): Server {
    const io = new Server(this.server, {
      path: '/auction',
      allowRequest: (req, callback) => {
        logger.info(`WebSocket request received: ${req.url}`)
        try {
          callback(null, true) // Always allow
        } catch (err) {
          logger.error('Error in allowRequest', err)
          callback('error', false)
        }
      },
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    })

    logger.info(`WebSocket server started on path ${JSON.stringify(io._opts.cors!)}`)
    io.use((socket, next) => {
      if (config.env === 'test') {
        logger.debug('Running in test mode, skipping auth')
        socket.handshake.auth.user = { id: socket.handshake.auth.token }
        return next()
      }
      logger.info(`New Socket.IO connection with player: ${socket.handshake.auth}`)
      if (!socket.handshake.auth.user) {
        return next(new UserNotAuthenticatedError())
      }
      try {
        validateSchema(userSchema, socket.handshake.auth.user)
        return next()
      } catch (e) {
        return next(new UserNotAuthenticatedError())
      }
    })
    return io
  }

  private setupMiddlewares = () => {
    const app = express()

    app.head('/health', (req, res) => {
      logger.info('Health check requested')
      res.status(200).send('OK')
    })
    return app
  }
}
