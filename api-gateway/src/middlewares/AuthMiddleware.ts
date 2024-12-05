import { NextFunction, Request, Response } from 'express'
import { AuthServiceClient } from '../services/AuthServiceClient'
import * as console from 'node:console'
import logger from '../utils/Logger'

const createAuthMiddleware = (service: AuthServiceClient) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        logger.info('AuthMiddleware: Checking token...')
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Unauthorized' })
            return
        }

        const token = authHeader.split(' ')[1]
        try {
            const user = await service.validateToken(token)
            if (!user) {
                res.status(401).json({ message: 'Invalid token' })
                return
            }
            req.body.user = user // Attach user info to the request
            next()
        } catch (_err) {
            console.log('Token validation failed:', _err)
            res.status(401).json({ message: 'Invalid token' })
        }
    }
}

export default createAuthMiddleware
