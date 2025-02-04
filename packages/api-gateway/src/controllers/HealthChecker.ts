import axios from 'axios'
import { NextFunction, Request, RequestHandler, Response } from 'express'
import logger from '@auction/common/logger'

export const healthChecker = (services: string[]): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('Health check requested')

      // Check health of each service
      const results = await Promise.allSettled(services.map(service => axios.head(`${service}/health`)))

      // Find failed services
      const failedServices = services.filter((_, i) => results[i].status === 'rejected')

      if (failedServices.length > 0) {
        logger.warn(`Health check failed for services: ${JSON.stringify(failedServices)}`)
        res.status(503).json({
          status: 'unhealthy',
          failedServices,
        })
        return
      }

      res.status(200).json({ status: 'healthy' })
    } catch (error) {
      logger.error(`Failed to check health: ${error}`)
      res.status(503).json({ status: 'unhealthy', error: 'Unexpected error' })
    }
  }
}
