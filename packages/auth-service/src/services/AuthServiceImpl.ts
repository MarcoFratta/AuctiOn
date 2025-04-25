import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import {
  InvalidTokenError,
  TokenExpiredError,
  UserAlreadyExistsError,
  UserNotFoundError,
  UserServiceUnavailableError,
  WrongPasswordError,
} from '../errors/AuthErrors'
import { AuthService } from './AuthService'
import { Account, LoginInputData, RegisterInputData, RegisterOutput, Token, User, userSchema } from '../schemas/AuthSchema'
import logger from '@auction/common/logger'
import { validateSchema } from '@auction/common/validation'
import { AccountRepository } from '../repositories/AccountRepository'
import { TokenGenerator } from '../domain/TokenGenerator'
import { TokensRepo } from '../repositories/TokensRepo'

export class AuthServiceImpl implements AuthService {
  constructor(
    private generator: TokenGenerator,
    private accountRepo: AccountRepository,
    private tokenRepo: TokensRepo,
    private userServiceURL: string
  ) {}

  // Register a new user
  async register(data: RegisterInputData): Promise<RegisterOutput> {
    const userExists = await this.getUserByEmail(data.email)
    if (userExists) throw new UserAlreadyExistsError(data.email)

    const hashedPassword = await this.getHashedPassword(data.password)

    const account = await this.accountRepo.create({ pHash: hashedPassword })
    const userInfo: User = validateSchema(userSchema, {
      ...data,
      id: account.id,
    })
    try {
      const newUser: User | null = await this.saveUser(userInfo)
      newUser.id = account.id
      const finalUser: User = validateSchema(userSchema, newUser)

      // Generate both access and refresh tokens
      const accessToken = this.generator.generateAccessToken(finalUser)
      const refreshToken = this.generator.generateRefreshToken({ id: finalUser.id })
      await this.tokenRepo.saveRefreshToken(refreshToken, account.id)

      return { accessToken, refreshToken, ...finalUser }
    } catch (e) {
      await this.accountRepo.delete(account.id)
      throw e
    }
  }

  // Login an existing user
  async login(data: LoginInputData): Promise<RegisterOutput> {
    const existingUser = await this.getUserByEmail(data.email)
    if (!existingUser) throw new UserNotFoundError(data.email)
    const user: User = validateSchema(userSchema, existingUser)
    const account = await this.accountRepo.findById(user.id)
    if (!account) {
      throw new UserNotFoundError(data.email)
    }
    const isPasswordValid = await this.comparePasswords(data, account)
    if (!isPasswordValid) throw new WrongPasswordError()

    // Generate both access and refresh tokens
    const accessToken = this.generator.generateAccessToken(user)
    const refreshToken = this.generator.generateRefreshToken({ id: user.id })
    await this.tokenRepo.saveRefreshToken(refreshToken, account.id)

    return { accessToken, refreshToken, ...user }
  }

  async logout(token: Token): Promise<void> {
    try {
      const decoded = this.generator.verifyRefreshToken(token.refreshToken)
      const accessDecode = this.generator.verifyAccessToken(token.accessToken)
      if (decoded.id !== accessDecode.id) {
        throw new InvalidTokenError()
      }
      await this.tokenRepo.deleteRefreshToken(decoded.id)
      await this.tokenRepo.deleteResetToken(decoded.id)
      await this.tokenRepo.blacklistToken(token.accessToken, decoded.exp)
    } catch (_error) {
      logger.error(_error)
      throw new InvalidTokenError()
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    // verify token
    let decoded
    try {
      decoded = this.generator.verifyResetToken(token)
    } catch (_e) {
      throw new TokenExpiredError()
    }
    if (!decoded || !decoded.id) {
      throw new InvalidTokenError()
    }
    const user = await this.accountRepo.findById(decoded.id)
    if (!user) {
      throw new UserNotFoundError('')
    }
    const storedToken = await this.tokenRepo.findResetToken(decoded.id)
    if (!storedToken || storedToken !== token) {
      throw new InvalidTokenError()
    }

    const newPasswordHash = await this.getHashedPassword(password)
    // update password
    await this.accountRepo.update(decoded.id, { pHash: newPasswordHash })
    // delete token
    await this.tokenRepo.deleteResetToken(decoded.id)
  }

  private async getHashedPassword(password: string) {
    return await bcrypt.hash(password, 10)
  }

  async refreshToken(token: Omit<Token, 'accessToken'>): Promise<Token & { user: User }> {
    try {
      const decoded = this.generator.verifyRefreshToken(token.refreshToken)
      const storedToken = await this.tokenRepo.findRefreshToken(decoded.id)

      if (!storedToken || storedToken !== token.refreshToken) {
        throw new InvalidTokenError()
      }
      const user: User | null = await this.getUserById(decoded.id)
      if (!user) {
        throw new InvalidTokenError()
      }
      // Generate new tokens
      const newAccessToken = this.generator.generateAccessToken(user)
      const newRefreshToken = this.generator.generateRefreshToken({ id: user.id })

      // Replace old refresh token with the new one in Redis
      await this.tokenRepo.saveRefreshToken(newRefreshToken, user.id)

      return { accessToken: newAccessToken, refreshToken: newRefreshToken, user: user }
    } catch (_error) {
      throw new InvalidTokenError()
    }
  }

  // Validate a JWT
  async validateToken(token: Omit<Token, 'refreshToken'>): Promise<User> {
    try {
      // Decode and verify the token
      if (await this.tokenRepo.isTokenBlacklisted(token.accessToken)) {
        throw new InvalidTokenError()
      }
      const decoded = this.generator.verifyAccessToken(token.accessToken)
      if (!decoded) {
        throw new InvalidTokenError()
      }

      return validateSchema(userSchema, decoded)
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new TokenExpiredError()
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new InvalidTokenError()
      }
      throw error
    }
  }

  private async getUserBy(url: string): Promise<User | null> {
    try {
      const { data: user } = await axios.get(url)
      return validateSchema(userSchema, user)
    } catch (e) {
      if (e instanceof UserNotFoundError) {
        return null
      }
      if (axios.isAxiosError(e)) {
        if (e.response) {
          if (e.response.status === 404) {
            return null
          }
        }
        throw new UserServiceUnavailableError(e.message)
      }
      logger.error(`Failed to get user: ${e}`)
      throw e
    }
  }

  private async getUserByEmail(email: string): Promise<User | null> {
    return this.getUserBy(`${this.userServiceURL}/email/${email}`)
  }

  private async getUserById(id: string): Promise<User | null> {
    return this.getUserBy(`${this.userServiceURL}/${id}`)
  }

  private async saveUser(data: User): Promise<User> {
    try {
      const { data: newUser } = await axios.post(this.userServiceURL, data)
      return validateSchema(userSchema, newUser)
    } catch (e) {
      logger.error(`Failed to save user: ${e}`)
      if (axios.isAxiosError(e) || e instanceof UserServiceUnavailableError) {
        throw new UserServiceUnavailableError(e.message)
      }
      throw e
    }
  }

  async forgotPassword(email: string): Promise<string> {
    const user = await this.getUserByEmail(email)
    if (!user) {
      throw new UserNotFoundError(email)
    }
    const alreadyExists = await this.tokenRepo.findResetToken(user.id)
    if (alreadyExists) {
      return alreadyExists
    }
    const resetToken = this.generator.generateResetToken({ id: user.id })
    await this.tokenRepo.saveResetToken(resetToken, user.id)
    // send email
    return resetToken
  }

  hasExpiration(token: string): boolean {
    try {
      const decoded = this.generator.verifyRefreshToken(token)
      return !!decoded.exp
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return false
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return false
      }
      throw error
    }
  }

  private async comparePasswords(data: LoginInputData, account: Account) {
    return await bcrypt.compare(data.password, account.pHash)
  }
}
