import {
    LoginInputData,
    loginSchema,
    RegisterInputData,
    registerSchema,
    Token,
    tokenSchema,
    User,
    userSchema,
} from '../src/schemas/AuthSchema'
import {validateSchema, ValidationError} from '../src/utils/Validator' // Adjust the import path

describe('AuthSchema Validation with Helper', () => {
    describe('registerSchema', () => {
        it('should validate a correct registration input', () => {
            const input: RegisterInputData = {
                email: 'test@example.com',
                name: 'Test User',
                password: 'Password1',
            }

            const result = validateSchema(registerSchema, input)

            expect(result).toEqual(input)
        })

        it('should fail if email is invalid', () => {
            const input = {
                email: 'invalid-email',
                name: 'Test User',
                password: 'Password1',
            }

            expect(() => validateSchema(registerSchema, input)).toThrow(
                ValidationError
            )
        })

        it('should fail if password does not meet requirements', () => {
            const input = {
                email: 'test@example.com',
                name: 'Test User',
                password: 'short',
            }

            expect(() => validateSchema(registerSchema, input)).toThrow(
                ValidationError
            )
        })

        it('should fail if name is empty', () => {
            const input = {
                email: 'test@example.com',
                name: '',
                password: 'Password1',
            }

            expect(() => validateSchema(registerSchema, input)).toThrow(
                ValidationError
            )
        })
    })

    describe('loginSchema', () => {
        it('should validate a correct login input', () => {
            const input: LoginInputData = {
                email: 'test@example.com',
                password: 'Password1',
            }

            const result = validateSchema(loginSchema, input)

            expect(result).toEqual(input)
        })

        it('should fail if email is invalid', () => {
            const input = {
                email: 'invalid-email',
                password: 'Password1',
            }

            expect(() => validateSchema(loginSchema, input)).toThrow(
                ValidationError
            )
        })

        it('should fail if password is too short', () => {
            const input = {
                email: 'test@example.com',
                password: 'short',
            }

            expect(() => validateSchema(loginSchema, input)).toThrow(
                ValidationError
            )
        })
    })

    describe('registeredUser', () => {
        it('should validate a correct registered user', () => {
            const input: User = {
                id: '123456789012345678901234',
                email: 'test@example.com',
                name: 'Test User',
            }

            const result = validateSchema(userSchema, input)

            expect(result).toEqual(input)
        })

        it('should fail if id is missing', () => {
            const input = {
                email: 'test@example.com',
                name: 'Test User',
            }

            expect(() => validateSchema(userSchema, input)).toThrow(
                ValidationError
            )
        })

        it('should fail if id is not valid', () => {
            const input = {
                id: '123',
                email: 'test@example.com',
                name: 'Test User',
            }

            expect(() => validateSchema(userSchema, input)).toThrow(
                ValidationError
            )
        })
    })

    describe('tokenSchema', () => {
        it('should validate a correct token', () => {
            const input: Token = {token: 'valid-token'}

            const result = validateSchema(tokenSchema, input)

            expect(result).toEqual(input)
        })

        it('should fail if token is missing', () => {
            const input = {}

            expect(() => validateSchema(tokenSchema, input)).toThrow(
                ValidationError
            )
        })
    })
})
