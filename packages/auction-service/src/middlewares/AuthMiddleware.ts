import { config } from '../configs/config'
import { Request } from 'express'
import logger from '../utils/Logger'
import { validateSchema } from '../utils/Validator'
import { userSchema } from '../schemas/User'

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
    logger.info(`Request headers: ${JSON.stringify(req.headers)}`)
    const user = validateSchema(userSchema, JSON.parse(req.headers['x-user'] as string))
    logger.info(user)
    req.user = user
    return true
  } catch (e) {
    logger.error(`Error while authenticating request:`)
    logger.error(e)
    return false
  }
}
