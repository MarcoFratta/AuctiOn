import { config } from '../configs/config'
import { Request } from 'express'
import logger from '../utils/Logger'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    name: string
  }
}

export const authMiddleware = (req: AuthenticatedRequest): boolean => {
  logger.info(`Authenticating request: ${JSON.stringify(req)}`)
  if (config.env == 'test') {
    logger.info('Running in test mode...')
    req.user = {
      id: req.url?.split('/').pop() ?? '',
      email: '',
      name: '',
    }

    return true
  }
  try {
    logger.info(`Authenticating request: ${JSON.stringify(req.headers)}`)
    const user = JSON.parse(req.headers['x-user'] as string)
    if (user.id && user.email && user.name) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
      }
      return true
    }
    return false
  } catch (e) {
    logger.error(`Error while authenticating request: ${e}`)
    return false
  }
}
