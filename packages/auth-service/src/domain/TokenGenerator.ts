export interface TokenGenerator {
  generateToken(payload: any): string

  verifyToken(token: string): any
}
