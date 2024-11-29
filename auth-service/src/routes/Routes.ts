import {Router} from 'express'
import {AuthController} from '../controllers/AuthController'
import {validateRequestBody} from '../middlewares/ValidationMiddleware'
import {loginSchema, registerSchema} from '../schemas/AuthSchema'
import {AuthErrorMiddleware, ErrorLoggerMiddleware, GenericErrorMiddleware,} from '../middlewares/ErrorsMiddleware'

export const createRouter = (c: AuthController) => {
    const router = Router()
    router.post(
        '/login',
        validateRequestBody(loginSchema),
        c.login,
        ErrorLoggerMiddleware,
        AuthErrorMiddleware,
        GenericErrorMiddleware
    )
    router.post(
        '/register',
        validateRequestBody(registerSchema),
        c.register,
        ErrorLoggerMiddleware,
        AuthErrorMiddleware,
        GenericErrorMiddleware
    )
    router.post(
        '/validate',
        c.validateToken,
        ErrorLoggerMiddleware,
        AuthErrorMiddleware,
        GenericErrorMiddleware
    )
    return router
}
export default createRouter
