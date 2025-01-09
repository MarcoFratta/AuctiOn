import { AuthenticatedRequest } from '../types/Index'
import { NextFunction, Response } from 'express'
import { UserNotAuthenticatedError } from '../errors/LobbyErrors'
import { config } from '../configs/config'
import { validateSchema } from '../utils/Validator'
import { userSchema } from '../schemas/User'

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (config.env == 'test') {
    req.user = req.body.user

    return next()
  }
  try {
    const userId = validateSchema(userSchema, req.user?.id)
    if (!userId) {
      throw new UserNotAuthenticatedError()
    }

    next()
  } catch (error) {
    next(new UserNotAuthenticatedError())
  }
}
