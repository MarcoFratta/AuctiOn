import jwt from 'jsonwebtoken'
import { TokenGenerator } from './TokenGenerator'

export class JWTTokenGenerator implements TokenGenerator {
  constructor(
    private accessTokenSecret: string,
    private refreshTokenSecret: string,
    private resetTokenSecret: string,
    private readonly refreshExpireDays: number = 7,
    private readonly accessExpireMinutes: number = 15,
    private readonly resetExpireMinutes: number = 15
  ) {}

  generateResetToken(payload: string | Buffer | object): string {
    return jwt.sign(payload, this.resetTokenSecret, { expiresIn: `${this.resetExpireMinutes}m` })
  }

  verifyResetToken(token: string) {
    return jwt.verify(token, this.resetTokenSecret)
  }

  generateAccessToken(payload: string | Buffer | object): string {
    return jwt.sign(payload, this.accessTokenSecret, { expiresIn: `${this.accessExpireMinutes}m` })
  }

  generateRefreshToken(payload: string | Buffer | object): string {
    return jwt.sign(payload, this.refreshTokenSecret, { expiresIn: `${this.refreshExpireDays}d` })
  }

  verifyAccessToken(token: string): jwt.JwtPayload | string {
    return jwt.verify(token, this.accessTokenSecret)
  }

  verifyRefreshToken(token: string): jwt.JwtPayload | string {
    return jwt.verify(token, this.refreshTokenSecret)
  }
}
