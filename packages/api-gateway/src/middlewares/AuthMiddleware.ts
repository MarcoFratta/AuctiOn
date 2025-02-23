import { NextFunction, Request, Response } from 'express'
import axios from 'axios'
import logger from '@auction/common/logger'
import { config } from '../configs/Config'
import { ServiceUnavailableError, UserNotAuthenticatedError } from '../errors/LobbyErrors'
import { Server } from 'socket.io'

const AUTH_SERVICE_URL = config.services['auth'].url + '/auth'

export interface User {
  id: string
  name: string
  email: string
}
export interface AuthenticatedRequest extends Request {
  user?: User
}

export const handleWsAuth = (io: Server) => {
  //Setup Socket.IO authentication middleware
  io.use(async (socket, next) => {
    logger.info('Socket.IO connection request received')
    const token = socket.handshake.auth?.token
    if (!token) {
      logger.error('Authentication token missing')
      socket.emit('error', 'Invalid authentication token')
      return next(new Error('Authentication token missing'))
    }

    try {
      const { data: response } = await axios.post(AUTH_SERVICE_URL + '/validate', { token: token })

      if (!response || !response.user) {
        logger.error('Unauthorized')
        socket.emit('error', 'Invalid authentication token')
        return next(new Error('Unauthorized'))
      }
      logger.info('User authenticated')
      socket.handshake.auth = { user: response.user }
      next()
    } catch (err) {
      logger.error(err)
      next(new Error('Authentication failed'))
    }
  })
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
