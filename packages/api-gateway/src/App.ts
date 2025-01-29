import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { Routes } from './routes/Routes'
import { ErrorLoggerMiddleware, GatewayErrorsMiddleware, GenericErrorMiddleware } from './middlewares/ErrorsMiddleware'
import { ProxyController } from './controllers/ProxyController'
import { LoggingMiddleware } from './middlewares/LoggingMiddleware'

const app = express()
app.use(cors())
app.use(express.json())
app.use(LoggingMiddleware.requestLogger)

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
})
app.use(limiter)

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' })
})
const proxyController = new ProxyController()
export const routes = new Routes(proxyController)

app.use(routes.createRoutes())
app.use(ErrorLoggerMiddleware)
app.use(GatewayErrorsMiddleware)
app.use(GenericErrorMiddleware)

export default app
