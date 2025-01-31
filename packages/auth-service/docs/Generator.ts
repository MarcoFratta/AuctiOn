import { OpenApiGeneratorV31, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
  forgotPasswordSchema,
  loginSchema,
  registerOutput,
  registerSchema,
  resetPasswordSchema,
} from '../src/schemas/AuthSchema'

export const registry = new OpenAPIRegistry()

export function generateOpenAPI() {
  const config = {
    openapi: '3.1.0',
    info: {
      version: '1.0.0',
      title: 'Auth service',
      description: 'Authentication service API',
    },
  } // your config comes here
  registry.register('login', loginSchema)
  registry.register('register', registerSchema)
  registry.register('forgotPassword', forgotPasswordSchema)
  registry.register('resetPassword', resetPasswordSchema)
  registry.register('registerOutput', registerOutput.omit({ refreshToken: true }))
  return new OpenApiGeneratorV31(registry.definitions).generateDocument(config)
}
