import { AuthenticatedRequest } from '../types/Index'
import { NextFunction, Response } from 'express'
import { UserNotAuthenticatedError } from '../errors/LobbyErrors'
import { config } from '../configs/config'
import { validateSchema } from '@auction/common/validation'
import { userSchema } from '../schemas/User'

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (config.env == 'test') {
    req.user = req.body.user

    return next()
  }
  try {
    const v = JSON.parse(req.headers['x-user'] as string)
    const user = validateSchema(userSchema, v)
    if (!user) {
      throw new UserNotAuthenticatedError()
    }
    req.user = user
    next()
  } catch (error) {
    next(new UserNotAuthenticatedError())
  }
}
