import { LoginInputData, RegisterInputData, RegisterOutput, Token, User } from '../schemas/AuthSchema'

export interface AuthService {
  register(data: RegisterInputData): Promise<RegisterOutput>
  login(data: LoginInputData): Promise<RegisterOutput>

  logout(token: Token): Promise<void>
  refreshToken(token: Omit<Token, 'accessToken'>): Promise<Token & { user: User }>

  validateToken(token: Omit<Token, 'refreshToken'>): Promise<User>
  forgotPassword(email: string): Promise<string>
  resetPassword(token: string, password: string): Promise<void>

  hasExpiration(token: string): boolean
}
