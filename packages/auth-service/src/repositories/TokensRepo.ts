export interface TokensRepo {
  saveRefreshToken(token: string, userId: string): Promise<void>

  deleteRefreshToken(token: string): Promise<void>

  findRefreshToken(userId: string): Promise<string | null>

  saveResetToken(resetToken: string, id: string): Promise<void>

  findResetToken(userId: string): Promise<string | null>

  deleteResetToken(resetToken: string): Promise<void>

  blacklistToken(token: string, expiresAt: number): Promise<void>

  isTokenBlacklisted(token: string): Promise<boolean>
}
