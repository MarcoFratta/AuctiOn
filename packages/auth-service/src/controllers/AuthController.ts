import { NextFunction, Request, Response } from 'express'
import { AuthService } from '../services/AuthService'
import { LoginInputData, RegisterInputData, User } from '../schemas/AuthSchema'
import logger from '@auction/common/logger'
import { TokenExpiredError, UserNotFoundError } from '../errors/AuthErrors'
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
      const user = await this.authService.refreshToken({
        refreshToken,
      })
      logger.debug(`Token refreshed successfully`)

      // Check if the original cookie had an expiration
      const hasExpiration = !!(req.cookies['refreshToken'] && req.cookies['refreshToken'].expires)

      // Use the extracted method
      this.setRefreshTokenCookie(res, user.refreshToken, { hasExpiration })

      res.status(200).json({ token: user.accessToken, user: user.user })
    } catch (error) {
      logger.debug(`Error refreshing token: ${error}`)
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
      const user = await this.authService.login(inputData)

      const rememberMe = req.body.rememberMe === true

      // Use the extracted method
      this.setRefreshTokenCookie(res, user.refreshToken, { rememberMe })

      logger.debug(`User ${inputData.email} logged in successfully`)

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
      logger.info(`error logging in user: ${error}`)
      next(error)
    }
  }

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies['refreshToken']
      const accessToken = req.headers.authorization?.split(' ')[1]
      if (!refreshToken || !accessToken) {
        res.status(401).json({ message: 'Login required' })
        return
      }
      await this.authService.logout({ refreshToken, accessToken })
      res.clearCookie('refreshToken', { path: '/' }) // Make sure path matches what we set
      res.status(200).json({ message: 'User logged out successfully' })
    } catch (error) {
      next(error)
    }
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const inputData: RegisterInputData = req.body
    try {
      const user = await this.authService.register(inputData)
      if (config.env == 'production') {
        this.mailService.sendRegisterMail(user.email).then(() => {
          logger.debug(`Welcome email sent to user's email`)
        })
      }

      logger.debug(`User ${inputData.email} registered successfully`)

      // For new registrations, default to remembering the user
      this.setRefreshTokenCookie(res, user.refreshToken, { rememberMe: true })

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

  // Private method to set refresh token cookie with consistent options
  private setRefreshTokenCookie(
    res: Response,
    token: string,
    options: {
      rememberMe?: boolean
      hasExpiration?: boolean
    } = {}
  ): void {
    const cookieOptions = {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'lax' as const,
      path: '/',
    }

    // Add maxAge if rememberMe is true or if the original cookie had an expiration
    if (options.rememberMe || options.hasExpiration) {
      Object.assign(cookieOptions, {
        maxAge: config.refreshTokenExpireDays * 24 * 60 * 60 * 1000, // 30 days in milliseconds
      })
    }

    res.cookie('refreshToken', token, cookieOptions)
  }

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const email: string = req.params.email
      const token = await this.authService.forgotPassword(email)
      if (config.env == 'production') {
        this.mailService
          .sendResetMail(email, token)
          .then(() => {
            logger.debug(`Password reset link sent to user's email`)
          })
          .catch(error => {
            logger.error(`Error sending password reset email: ${error}`)
          })
      }
      res.status(200).json({
        message: "Password reset link sent to user's email",
      })
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        res.status(200).json({ message: 'Password reset link sent' })
        return
      }
      next(error)
    }
  }

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token: string = req.body.token
      const password: string = req.body.password
      logger.info(`resetting password ${password}`)
      await this.authService.resetPassword(token, password)
      logger.debug(`Password reset successfully`)
      res.status(200).json({ message: 'Password reset successfully' })
    } catch (error) {
      next(error)
    }
  }

  validateToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token: string = req.body.token
      if (!token) {
        res.status(401).json({ message: 'Login required' })
        return
      }
      const tokens = {
        accessToken: token,
      }

      const decoded: User = await this.authService.validateToken(tokens)
      logger.debug(`Token validated successfully for user ${decoded.email}`)
      res.status(200).json({ user: decoded })
    } catch (error) {
      next(error)
    }
  }
}
