import express, { Application } from 'express'
import { createUserRouter } from './routes/UserRoutes'
import { UserService, UserServiceImpl } from './services/UserService'
import { UserController } from './controllers/UserController'
import { MongooseUserRepository } from './repositories/MongoUserRepo'
import { reverseUserConverter, userConverter } from './utils/Converters'
import swaggerUi from 'swagger-ui-express'
import * as fs from 'node:fs'
import path from 'node:path'
import logger from '@auction/common/logger'

export class App {
  public app: Application
  private readonly service: UserService
  private readonly controller: UserController

  constructor() {
    this.app = express()
    const repository = new MongooseUserRepository(userConverter, reverseUserConverter)
    this.service = new UserServiceImpl(repository)
    this.controller = new UserController(this.service)

    this.setupMiddlewares()
    this.setupSwagger()
    this.setupRoutes()
  }

  public start(port: number): Promise<void> {
    return new Promise(resolve => {
      this.app.listen(port, () => {
        logger.info(`Service is running on port ${port}`)
        resolve()
      })
    })
  }

  private setupMiddlewares(): void {
    this.app.use(express.json())
    this.app.head('/health', (req, res) => {
      logger.info('Health check requested')
      res.status(200).send('OK')
    })
  }

  private setupSwagger(): void {
    const swaggerPath = path.join(__dirname, '..', 'docs', 'swagger.json')
    if (fs.existsSync(swaggerPath)) {
      logger.info('Swagger documentation found. Setting up Swagger UI...')
      const doc = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'))
      this.app.use(
        '/docs',
        swaggerUi.serve,
        swaggerUi.setup(doc, {
          customSiteTitle: 'User Service API Documentation',
        })
      )
    }
  }

  private setupRoutes(): void {
    this.app.use('/users', createUserRouter(this.controller))
  }
}
