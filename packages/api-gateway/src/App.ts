import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { Routes } from './routes/Routes'
import { ErrorLoggerMiddleware, GatewayErrorsMiddleware, GenericErrorMiddleware } from './middlewares/ErrorsMiddleware'
import { ProxyController } from './controllers/ProxyController'
import { LoggingMiddleware } from './middlewares/LoggingMiddleware'
import { healthChecker } from './controllers/HealthChecker'
import { config } from './configs/Config'
import logger from '@auction/common/logger'

const app = express()
if (config.nodeEnv != 'production') {
  config.corsAllowedOrigins.push('http://localhost:5174')
}
logger.info(`API Gateway running in ${config.nodeEnv} mode`)

app.use(
  cors({
    origin: config.corsAllowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  })
)
logger.info(`CORS enabled for origins: ${config.corsAllowedOrigins.join(', ')}`)
app.use(express.json())
app.use(LoggingMiddleware.requestLogger)

// 🌟 **Global Rate Limiter** (Optional - General API Protection)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Max 100 requests per IP
})
if (config.nodeEnv === 'production') {
  app.use(globalLimiter)
}

// 🌟 **Login-Specific Rate Limiter** (Prevents Brute Force Attacks)
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  limit: 10, // Allow max 5 requests per minutes
  message: {
    error: 'Too many login attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Apply login rate limit only to login and register
if (config.nodeEnv === 'production') {
  app.use('/auth/forget', loginLimiter)
  app.use('/auth/reset', loginLimiter)
  app.use('/auth/login', loginLimiter)
  app.use('/auth/register', loginLimiter)
}

app.head(
  '/health',
  healthChecker([config.services['users'].url, config.services['lobby'].url, config.services['auth'].url, config.services['auction'].url])
)

const proxyController = new ProxyController()
export const routes = new Routes(proxyController)

app.use(routes.createRoutes())
app.use(ErrorLoggerMiddleware)
app.use(GatewayErrorsMiddleware)
app.use(GenericErrorMiddleware)

export default app
