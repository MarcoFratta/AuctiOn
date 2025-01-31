import express from 'express'
import swaggerUi, { JsonObject } from 'swagger-ui-express'
import * as fs from 'node:fs'
import path from 'node:path'
import { AuthServiceImpl } from './services/AuthServiceImpl'
import { AuthController } from './controllers/AuthController'
import createRouter from './routes/Routes'
import { config } from './configs/config'
import { MongoAccountRepo } from './repositories/MongoAccountRepo'
import { JWTTokenGenerator } from './domain/JWTTokenGenerator'
import cookieParser from 'cookie-parser'
import logger from './utils/Logger'
import { RedisTokenRepo } from './repositories/RedisTokenRepo'
import Redis from 'ioredis'
import { MailClientImpl } from './services/MailClientImpl'
import nodemailer from 'nodemailer'

export class App {
  public app: express.Express
  private readonly redis: Redis

  constructor(redis: Redis) {
    this.redis = redis
    this.app = express()
    this.initializeMiddleware()
    this.initializeRoutes()
    this.initializeSwagger()
  }

  public start(port: number) {
    this.app.listen(port, () => {
      logger.info(`Auth Service running on port ${port}`)
    })
  }

  private initializeMiddleware() {
    this.app.use(express.json())
    this.app.use(cookieParser())
  }

  private initializeRoutes() {
    logger.info(`loading configs secrets ${config.accessTokenSecret} -
     ${config.refreshTokenSecret}`)

    const accountRepo = new MongoAccountRepo()
    const refreshExpire = config.refreshTokenExpireDays
    const accessExpire = config.accessTokenExpireMinutes
    const resetExpire = config.resetTokenExpireMinutes
    const tokensRepo = new RedisTokenRepo(this.redis, refreshExpire, resetExpire)
    const tokenGenerator = new JWTTokenGenerator(
      config.accessTokenSecret,
      config.refreshTokenSecret,
      config.resetTokenSecret,
      refreshExpire,
      accessExpire,
      resetExpire
    )

    const service = new AuthServiceImpl(tokenGenerator, accountRepo, tokensRepo, config.userServiceUrl)

    const mailer = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.emailUser,
        pass: config.emailPass,
      },
    })

    logger.info(`loading mailer with ${config.emailUser} - ${config.emailPass}`)

    const mailService = new MailClientImpl(mailer)
    const controller = new AuthController(service, mailService) // Use the router
    const router = createRouter(controller)
    this.app.use('/auth', router)
  }

  private initializeSwagger() {
    // Check if swagger.json exists
    const swaggerPath = path.join(__dirname, '..', 'docs', 'swagger.json')
    if (fs.existsSync(swaggerPath)) {
      const doc: JsonObject = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'))
      this.app.use(
        '/docs',
        swaggerUi.serve,
        swaggerUi.setup(doc, {
          customSiteTitle: 'Auth Service API Documentation',
        })
      )
    }
  }
}

export default App
