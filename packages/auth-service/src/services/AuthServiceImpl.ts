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
import { LoginInputData, RegisterInputData, RegisterOutput, Token, User, userSchema } from '../schemas/AuthSchema'
import logger from '../utils/Logger'
import { validateSchema } from '../utils/Validator'
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
    logger.info(`registering user: ${data.email}`)
    const userExists = await this.getUserByEmail(data.email)
    if (userExists) throw new UserAlreadyExistsError(data.email)

    const hashedPassword = await bcrypt.hash(data.password, 10)
    logger.info(`creating account for user: ${data.email}`)

    const account = await this.accountRepo.create({ pHash: hashedPassword })
    const userInfo: User = validateSchema(userSchema, {
      ...data,
      id: account.id,
    })
    logger.info(`created account with id : ${account.id}`)
    try {
      const newUser: User | null = await this.saveUser(userInfo)
      newUser.id = account.id
      logger.info(`created user: ${newUser}`)
      const finalUser: User = validateSchema(userSchema, newUser)

      // Generate both access and refresh tokens
      const accessToken = this.generator.generateAccessToken(finalUser)
      const refreshToken = this.generator.generateRefreshToken({ id: finalUser.id })
      logger.info(`generated access token ${accessToken} and refresh token ${refreshToken}`)
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
    const user = validateSchema(userSchema, existingUser)
    logger.info(`logging in user: ${data.email} with id ${user.id}`)
    const account = await this.accountRepo.findById(user.id)
    if (!account) {
      throw new UserNotFoundError(data.email)
    }
    const isPasswordValid = await bcrypt.compare(data.password, account.pHash)
    if (!isPasswordValid) throw new WrongPasswordError()
    logger.info(`password is valid for user: ${data.email}`)

    // Generate both access and refresh tokens
    const accessToken = this.generator.generateAccessToken(user)
    const refreshToken = this.generator.generateRefreshToken({ id: user.id })
    await this.tokenRepo.saveRefreshToken(refreshToken, account.id)

    return { accessToken, refreshToken, ...user }
  }

  async refreshToken(token: Omit<Token, 'accessToken'>): Promise<Token> {
    try {
      logger.info(`service refreshing token: ${token.refreshToken}`)
      const decoded = this.generator.verifyRefreshToken(token.refreshToken)
      logger.info(`decoded token: ${JSON.stringify(decoded)}`)
      const storedToken = await this.tokenRepo.findRefreshToken(decoded.id)

      if (!storedToken || storedToken !== token.refreshToken) {
        logger.info(`stored token: ${storedToken} different from given token ${token.refreshToken}`)
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

      return { accessToken: newAccessToken, refreshToken: newRefreshToken }
    } catch (error) {
      logger.error(`Error refreshing token: ${error}`)
      throw new InvalidTokenError()
    }
  }

  // Validate a JWT
  validateToken(token: Omit<Token, 'refreshToken'>): User {
    try {
      // Decode and verify the token
      const decoded: jwt.JwtPayload | string = this.generator.verifyAccessToken(token.accessToken)
      logger.info(`decoded token: ${JSON.stringify(decoded)}`)
      if (!decoded) {
        throw new InvalidTokenError()
      }
      return validateSchema(userSchema, decoded)
    } catch (error) {
      // Handle token expiry error
      if (error instanceof jwt.TokenExpiredError) {
        throw new TokenExpiredError()
      }
      // Handle invalid token error
      if (error instanceof jwt.JsonWebTokenError) {
        throw new InvalidTokenError()
      }
      // Rethrow any other errors
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
}
