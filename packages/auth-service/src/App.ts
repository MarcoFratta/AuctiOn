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
import logger from '@auction/common/logger'
import { RedisTokenRepo } from './repositories/RedisTokenRepo'
import Redis from 'ioredis'
import { MailClientImpl } from './services/MailClientImpl'
import nodemailer, { Transporter } from 'nodemailer'
import { emailConfig } from './configs/emailConfig'
import cors from 'cors'

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
    this.app.use(
      cors({
        origin: config.corsAllowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-User'],
      })
    )
    this.app.head('/health', (req, res) => {
      logger.info('Health check requested')
      res.status(200).send('OK')
    })
  }

  private initializeRoutes() {
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

    let mailer: Transporter

    if (config.env === 'test') {
      logger.info(`Running in test environment. Configuring MailHog transport.`)
      mailer = nodemailer.createTransport({
        host: config.emailHost,
        port: config.emailPort,
      })
      mailer.verify(function (error, _success) {
        if (error) {
          logger.error(`MailHog connection error: ${error}`)
        } else {
          logger.info('MailHog server is ready to take our messages')
        }
      })
    } else {
      logger.info(`Running in ${config.env} environment. Configuring default (Gmail) transport.`)
      mailer = nodemailer.createTransport({
        host: config.emailHost,
        port: config.emailPort,
        service: 'gmail',
        auth: {
          user: config.emailUser,
          pass: config.emailPass,
        },
      })
      mailer.verify(function (error, _success) {
        if (error) {
          logger.error(`Default mailer connection error: ${error}`)
        } else {
          logger.info('Default mailer server is ready to take our messages')
        }
      })
    }

    const mailService = new MailClientImpl(mailer, emailConfig)
    const controller = new AuthController(service, mailService)
    const router = createRouter(controller)
    this.app.use('/auth', router)
  }

  private initializeSwagger() {
    // Check if swagger.json exists
    const swaggerPath = path.join(__dirname, '..', 'docs', 'swagger.json')
    if (fs.existsSync(swaggerPath)) {
      logger.info('Swagger documentation found, initializing...')
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
