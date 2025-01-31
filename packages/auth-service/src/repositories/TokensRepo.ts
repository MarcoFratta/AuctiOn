export interface TokensRepo {
  saveRefreshToken(token: string, userId: string): Promise<void>

  deleteRefreshToken(token: string): Promise<void>

  findRefreshToken(token: string): Promise<string | null>

  saveResetToken(resetToken: string, id: string): Promise<void>

  findResetToken(resetToken: string): Promise<string | null>

  deleteResetToken(resetToken: string): Promise<void>
}
