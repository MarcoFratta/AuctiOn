import jwt from 'jsonwebtoken'
import { TokenGenerator } from './TokenGenerator'

export class JWTTokenGenerator implements TokenGenerator {
  constructor(
    private accessTokenSecret: string,
    private refreshTokenSecret: string,
    private readonly expDays: number = 7
  ) {}

  generateAccessToken(payload: any): string {
    return jwt.sign(payload, this.accessTokenSecret, { expiresIn: '15m' })
  }

  generateRefreshToken(payload: any): string {
    return jwt.sign(payload, this.refreshTokenSecret, { expiresIn: `${this.expDays}d` })
  }

  verifyAccessToken(token: string): any {
    return jwt.verify(token, this.accessTokenSecret)
  }

  verifyRefreshToken(token: string): any {
    return jwt.verify(token, this.refreshTokenSecret)
  }
}
