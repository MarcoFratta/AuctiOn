import { NextFunction, Request, Response } from 'express'
import { DeleteUserError, EmailAlreadyExistsError, UpdateUserError, UserNotFoundError } from '../errors/UserErrors'
import logger from '@auction/common/logger'

export const ErrorLoggerMiddleware = (err: unknown, _req: Request, _res: Response, next: NextFunction): void => {
  logger.error(JSON.stringify(err))
  next(err)
}
// Error handler middleware
export const UserErrorMiddleware = (err: unknown, _req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof UserNotFoundError) {
    res.status(404).json({
      error: 'User Not Found',
      message: err.message,
    })
  } else if (err instanceof UpdateUserError) {
    res.status(400).json({
      error: 'Update User Error',
      message: err.message,
    })
  } else if (err instanceof DeleteUserError) {
    res.status(400).json({
      error: 'Delete User Error',
      message: err.message,
    })
  } else if (err instanceof EmailAlreadyExistsError) {
    res.status(409).json({
      error: 'Email already exists',
      message: err.message,
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
