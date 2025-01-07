import { NextFunction, Request, Response } from 'express'
import axios from 'axios'
import { validateSchema } from '../utils/Validator'
import { userSchema } from '../schemas/User'
import logger from '../utils/Logger'
import { config } from '../configs/config'
import { ServiceUnavailableError, UserNotAuthenticatedError } from '../errors/LobbyErrors'

const AUTH_SERVICE_URL = config.authServiceUri

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    name: string
    email: string
  }
  activeLobbyId?: string
}

export const AuthMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1] // Extract the Bearer token from Authorization header
    if (!token) {
      return next(new UserNotAuthenticatedError())
    }
    // Validate the token using the Auth service
    const { data: response } = await axios.post(AUTH_SERVICE_URL + '/validate', { token: token })
    if (!response) {
      return next(new UserNotAuthenticatedError())
    }
    // Add user information to the request object
    req.user = validateSchema(userSchema, response.user)
    logger.info('User authenticated:', response.user.id)
    next()
  } catch (error) {
    logger.error('AuthMiddleware error ', error)
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        return next(new UserNotAuthenticatedError())
      }
      return next(new ServiceUnavailableError())
    }
    return next(error)
  }
}
