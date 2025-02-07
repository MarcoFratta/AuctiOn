import { config } from '../configs/config'
import { Request } from 'express'
import logger from '@auction/common/logger'
import { validateSchema } from '@auction/common/validation'
import { userSchema } from '../schemas/User'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    name: string
  }
}

export const authMiddleware = (req: AuthenticatedRequest): boolean => {
  logger.debug(`Authenticating request: ${JSON.stringify(req)}`)
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
