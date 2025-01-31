export interface TokenGenerator {
  generateAccessToken(payload: any): string

  generateRefreshToken(payload: any): string

  generateResetToken(payload: any): string

  verifyAccessToken(token: string): any

  verifyRefreshToken(token: string): any

  verifyResetToken(token: string): any
}
