import logger from '../utils/Logger'
import { NextFunction, Request, Response } from 'express'

export class LoggingMiddleware {
  static requestLogger(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now()

    res.on('finish', () => {
      logger.info({
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: Date.now() - start,
        requestId: req.headers['x-request-id'],
      })
    })
    next()
  }
}
