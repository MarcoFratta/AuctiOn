import { ServiceUnavailableError, UserNotAuthenticatedError } from '../errors/LobbyErrors'
import { NextFunction, Request, Response } from 'express'
import logger from '@auction/common/logger'

// Error Logger Middleware
export const ErrorLoggerMiddleware = (err: unknown, _req: Request, _res: Response, next: NextFunction): void => {
  logger.error('[Error logger]' + err)
  next(err)
}

// Error Handler Middleware for Lobby Errors
export const GatewayErrorsMiddleware = (err: unknown, _req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof UserNotAuthenticatedError) {
    res.status(401).json({
      error: 'User not authenticated',
      message: err.message,
    })
  } else if (err instanceof ServiceUnavailableError) {
    res.status(503).json({
      error: 'Service Temporary Unavailable',
      message: 'Service is not responding',
    })
  } else {
    next(err) // Pass to the generic error handler
  }
}

// Generic Error Handler Middleware
export const GenericErrorMiddleware = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  logger.error('Unhandled error:', err)
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred.',
  })
}
