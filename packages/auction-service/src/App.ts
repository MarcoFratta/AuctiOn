import express from 'express'
import http from 'http'
import { Kafka } from 'kafkajs'
import logger from './utils/Logger'
import { KafkaProducer } from './controllers/KafkaProducer'
import { AuctionService } from './services/AuctionService'
import { AuctionServiceImpl } from './services/AuctionServiceImpl'
import { WebSocketAdapter } from './adapters/WebSocketAdapter'
import { AuctionController } from './controllers/AuctionController'
import { AuctionEventsSource } from './services/AuctionEventsSource'
import { AuthenticatedRequest, authMiddleware } from './middlewares/AuthMiddleware'
import { UserNotAuthenticatedError } from './errors/Errors'
import { Duplex } from 'stream'
import { TimerController } from './controllers/TimerController'
import { KafkaConsumer } from './controllers/KafkaConsumer'

export class App {
  public app: express.Application
  public server: http.Server
  public wsAdapter: WebSocketAdapter
  public auctionService: AuctionService & AuctionEventsSource
  public kafkaProducer: KafkaProducer
  public kafkaConsumer: KafkaConsumer
  public auctionController: AuctionController
  public timerController: TimerController

  constructor(kafkaBrokers: string[]) {
    this.app = express()
    this.server = http.createServer(this.app)
    this.auctionService = new AuctionServiceImpl()
    this.wsAdapter = new WebSocketAdapter({ noServer: true })

    this.setupWebSocket()

    const kafka = new Kafka({
      clientId: 'auction-service',
      brokers: kafkaBrokers,
    })

    this.auctionController = new AuctionController(this.auctionService, this.wsAdapter, this.wsAdapter)
    this.timerController = new TimerController(this.auctionService, this.wsAdapter, this.wsAdapter)
    this.kafkaProducer = new KafkaProducer(kafka, this.auctionService, this.wsAdapter)
    this.kafkaConsumer = new KafkaConsumer(kafka, this.auctionService, 'auction-events')
  }

  public async start(port: number, kafka: boolean = true): Promise<void> {
    if (kafka) {
      await this.kafkaProducer.connect()
      logger.info('Kafka producer connected')
      await this.kafkaConsumer.connect()
      logger.info('Kafka consumer connected')
    }
    return new Promise(resolve => {
      this.server.listen(port, () => {
        logger.info(`Server is running on port ${port}`)
        resolve()
      })
    })
  }

  public async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
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
}
