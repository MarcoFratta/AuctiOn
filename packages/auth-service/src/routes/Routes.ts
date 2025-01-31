import { Router } from 'express'
import { AuthController } from '../controllers/AuthController'
import { validateRequestBody, validateRequestParams } from '../middlewares/ValidationMiddleware'
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from '../schemas/AuthSchema'
import { AuthErrorMiddleware, ErrorLoggerMiddleware, GenericErrorMiddleware } from '../middlewares/ErrorsMiddleware'

export const createRouter = (c: AuthController) => {
  const router = Router()
  router.post('/login', validateRequestBody(loginSchema), c.login)
  router.post('/register', validateRequestBody(registerSchema), c.register)
  router.post('/refresh', c.refreshToken)
  router.post('/validate', c.validateToken)
  router.post('/forgot/:email', validateRequestParams(forgotPasswordSchema), c.forgotPassword)
  router.post('/reset', validateRequestBody(resetPasswordSchema), c.resetPassword)
  router.use(ErrorLoggerMiddleware)
  router.use(AuthErrorMiddleware)
  router.use(GenericErrorMiddleware)
  return router
}
export default createRouter
