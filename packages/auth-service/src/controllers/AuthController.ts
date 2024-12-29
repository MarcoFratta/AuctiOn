import { NextFunction, Request, Response } from 'express'
import { AuthService } from '../services/AuthService'
import { LoginInputData, RegisterInputData, User } from '../schemas/AuthSchema'
import logger from '../utils/Logger'

export class AuthController {
    private readonly authService: AuthService

    constructor(authService: AuthService) {
        this.authService = authService
    }

    login = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const inputData: LoginInputData = req.body
        try {
            const user = await this.authService.login(inputData)
            res.status(200).json({
                user: user,
            })
        } catch (error) {
            next(error)
        }
    }
    register = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const inputData: RegisterInputData = req.body
        try {
            logger.info(`Registering user with email: ${inputData.email}`)
            const user = await this.authService.register(inputData)
            logger.info(
                `User registered successfully with email: ${inputData.email}`
            )
            res.status(201).json({
                message: 'User registered successfully',
                user: user,
            })
        } catch (error) {
            next(error)
        }
    }

    validateToken = (req: Request, res: Response, next: NextFunction): void => {
        try {
            const token: string = req.body.token
            if (!token) {
                res.status(401).json({ message: 'Token is missing' })
                return
            }

            const decoded: User = this.authService.validateToken({
                token: token,
            })
            logger.info(`Token validated successfully ${decoded}`)
            res.status(200).json({ user: decoded })
        } catch (error) {
            next(error)
        }
    }
}
