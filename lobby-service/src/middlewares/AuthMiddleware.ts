import { NextFunction, Request, Response } from 'express'
import axios from 'axios'
import { validateSchema } from '../utils/Validator'
import { User, userSchema } from '../schemas/User'
import logger from '../utils/Logger'
import { config } from '../configs/config'

const AUTH_SERVICE_URL = config.authServiceUri

export interface AuthenticatedRequest extends Request {
    user?: User; // Extend the Request type with user info
}

export const AuthMiddleware = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const token = req.headers.authorization?.split(' ')[1] // Extract the Bearer token from Authorization header

        if (!token) {
            res.redirect('/login')
            return
        }

        // Validate the token using the Auth service
        const { data: response } = await axios.post(AUTH_SERVICE_URL, { token: token })
        // Extract user info from the auth service response
        // Add user information to the request object
        req.user = validateSchema(userSchema, response)
        next()
    } catch (error) {
        logger.error('Authentication error:')
        res.redirect('/login')
    }
}
