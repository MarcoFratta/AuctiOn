import { NextFunction, Request, Response } from 'express'
import axios from 'axios'
import logger from '../utils/Logger'
import { config } from '../configs/Config'
import { ServiceUnavailableError, UserNotAuthenticatedError } from '../errors/LobbyErrors'
import { IncomingMessage } from 'node:http'

const AUTH_SERVICE_URL = config.services['auth'].url + '/auth'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    name: string
    email: string
  }
}

export const WSAuthMiddleware = async (req: IncomingMessage): Promise<boolean> => {
  try {
    const token = req.headers.authorization?.split(' ')[1] // Extract the Bearer token from Authorization header
    if (!token) {
      return false
    }
    // Validate the token using the Auth service
    const { data: response } = await axios.post(AUTH_SERVICE_URL + '/validate', { token: token })
    if (!response || !response.user) {
      return false
    }
    // Optionally add user info to the headers for forwarding
    req.headers['x-user'] = JSON.stringify(response.user)
    return response.user
  } catch (error) {
    logger.error('AuthMiddleware error ', error)
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        return false
      }
      return false
    }
    return false
  }
}
export const AuthMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1] // Extract the Bearer token from Authorization header
    if (!token) {
      return next(new UserNotAuthenticatedError())
    }
    // Validate the token using the Auth service
    const { data: response } = await axios.post(AUTH_SERVICE_URL + '/validate', { token: token })
    if (!response || !response.user) {
      return next(new UserNotAuthenticatedError())
    }
    // Add user information to the request object
    req.user = response.user
    // Optionally add user info to the headers for forwarding
    req.headers['x-user'] = JSON.stringify(response.user)

    logger.info(`User authenticated: ${response.user.id}`)
    next()
  } catch (error) {
    logger.error('AuthMiddleware error ', error)
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400 || error.response?.status === 401) {
        return next(new UserNotAuthenticatedError())
      }
      return next(new ServiceUnavailableError())
    }
    return next(error)
  }
}
