import { NextFunction, Request, Response } from 'express'
import { AuthService } from '../services/AuthService'
import { LoginInputData, RegisterInputData, User } from '../schemas/AuthSchema'
import logger from '../utils/Logger'
import { TokenExpiredError } from '../errors/AuthErrors'
import { MailClient } from '../services/MailClient'
import { config } from '../configs/config'

export class AuthController {
  private readonly authService: AuthService
  private readonly mailService: MailClient

  constructor(authService: AuthService, mailService: MailClient) {
    this.authService = authService
    this.mailService = mailService
  }

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies['refreshToken']
      if (!refreshToken) {
        res.status(401).json({ message: 'Login required' })
        return
      }
      const refreshedToken = await this.authService.refreshToken({
        refreshToken,
      })
      logger.info(`Token refreshed successfully ${refreshedToken}`)
      res.cookie('refreshToken', refreshedToken.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      })
      res.status(200).json({ token: refreshedToken.accessToken })
    } catch (error) {
      logger.error(`Error refreshing token: ${error}`)
      if (error instanceof TokenExpiredError) {
        res.status(401).json({ message: 'Login required' })
      } else {
        next(error)
      }
    }
  }

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const inputData: LoginInputData = req.body
    try {
      logger.info(`Logging in user with email: ${inputData.email}`)

      const user = await this.authService.login(inputData)

      res.cookie('refreshToken', user.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      })

      logger.info(`User logged in successfully with email: ${inputData.email}`)

      res.status(200).json({
        message: 'User logged in successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          token: user.accessToken,
        },
      })
    } catch (error) {
      logger.error(`error logging in user: ${error}`)
      next(error)
    }
  }
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const inputData: RegisterInputData = req.body
    try {
      logger.info(`Registering user with email: ${inputData.email}`)

      const user = await this.authService.register(inputData)
      if (config.env == 'production') {
        this.mailService.sendRegisterMail(user.email).then(() => {
          logger.info(`Welcome email sent to user's email`)
        })
      }

      logger.info(`User registered successfully with email: ${inputData.email}`)
      res.cookie('refreshToken', user.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      })
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          token: user.accessToken,
        },
      })
    } catch (error) {
      next(error)
    }
  }
  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const email: string = req.params.email
      const token = await this.authService.forgotPassword(email)
      if (config.env == 'production') {
        this.mailService
          .sendResetMail(email, token)
          .then(() => {
            logger.info(`Password reset link sent to user's email`)
          })
          .catch(error => {
            logger.error(`Error sending password reset email: ${error}`)
          })
      }
      res.status(200).json({
        message: "Password reset link sent to user's email",
      })
    } catch (error) {
      next(error)
    }
  }
  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token: string = req.body.token
      const password: string = req.body.password
      await this.authService.resetPassword(token, password)
      res.status(200).json({ message: 'Password reset successfully' })
    } catch (error) {
      next(error)
    }
  }

  validateToken = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const token: string = req.body.token
      if (!token) {
        res.status(401).json({ message: 'Login required' })
        return
      }
      const tokens = {
        accessToken: token,
      }

      const decoded: User = this.authService.validateToken(tokens)
      logger.info(`Token validated successfully ${decoded}`)
      res.status(200).json({ user: decoded })
    } catch (error) {
      next(error)
    }
  }
}
