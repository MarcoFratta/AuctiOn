import express from 'express'
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

const app = express()

// Regular middlewares

app.use(express.json())
app.use(cors())
// Check if swagger.json exists
const swaggerPath = path.join(__dirname, '..', 'docs', 'swagger.json')
if (fs.existsSync(swaggerPath)) {
  const doc = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'))
  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(doc, {
      // customCssUrl: path.join(__dirname, "..", "css", "swaggerTheme.css"),
      // customfavIcon: path.join(__dirname, "..", "public", "logo.css"),
      customSiteTitle: 'Lobby Service API Documentation',
    })
  )
}
const repo = new MongoLobbyRepo()
const userLobbyRepo = new UserLobbyRepo()
const service = new LobbyServiceImpl(repo, userLobbyRepo)
const controller = new LobbyController(service)

app.use(authMiddleware)
// Routes
app.use('/lobby', createLobbyRouter(controller))

// Error handling middlewares should be last
app.use(ErrorLoggerMiddleware)
app.use(LobbyErrorMiddleware)
app.use(GenericErrorMiddleware)

export default app
