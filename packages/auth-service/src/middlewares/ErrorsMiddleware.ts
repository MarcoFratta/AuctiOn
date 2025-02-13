import { NextFunction, Request, Response } from 'express'
import * as errors from '../errors/AuthErrors'
import logger from '@auction/common/logger'
import axios from 'axios'

export const ErrorLoggerMiddleware = (err: unknown, _req: Request, _res: Response, next: NextFunction): void => {
  logger.error(err)
  next(err)
}
// Error handler middleware
export const AuthErrorMiddleware = (err: unknown, _req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof errors.UserNotFoundError) {
    res.status(404).json({
      error: 'User Not Found',
      message: err.message,
    })
  } else if (err instanceof errors.WrongPasswordError) {
    res.status(400).json({
      error: 'Wrong password',
      message: err.message,
    })
  } else if (err instanceof errors.InvalidTokenError) {
    res.status(400).json({
      error: 'Token is not valid',
      message: err.message,
    })
  } else if (err instanceof errors.UserAlreadyExistsError) {
    res.status(409).json({
      error: 'An account with this email already exists',
      message: err.message,
    })
  } else if (err instanceof errors.TokenExpiredError) {
    res.status(400).json({
      error: 'Token is not valid',
      message: err.message,
    })
  } else if (axios.isAxiosError(err)) {
    res.status(503).json({
      error: 'Service Temporary Unavailable',
      message: 'Service is not responding',
    })
  } else if (err instanceof errors.UserServiceUnavailableError) {
    res.status(503).json({
      error: 'Service Temporary Unavailable',
      message: 'Service is not responding',
    })
  } else {
    next(err)
  }
}

export const GenericErrorMiddleware = (_err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred.',
  })
}
