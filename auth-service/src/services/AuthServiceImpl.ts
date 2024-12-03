import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import {InvalidTokenError, UserAlreadyExistsError, UserNotFoundError, WrongPasswordError,} from '../errors/AuthErrors'
import {AuthService} from './AuthService'
import {LoginInputData, RegisterInputData, RegisterOutput, Token, User, userSchema,} from '../schemas/AuthSchema'
import logger from '../utils/Logger'
import {validateSchema} from '../utils/Validator'
import {AccountRepository} from '../repositories/AccountRepository'

export class AuthServiceImpl implements AuthService {
    private readonly userServiceURL: string
    private readonly jwtSecret: string

    constructor(
        userServiceURL: string,
        jwtSecret: string,
        private repo: AccountRepository
    ) {
        this.userServiceURL = userServiceURL
        this.jwtSecret = jwtSecret
    }

    // Register a new user
    async register(data: RegisterInputData): Promise<RegisterOutput> {
        logger.info(`registering user: ${data.email}`)
        const {data: existingUser} = await axios.get(
            `${this.userServiceURL}/email/${data.email}`
        )
        if (existingUser) throw new UserAlreadyExistsError(data.email)
        const hashedPassword = await bcrypt.hash(data.password, 10)
        logger.info(`creating account for user: ${data.email}`)
        const account = await this.repo.create({pHash: hashedPassword})
        if (!account) {
            throw new Error('Failed to create account')
        }
        logger.info(`created account with id : ${account.id}`)
        const {data: newUser} = await axios.post(this.userServiceURL, {
            id: account.id,
            email: data.email,
            name: data.name,
        })

        if (!newUser) {
            await this.repo.delete(account.id)
            throw new Error('Failed to create user')
        }
        logger.info(`created user: ${newUser}`)
        const userInfo = {
            id: account.id,
            email: newUser.email,
            name: newUser.name,
        }
        const token = jwt.sign(userInfo, this.jwtSecret, {expiresIn: '1h'})
        return {token: token, ...userInfo}
    }

    // Login an existing user
    async login(data: LoginInputData): Promise<RegisterOutput> {
        const {data: res} = await axios.get(
            `${this.userServiceURL}/email/${data.email}`
        )
        if (!res) throw new UserNotFoundError(data.email)
        const user = validateSchema(userSchema, res)
        logger.info(`logging in user: ${data.email} with id ${user.id}`)
        const account = await this.repo.findById(user.id!)
        if (!account) {
            throw new UserNotFoundError(data.email)
        }
        logger.info(
            `found account with id: ${account.id} with hash ${account.pHash}`
        )
        const isPasswordValid = await bcrypt.compare(
            data.password,
            account.pHash
        )
        if (!isPasswordValid) throw new WrongPasswordError()
        logger.info(`password is valid for user: ${data.email}`)
        const token = jwt.sign(user, this.jwtSecret, {expiresIn: '1h'})
        return {token: token, ...user}
    }

    // Validate a JWT
    validateToken(token: Token): User {
        try {
            // Decode and verify the token
            const decoded: any = jwt.verify(token.token, this.jwtSecret)
            logger.info(`decoded token: ${JSON.stringify(decoded)}`)
            if (!decoded) throw new InvalidTokenError()
            return validateSchema(userSchema, decoded)
        } catch (error) {
            // Handle token expiry error
            if (error instanceof jwt.TokenExpiredError) {
                throw new InvalidTokenError()
            }
            // Handle invalid token error
            if (error instanceof jwt.JsonWebTokenError) {
                throw new InvalidTokenError()
            }
            // Rethrow any other errors
            throw error
        }
    }
}
