import express from 'express'
import { createUserRouter } from './routes/UserRoutes'
import { UserService } from './services/UserService'
import { UserController } from './controllers/UserController'
import { MongooseUserRepository } from './repositories/MongoUserRepo'
import { reverseUserConverter, userConverter } from './utils/Converters'
import swaggerUi from 'swagger-ui-express'
import * as fs from 'node:fs'
import path from 'node:path'
import logger from '@auction/common/logger'

const app = express()
// Initialize dependencies

const swaggerPath = path.join(__dirname, '..', 'docs', 'swagger.json')
if (fs.existsSync(swaggerPath)) {
  const doc = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'))
  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(doc, {
      // customCssUrl: path.join(__dirname, "..", "css", "swaggerTheme.css"),
      // customfavIcon: path.join(__dirname, "..", "public", "logo.css"),
      customSiteTitle: 'User Service API Documentation',
    })
  )
}

export const repository = new MongooseUserRepository(userConverter, reverseUserConverter)
export const service = new UserService(repository)
export const controller = new UserController(service)

// Use the router
const router = createUserRouter(controller)
// Middleware
app.use(express.json())
app.head('/health', (req, res) => {
  logger.info('Health check requested')
  res.status(200).send('OK')
})
// Routes
app.use('/users', router)

export default app
