import jwt from 'jsonwebtoken'
import { TokenGenerator } from '../domain/TokenGenerator'

export class JWTTokenGenerator implements TokenGenerator {
  constructor(private secret: string) {}

  generateToken = (payload: object): string => {
    return jwt.sign(payload, this.secret, { expiresIn: '1h' })
  }

  verifyToken = (token: string): any => {
    return jwt.verify(token, this.secret)
  }
}
