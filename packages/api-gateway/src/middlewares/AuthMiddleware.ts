import { NextFunction, Request, Response } from 'express'
import axios from 'axios'
import logger from '@auction/common/logger'
import { config } from '../configs/Config'
import { ServiceUnavailableError, UserNotAuthenticatedError } from '../errors/LobbyErrors'
import WebSocket from 'ws'

const AUTH_SERVICE_URL = config.services['auth'].url + '/auth'

export interface User {
  id: string
  name: string
  email: string
}
export interface AuthenticatedRequest extends Request {
  user?: User
}

export const handleWsAuth = (wss: WebSocket.Server): void => {
  wss.on('connection', (ws, req) => {
    logger.info('New WebSocket connection')

    // Authentication should happen on the first message (or during the handshake phase)
    ws.once('message', async token => {
      const user = await WSAuthMiddleware(String(token))
      if (!user) {
        logger.info('Authentication failed, closing connection')
        ws.close()
        return
      }

      logger.info('Authenticated, ready to forward WebSocket messages', user)

      // You can forward messages between WebSocket clients and Auction WebSocket Service
      const auctionWs = new WebSocket(config.services['auction'].url) // Assuming Auction Service WebSocket URL

      auctionWs.on('open', () => {
        // Forward client messages to Auction Service
        logger.info(`sending user ${user}`)
        auctionWs.send(JSON.stringify(user))
        ws.on('message', message => {
          auctionWs.send(message)
        })

        // Forward Auction Service messages back to client
        auctionWs.on('message', auctionMessage => {
          ws.send(auctionMessage)
        })
      })

      auctionWs.on('close', (code, reason) => {
        logger.info('Auction WebSocket closed')
        ws.close(code, reason)
      })

      auctionWs.on('error', error => {
        logger.error('Error in Auction WebSocket:', error)
        ws.close()
      })
    })

    ws.on('close', () => {
      logger.info('WebSocket connection closed')
    })

    ws.on('error', error => {
      logger.error('WebSocket error:', error)
    })
  })
}
export const WSAuthMiddleware = async (token: string): Promise<User | false> => {
  try {
    // Validate the token using the Auth service
    const { data: response } = await axios.post(AUTH_SERVICE_URL + '/validate', { token: token })
    if (!response || !response.user) {
      return false
    }
    // Optionally add user info to the headers for forwarding
    logger.info(`User authenticated: ${JSON.stringify(response.user)}`)
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
