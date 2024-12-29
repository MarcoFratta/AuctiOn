import {
    LoginInputData,
    RegisterInputData,
    RegisterOutput,
    Token,
    User,
} from '../schemas/AuthSchema'

export interface AuthService {
    register(data: RegisterInputData): Promise<RegisterOutput>

    login(data: LoginInputData): Promise<RegisterOutput>

    validateToken(token: Token): User
}
