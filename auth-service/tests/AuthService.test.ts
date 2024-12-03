import {
    InvalidTokenError,
    UserAlreadyExistsError,
    UserNotFoundError,
    WrongPasswordError,
} from '../src/errors/AuthErrors'
import {AuthServiceImpl} from '../src/services/AuthServiceImpl'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import {AccountRepository} from '../src/repositories/AccountRepository'
import {LoginInputData, RegisterInputData, Token, User,} from '../src/schemas/AuthSchema'

jest.mock('bcrypt')
jest.mock('jsonwebtoken')
jest.mock('axios')

describe('AuthService', () => {
    let authService: AuthServiceImpl
    let mockAccountRepository: jest.Mocked<AccountRepository>
    const userServiceURL = 'http://user-service:3000/users'
    const jwtSecret = 'testSecret'

    beforeEach(() => {
        // Mock repository
        mockAccountRepository = {
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        }

        // Initialize AuthService with mocked dependencies
        authService = new AuthServiceImpl(
            userServiceURL,
            jwtSecret,
            mockAccountRepository
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    // Test for register
    it('should register a new user successfully', async () => {
        const userData: RegisterInputData = {
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User',
        }
        const hashedPassword = 'hashedPassword'
        const accountId = '123456789012345678901234'

        ;(axios.get as jest.Mock).mockResolvedValue({data: null}) // No user exists
        ;(bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword)
        mockAccountRepository.create.mockResolvedValue({
            id: accountId,
            pHash: hashedPassword,
        })
        ;(axios.post as jest.Mock).mockResolvedValue({
            data: {id: accountId, email: userData.email, name: userData.name},
        })
        ;(jwt.sign as jest.Mock).mockReturnValue('jsonwebtoken')

        const result = await authService.register(userData)

        expect(axios.get).toHaveBeenCalledWith(
            `${userServiceURL}/email/${userData.email}`
        )
        expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10)
        expect(mockAccountRepository.create).toHaveBeenCalledWith({
            pHash: hashedPassword,
        })
        expect(axios.post).toHaveBeenCalledWith(userServiceURL, {
            id: accountId,
            email: userData.email,
            name: userData.name,
        })
        expect(jwt.sign).toHaveBeenCalledWith(
            {id: accountId, email: userData.email, name: userData.name},
            jwtSecret,
            {expiresIn: '1h'}
        )
        expect(result).toHaveProperty('token', 'jsonwebtoken')
        expect(result).toHaveProperty('id', accountId)
        expect(result).toHaveProperty('email', userData.email)
        expect(result).toHaveProperty('name', userData.name)
    })

    it('should throw an error if the user already exists', async () => {
        const userData: RegisterInputData = {
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User',
            }

        ;(axios.get as jest.Mock).mockResolvedValue({
            data: {id: '123456789012345678901234', email: userData.email, name: userData.name},
        })

        await expect(authService.register(userData)).rejects.toThrow(
            new UserAlreadyExistsError(userData.email)
        )

        expect(axios.get).toHaveBeenCalledWith(
            `${userServiceURL}/email/${userData.email}`
        )
        expect(mockAccountRepository.create).not.toHaveBeenCalled()
        expect(axios.post).not.toHaveBeenCalled()
    })

    // Test for login
    it('should login a user successfully', async () => {
        const userData: LoginInputData = {
            email: 'test@example.com',
            password: 'password123',
        }
        const account = {
            id: '123456789012345678901234',
            pHash: 'hashedPassword',
        }
        const token = 'jsonwebtoken'

        ;(axios.get as jest.Mock).mockResolvedValue({
            data: {id: account.id, email: userData.email, name: 'Test User'},
        })
        mockAccountRepository.findById.mockResolvedValue(account)
        ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
        ;(jwt.sign as jest.Mock).mockReturnValue(token)

        const result = await authService.login(userData)

        expect(axios.get).toHaveBeenCalledWith(
            `${userServiceURL}/email/${userData.email}`
        )
        expect(mockAccountRepository.findById).toHaveBeenCalledWith(account.id)
        expect(bcrypt.compare).toHaveBeenCalledWith(
            userData.password,
            account.pHash
        )
        expect(jwt.sign).toHaveBeenCalledWith(
            {id: account.id, email: userData.email, name: 'Test User'},
            jwtSecret,
            {expiresIn: '1h'}
        )
        expect(result).toHaveProperty('token', token)
        expect(result).toHaveProperty('id', account.id)
        expect(result).toHaveProperty('email', userData.email)
        expect(result).toHaveProperty('name', 'Test User')
    })

    it('should throw an error if the user is not found', async () => {
        const userData: LoginInputData = {
                email: 'test@example.com',
                password: 'password123',
            }

        ;(axios.get as jest.Mock).mockResolvedValue({data: null})

        await expect(authService.login(userData)).rejects.toThrow(
            new UserNotFoundError(userData.email)
        )

        expect(axios.get).toHaveBeenCalledWith(
            `${userServiceURL}/email/${userData.email}`
        )
        expect(mockAccountRepository.findById).not.toHaveBeenCalled()
        expect(bcrypt.compare).not.toHaveBeenCalled()
        expect(jwt.sign).not.toHaveBeenCalled()
    })

    it('should throw an error if the password is invalid', async () => {
        const userData: LoginInputData = {
            email: 'test@example.com',
            password: 'password123',
        }
        const account = {
                id: '123456789012345678901234',
                pHash: 'hashedPassword',
            }

        ;(axios.get as jest.Mock).mockResolvedValue({
            data: {id: account.id, email: userData.email, name: 'Test User'},
        })
        mockAccountRepository.findById.mockResolvedValue(account)
        ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

        await expect(authService.login(userData)).rejects.toThrow(
            new WrongPasswordError()
        )

        expect(axios.get).toHaveBeenCalledWith(
            `${userServiceURL}/email/${userData.email}`
        )
        expect(mockAccountRepository.findById).toHaveBeenCalledWith(account.id)
        expect(bcrypt.compare).toHaveBeenCalledWith(
            userData.password,
            account.pHash
        )
        expect(jwt.sign).not.toHaveBeenCalled()
    })

    // Test for validateToken
    it('should validate a valid JWT', async () => {
        const token: Token = {token: 'validToken'}
        const decoded: User = {
                id: '000000000000000000000000',
                email: 'test@example.com',
                name: 'Test User',
            }

        ;(jwt.verify as jest.Mock).mockReturnValue(decoded)

        const result = authService.validateToken(token)

        expect(jwt.verify).toHaveBeenCalledWith(token.token, jwtSecret)
        expect(result).toEqual(decoded)
    })

    it('should throw an error for an invalid JWT', async () => {
        const token: Token = {token: 'invalidToken'}

        ;(jwt.verify as jest.Mock).mockImplementation(() => {
            throw new Error('Invalid token')
        })

        expect(() => authService.validateToken(token)).toThrow(
            new InvalidTokenError()
        )
        expect(jwt.verify).toHaveBeenCalledWith(token.token, jwtSecret)
    })
})
