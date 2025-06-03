import express, { Express } from 'express'
import http from 'http'
import { Kafka } from 'kafkajs'
import logger from '@auction/common/logger'
import { AuctionProducer } from './controllers/AuctionProducer'
import { AuctionServiceImpl } from './services/AuctionServiceImpl'
import { WebSocketAdapter } from './adapters/WebSocketAdapter'
import { MessageHandler } from './controllers/MessageHandler'
import { TimerServiceImpl } from './services/TimerServiceImpl'
import { LobbyConsumer } from './controllers/LobbyConsumer'
import { RedisAuctionRepo } from './repositories/RedisAuctionRepo'
import Redis from 'ioredis'
import * as process from 'node:process'
import { Server } from 'socket.io'
import { UserNotAuthenticatedError } from './errors/Errors'
import { validateSchema } from '@auction/common/validation'
import { userSchema } from './schemas/User'
import { config } from './configs/config'
import { UserService } from './services/UserService'
import { UserServiceImpl } from './services/UserServiceImpl'
import { RedisLock } from './services/RedisLock'
import { RedisPlayerAuctionMapRepo } from './repositories/PlayerAuctionMapRepo'
import { RedisTimerRepo } from './repositories/TimerRepo'
import { AuctionConsumer } from './controllers/AuctionConsumer'
import { MessageSender } from './controllers/MessageSender'
import { TimerEventSource } from './services/TimerEventSource'
import { RedisUserInfoRepository } from './repositories/RedisUserInfoRepository'
import cors from 'cors'

export class App {
  public wsAdapter: WebSocketAdapter
  public auctionService: AuctionServiceImpl
  public kafkaProducer: AuctionProducer
  public kafkaConsumer: LobbyConsumer
  public auctionController: MessageHandler
  public timerController: TimerEventSource
  public redis: Redis
  readonly server: http.Server
  private readonly app: Server
  private readonly express: Express
  private readonly userService: UserService
  private readonly auctionConsumer: AuctionConsumer
  private messageSender: MessageSender

  constructor(kafka: Kafka, redis: Redis, redlock: RedisLock) {
    this.redis = redis
    this.express = this.setupMiddlewares()
    this.server = http.createServer(this.express)
    this.app = this.setupWebSocket()
    const redisAuctionRepo = new RedisAuctionRepo(redis)
    const playersRepo = new RedisPlayerAuctionMapRepo(redis)
    const userInfoRepo = new RedisUserInfoRepository(redis)
    const timerRepo = new RedisTimerRepo(redis)
    this.auctionService = new AuctionServiceImpl(redisAuctionRepo, playersRepo, redlock)
    this.wsAdapter = new WebSocketAdapter(this.app)
    this.userService = new UserServiceImpl(userInfoRepo)
    this.auctionConsumer = new AuctionConsumer(kafka, this.auctionService, 'auction-events-consumer', this.userService)
    this.auctionController = new MessageHandler(this.wsAdapter, this.wsAdapter, this.auctionService)
    this.timerController = new TimerServiceImpl(this.auctionService, this.wsAdapter, this.wsAdapter, timerRepo, this.auctionConsumer)
    this.kafkaProducer = new AuctionProducer(
      kafka,
      this.auctionService,
      this.auctionService,
      this.wsAdapter,
      this.userService,
      this.timerController
    )
    this.messageSender = new MessageSender(
      this.auctionService,
      this.auctionConsumer,
      this.wsAdapter,
      this.auctionConsumer,
      this.userService,
      this.auctionConsumer,
      this.auctionConsumer
    )
    this.kafkaConsumer = new LobbyConsumer(kafka, this.auctionService, 'auction-events', this.userService)
    this.server.on('upgrade', (req, _socket, _head) => {
      logger.info(`WebSocket server upgrade request received: ${req.url}`)
    })
    this.app.on('upgrade', (req, _s, _h) => {
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
        this.kafkaProducer.connect().then(() => logger.info('Kafka lobby producer connected')),
        this.kafkaConsumer.connect().then(() => logger.info('Kafka lobby consumer connected')),
        this.auctionConsumer.connect().then(() => logger.info('Kafka auction consumer running')),
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
        origin: config.corsAllowedOrigins,
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
      } catch (_error) {
        return next(new UserNotAuthenticatedError())
      }
    })
    return io
  }

  private setupMiddlewares = () => {
    const app = express()
    app.use(express.json())
    app.use(
      cors({
        origin: config.corsAllowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-User'],
      })
    )

    app.head('/health', (req, res) => {
      logger.info('Health check requested')
      res.status(200).send('OK')
    })
    return app
  }
}
