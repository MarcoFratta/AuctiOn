import {
  ForbiddenError,
  LobbyFullError,
  LobbyNotFoundError,
  MatchAlreadyInProgressError,
  NotEnoughPlayersError,
  PlayerNotFoundError,
  PlayersNotReadyError,
  ServiceUnavailableError,
  UserAlreadyJoined,
  UserNotAuthenticatedError,
  UserNotInActiveLobby,
} from '../errors/LobbyErrors'
import { NextFunction, Request, Response } from 'express'
import logger from '../utils/Logger'

// Error Logger Middleware
export const ErrorLoggerMiddleware = (err: unknown, _req: Request, _res: Response, next: NextFunction): void => {
  logger.error('[Error logger]' + err)
  next(err)
}

// Error Handler Middleware for Lobby Errors
export const LobbyErrorMiddleware = (err: unknown, _req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof LobbyNotFoundError) {
    res.status(404).json({
      error: 'Not Found',
      message: err.message,
    })
  } else if (err instanceof LobbyFullError) {
    res.status(400).json({
      error: 'Bad request',
      message: err.message,
    })
  } else if (err instanceof PlayerNotFoundError) {
    res.status(404).json({
      error: 'Not Found',
      message: err.message,
    })
  } else if (err instanceof PlayersNotReadyError) {
    res.status(400).json({
      error: 'Bad request',
      message: err.message,
    })
  } else if (err instanceof NotEnoughPlayersError) {
    res.status(400).json({
      error: 'Bad request',
      message: err.message,
    })
  } else if (err instanceof UserNotAuthenticatedError) {
    res.status(401).json({
      error: 'User not authenticated',
      message: err.message,
    })
  } else if (err instanceof ForbiddenError) {
    res.status(403).json({
      error: 'Forbidden',
      message: err.message,
    })
  } else if (err instanceof MatchAlreadyInProgressError) {
    res.status(400).json({
      error: 'Bad request',
      message: err.message,
    })
  } else if (err instanceof ServiceUnavailableError) {
    res.status(503).json({
      error: 'Service Temporary Unavailable',
      message: 'Service is not responding',
    })
  } else if (err instanceof UserAlreadyJoined) {
    res.status(400).json({
      error: 'Bad request',
      message: err.message,
    })
  } else if (err instanceof UserNotInActiveLobby) {
    res.status(400).json({
      error: 'Bad request',
      message: err.message,
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
