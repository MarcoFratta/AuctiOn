import express, { Application } from 'express'
import swaggerUi from 'swagger-ui-express'
import * as fs from 'node:fs'
import path from 'node:path'
import { LobbyServiceImpl } from './services/LobbyServiceImpl'
import { LobbyController } from './controllers/LobbyController'
import { createLobbyRouter } from './routes/LobbyRoutes'
import { MongoLobbyRepo } from './repositories/MongoLobbyRepo'
import { UserLobbyRepo } from './repositories/UserLobbyRepo'
import { ErrorLoggerMiddleware, GenericErrorMiddleware, LobbyErrorMiddleware } from './middlewares/ErrorsMiddleware'
import cors from 'cors'
import { authMiddleware } from './middlewares/AuthMiddleware'
import { KafkaProducer } from './controllers/KafkaProducer'
import { Kafka } from 'kafkajs'
import { KafkaConsumer } from './controllers/KafkaConsumer'
import { LobbyService } from './services/LobbyService'

export class App {
  public app: Application
  private readonly kafkaProducer: KafkaProducer
  private readonly kafkaConsumer: KafkaConsumer
  private readonly service: LobbyService
  private readonly controller: LobbyController

  constructor(kafka: Kafka) {
    this.app = express()
    const repo = new MongoLobbyRepo()
    const userLobbyRepo = new UserLobbyRepo()
    this.service = new LobbyServiceImpl(repo, userLobbyRepo)
    this.controller = new LobbyController(this.service)
    this.kafkaProducer = new KafkaProducer(kafka, this.service)
    this.kafkaConsumer = new KafkaConsumer(kafka, this.service, 'lobby-service')

    this.setupMiddlewares()
    this.setupSwagger()
    this.setupRoutes()
    this.setupErrorHandling()
  }

  public async start(port: number, kafka: boolean = true): Promise<void> {
    if (kafka) {
      await this.kafkaProducer.connect()
      await this.kafkaConsumer.connect()
    }

    return new Promise(resolve => {
      this.app.listen(port, () => {
        console.log(`Server is running on port ${port}`)
        resolve()
      })
    })
  }

  public async stop(): Promise<void> {
    if (this.kafkaProducer) {
      await this.kafkaProducer.disconnect()
    }
    if (this.kafkaConsumer) {
      await this.kafkaConsumer.disconnect()
    }
  }

  private setupMiddlewares(): void {
    this.app.use(express.json())
    this.app.use(cors())
    this.app.use(authMiddleware)
  }

  private setupSwagger(): void {
    const swaggerPath = path.join(__dirname, '..', 'docs', 'swagger.json')
    if (fs.existsSync(swaggerPath)) {
      const doc = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'))
      this.app.use(
        '/docs',
        swaggerUi.serve,
        swaggerUi.setup(doc, {
          customSiteTitle: 'Lobby Service API Documentation',
        })
      )
    }
  }

  private setupRoutes(): void {
    this.app.use('/lobby', createLobbyRouter(this.controller))
  }

  private setupErrorHandling(): void {
    this.app.use(ErrorLoggerMiddleware)
    this.app.use(LobbyErrorMiddleware)
    this.app.use(GenericErrorMiddleware)
  }
}
