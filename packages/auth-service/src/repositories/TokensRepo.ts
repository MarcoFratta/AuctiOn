export interface TokensRepo {
  saveRefreshToken(token: string, userId: string): Promise<void>

  deleteRefreshToken(token: string): Promise<void>

  findRefreshToken(token: string): Promise<string | null>
}
