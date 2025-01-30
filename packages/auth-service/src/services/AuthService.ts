import { LoginInputData, RegisterInputData, RegisterOutput, Token, User } from '../schemas/AuthSchema'

export interface AuthService {
  register(data: RegisterInputData): Promise<RegisterOutput>

  login(data: LoginInputData): Promise<RegisterOutput>

  refreshToken(token: Omit<Token, 'accessToken'>): Promise<Token>

  validateToken(token: Omit<Token, 'refreshToken'>): User
}
