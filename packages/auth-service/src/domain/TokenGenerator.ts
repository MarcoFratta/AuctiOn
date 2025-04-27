import jwt from 'jsonwebtoken'

export interface TokenGenerator {
  generateAccessToken(payload: string | Buffer | object): string

  generateRefreshToken(payload: string | Buffer | object): string

  generateResetToken(payload: string | Buffer | object): string

  verifyAccessToken(token: string): jwt.JwtPayload | string

  verifyRefreshToken(token: string): jwt.JwtPayload | string

  verifyResetToken(token: string): jwt.JwtPayload | string
}
